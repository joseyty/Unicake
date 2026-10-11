from __future__ import annotations

from decimal import ROUND_HALF_UP, Decimal

from database.conexao import get_connection
from utils.validacoes import (
    normalizar_cupom,
    validar_email,
    validar_metodo_pagamento,
    validar_nome,
    validar_quantidade,
    validar_status_pedido,
)

# Mesmas regras de entrega do carrinho do site (assets/js/cart.js)
TAXA_ENTREGA = Decimal("5.00")
FRETE_GRATIS_ACIMA_DE = Decimal("120.00")
ZERO = Decimal("0.00")


class PedidoService:
    @staticmethod
    def criar_pedido(cliente_id: int, endereco_id: int, observacoes: str = None, metodo_pagamento: str = None) -> dict:
        metodo = validar_metodo_pagamento(metodo_pagamento) if metodo_pagamento is not None else None
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT id FROM cliente WHERE id = ?", (cliente_id,))
                if cursor.fetchone() is None:
                    raise ValueError("Cliente não encontrado.")

                cursor.execute("SELECT id FROM endereco WHERE id = ? AND cliente_id = ?", (endereco_id, cliente_id))
                if cursor.fetchone() is None:
                    raise ValueError("Endereço do cliente inválido.")

                cursor.execute(
                    "SELECT ic.produto_id, ic.quantidade, p.nome, p.preco, p.estoque, p.status "
                    "FROM item_carrinho ic "
                    "INNER JOIN produto p WITH (UPDLOCK, ROWLOCK) ON p.id = ic.produto_id "
                    "INNER JOIN carrinho c ON c.id = ic.carrinho_id "
                    "WHERE c.cliente_id = ? "
                    "ORDER BY p.id ASC",
                    (cliente_id,),
                )
                itens = cursor.fetchall()
                if not itens:
                    raise ValueError("Pedido precisa ter pelo menos um item.")

                PedidoService._validar_itens(itens)
                total = PedidoService._somar_itens(itens)

                pedido_id = PedidoService._gravar_pedido(
                    cursor,
                    cliente_id=cliente_id,
                    endereco_id=endereco_id,
                    itens=itens,
                    subtotal=total,
                    desconto=ZERO,
                    taxa_entrega=ZERO,
                    cupom_codigo=None,
                    valor_total=total,
                    observacoes=observacoes,
                    metodo_pagamento=metodo,
                )

                cursor.execute("DELETE FROM item_carrinho WHERE carrinho_id IN (SELECT id FROM carrinho WHERE cliente_id = ?)", (cliente_id,))
                conn.commit()

                return PedidoService._carregar(cursor, pedido_id)
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def registrar_compra(nome: str, email: str, itens: list[dict], metodo_pagamento: str, cupom: str = None, observacoes: str = None) -> dict:
        """Grava uma compra feita pelo site: cliente, pedido, itens e pagamento em uma única transação.

        Cada item é {"codigo": <id do produto no site>, "quantidade": <int>}. Preços, cupom e
        entrega são calculados aqui, a partir do banco, e não dos valores enviados pelo navegador.
        """
        nome = validar_nome(nome, "nome do cliente")
        email = validar_email(email).lower()
        metodo = validar_metodo_pagamento(metodo_pagamento)

        quantidades: dict[str, int] = {}
        for item in itens or []:
            if not isinstance(item, dict):
                raise ValueError("Item do pedido inválido.")
            codigo = str(item.get('codigo') or "").strip()
            if not codigo:
                raise ValueError("Item do pedido sem código de produto.")
            quantidades[codigo] = quantidades.get(codigo, 0) + validar_quantidade(item.get('quantidade'))
        if not quantidades:
            raise ValueError("Pedido precisa ter pelo menos um item.")

        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT id FROM cliente WITH (UPDLOCK, HOLDLOCK) WHERE email = ?", (email,))
                cliente = cursor.fetchone()
                if cliente is None:
                    cursor.execute("INSERT INTO cliente (nome, email) OUTPUT INSERTED.id VALUES (?, ?)", (nome, email))
                    cliente = cursor.fetchone()
                cliente_id = cliente['id']

                itens_pedido = []
                for codigo in sorted(quantidades):
                    cursor.execute(
                        "SELECT id AS produto_id, nome, preco, estoque, status FROM produto WITH (UPDLOCK, ROWLOCK) WHERE codigo = ?",
                        (codigo,),
                    )
                    produto = cursor.fetchone()
                    if produto is None:
                        raise ValueError(f"Produto não encontrado: {codigo}")
                    produto['quantidade'] = quantidades[codigo]
                    itens_pedido.append(produto)

                PedidoService._validar_itens(itens_pedido)
                subtotal = PedidoService._somar_itens(itens_pedido)
                cupom_codigo, desconto, frete_gratis = PedidoService._aplicar_cupom(cursor, cupom, subtotal)
                taxa_entrega = ZERO if frete_gratis or subtotal > FRETE_GRATIS_ACIMA_DE else TAXA_ENTREGA
                valor_total = max(ZERO, subtotal - desconto + taxa_entrega)

                pedido_id = PedidoService._gravar_pedido(
                    cursor,
                    cliente_id=cliente_id,
                    endereco_id=None,
                    itens=itens_pedido,
                    subtotal=subtotal,
                    desconto=desconto,
                    taxa_entrega=taxa_entrega,
                    cupom_codigo=cupom_codigo,
                    valor_total=valor_total,
                    observacoes=observacoes,
                    metodo_pagamento=metodo,
                )
                conn.commit()

                return PedidoService._carregar(cursor, pedido_id)
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def _validar_itens(itens: list[dict]) -> None:
        for item in itens:
            if item['status'] != 'ATIVO':
                raise ValueError(f"Produto inativo: {item['nome']}")
            if item['quantidade'] <= 0:
                raise ValueError(f"Quantidade inválida para produto: {item['nome']}")
            if item['estoque'] < item['quantidade']:
                raise ValueError(f"Estoque insuficiente para {item['nome']}")

    @staticmethod
    def _somar_itens(itens: list[dict]) -> Decimal:
        total = ZERO
        for item in itens:
            total += item['preco'] * int(item['quantidade'])
        return total

    @staticmethod
    def _aplicar_cupom(cursor, cupom: str, subtotal: Decimal) -> tuple:
        """Retorna (codigo aplicado ou None, desconto, frete_gratis)."""
        codigo = normalizar_cupom(cupom)
        if not codigo:
            return None, ZERO, False

        cursor.execute(
            "SELECT codigo, tipo, valor, frete_gratis, subtotal_minimo FROM cupom WHERE codigo = ? AND ativo = 1",
            (codigo,),
        )
        row = cursor.fetchone()
        if row is None:
            raise ValueError("Cupom inválido.")
        # Abaixo do mínimo o cupom simplesmente não é aplicado, como no carrinho do site
        if subtotal < row['subtotal_minimo']:
            return None, ZERO, False

        desconto = ZERO
        if row['tipo'] == 'PERCENTUAL':
            desconto = (subtotal * row['valor'] / 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        elif row['tipo'] == 'FIXO':
            desconto = min(row['valor'], subtotal)
        frete_gratis = bool(row['frete_gratis']) or row['tipo'] == 'FRETE_GRATIS'
        return row['codigo'], desconto, frete_gratis

    @staticmethod
    def _gravar_pedido(cursor, cliente_id, endereco_id, itens, subtotal, desconto, taxa_entrega, cupom_codigo, valor_total, observacoes, metodo_pagamento) -> int:
        cursor.execute(
            "INSERT INTO pedido (cliente_id, endereco_id, subtotal, desconto, taxa_entrega, cupom_codigo, valor_total, status, observacoes) "
            "OUTPUT INSERTED.id VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (cliente_id, endereco_id, subtotal, desconto, taxa_entrega, cupom_codigo, valor_total, 'PENDENTE', observacoes),
        )
        pedido_id = cursor.fetchone()['id']

        for item in itens:
            quantidade = int(item['quantidade'])
            cursor.execute(
                "INSERT INTO item_pedido (pedido_id, produto_id, nome_produto, quantidade, preco_unitario, subtotal) VALUES (?, ?, ?, ?, ?, ?)",
                (pedido_id, item['produto_id'], item['nome'], quantidade, item['preco'], item['preco'] * quantidade),
            )
            cursor.execute(
                "UPDATE produto SET estoque = estoque - ? WHERE id = ? AND estoque >= ?",
                (quantidade, item['produto_id'], quantidade),
            )
            if cursor.rowcount != 1:
                raise ValueError(f"Estoque insuficiente para {item['nome']}")

        if metodo_pagamento is not None:
            cursor.execute(
                "INSERT INTO pagamento (pedido_id, metodo, valor, status) VALUES (?, ?, ?, ?)",
                (pedido_id, metodo_pagamento, valor_total, 'PENDENTE'),
            )
        return pedido_id

    @staticmethod
    def _carregar(cursor, pedido_id: int) -> dict:
        cursor.execute("SELECT * FROM pedido WHERE id = ?", (pedido_id,))
        pedido = cursor.fetchone()
        if pedido is None:
            raise ValueError("Pedido não encontrado.")
        cursor.execute("SELECT * FROM item_pedido WHERE pedido_id = ? ORDER BY id ASC", (pedido_id,))
        itens = cursor.fetchall()
        cursor.execute("SELECT * FROM pagamento WHERE pedido_id = ? ORDER BY id ASC", (pedido_id,))
        pagamentos = cursor.fetchall()
        return {"pedido": pedido, "itens": itens, "pagamentos": pagamentos}

    @staticmethod
    def listar_pedidos() -> list[dict]:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT * FROM pedido ORDER BY id ASC")
                pedidos = cursor.fetchall()
                return pedidos
        finally:
            conn.close()

    @staticmethod
    def listar_por_cliente(cliente_id: int) -> list[dict]:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT * FROM pedido WHERE cliente_id = ? ORDER BY id DESC", (cliente_id,))
                return cursor.fetchall()
        finally:
            conn.close()

    @staticmethod
    def buscar_por_id(pedido_id: int) -> dict:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                return PedidoService._carregar(cursor, pedido_id)
        finally:
            conn.close()

    @staticmethod
    def atualizar_status(pedido_id: int, novo_status: str) -> dict:
        status = validar_status_pedido(novo_status)
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT status FROM pedido WITH (UPDLOCK, ROWLOCK) WHERE id = ?", (pedido_id,))
                pedido = cursor.fetchone()
                if pedido is None:
                    raise ValueError("Pedido não encontrado.")

                status_atual = pedido['status']
                transicoes_validas = {
                    'PENDENTE': {'CONFIRMADO', 'CANCELADO'},
                    'CONFIRMADO': {'EM_PREPARACAO', 'CANCELADO'},
                    'EM_PREPARACAO': {'PRONTO', 'CANCELADO'},
                    'PRONTO': {'SAIU_PARA_ENTREGA', 'CANCELADO'},
                    'SAIU_PARA_ENTREGA': {'ENTREGUE', 'CANCELADO'},
                    'ENTREGUE': set(),
                    'CANCELADO': set(),
                }
                if status not in transicoes_validas.get(status_atual, set()):
                    raise ValueError(f"Transição de status inválida: {status_atual} -> {status}")

                if status == 'CANCELADO':
                    PedidoService._desfazer_pedido(cursor, pedido_id)

                cursor.execute("UPDATE pedido SET status = ?, data_atualizacao = SYSDATETIME() WHERE id = ?", (status, pedido_id))
                conn.commit()
                cursor.execute("SELECT * FROM pedido WHERE id = ?", (pedido_id,))
                pedido_atualizado = cursor.fetchone()
            return pedido_atualizado
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def _desfazer_pedido(cursor, pedido_id: int) -> None:
        """Devolve o estoque dos itens e encerra os pagamentos de um pedido que está sendo cancelado."""
        cursor.execute(
            "SELECT produto_id, quantidade FROM item_pedido WHERE pedido_id = ? ORDER BY produto_id ASC",
            (pedido_id,),
        )
        itens = cursor.fetchall()
        for item in itens:
            cursor.execute("UPDATE produto SET estoque = estoque + ? WHERE id = ?", (item['quantidade'], item['produto_id']))

        cursor.execute(
            "UPDATE pagamento SET status = CASE status WHEN 'APROVADO' THEN 'ESTORNADO' ELSE 'CANCELADO' END, "
            "data_atualizacao = SYSDATETIME() WHERE pedido_id = ? AND status IN ('PENDENTE', 'APROVADO')",
            (pedido_id,),
        )

    @staticmethod
    def cancelar_pedido(pedido_id: int) -> dict:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT status FROM pedido WITH (UPDLOCK, ROWLOCK) WHERE id = ?", (pedido_id,))
                pedido = cursor.fetchone()
                if pedido is None:
                    raise ValueError("Pedido não encontrado.")
                if pedido['status'] == 'CANCELADO':
                    raise ValueError("Pedido já está cancelado.")
                if pedido['status'] == 'ENTREGUE':
                    raise ValueError("Pedido entregue não pode ser cancelado.")

                PedidoService._desfazer_pedido(cursor, pedido_id)

                cursor.execute("UPDATE pedido SET status = ?, data_atualizacao = SYSDATETIME() WHERE id = ?", ('CANCELADO', pedido_id))
                conn.commit()
                cursor.execute("SELECT * FROM pedido WHERE id = ?", (pedido_id,))
                pedido_cancelado = cursor.fetchone()
            return pedido_cancelado
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
