from __future__ import annotations

from database.conexao import get_connection
from services.carrinho_service import CarrinhoService
from services.produto_service import ProdutoService
from utils.validacoes import validar_status_pedido


class PedidoService:
    @staticmethod
    def criar_pedido(cliente_id: int, endereco_id: int, observacoes: str = None) -> dict:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT id FROM cliente WHERE id = %s", (cliente_id,))
                if cursor.fetchone() is None:
                    raise ValueError("Cliente não encontrado.")

                cursor.execute("SELECT id FROM endereco WHERE id = %s AND cliente_id = %s", (endereco_id, cliente_id))
                if cursor.fetchone() is None:
                    raise ValueError("Endereço do cliente inválido.")

                cursor.execute(
                    "SELECT ic.produto_id, ic.quantidade, p.nome, p.preco, p.estoque, p.status "
                    "FROM item_carrinho ic "
                    "INNER JOIN produto p ON p.id = ic.produto_id "
                    "INNER JOIN carrinho c ON c.id = ic.carrinho_id "
                    "WHERE c.cliente_id = %s",
                    (cliente_id,),
                )
                itens = cursor.fetchall()
                if not itens:
                    raise ValueError("Pedido precisa ter pelo menos um item.")

                for item in itens:
                    if item['status'] != 'ATIVO':
                        raise ValueError(f"Produto inativo: {item['nome']}")
                    if item['quantidade'] <= 0:
                        raise ValueError(f"Quantidade inválida para produto: {item['nome']}")
                    if item['estoque'] < item['quantidade']:
                        raise ValueError(f"Estoque insuficiente para {item['nome']}")

                total = 0.0
                for item in itens:
                    total += float(item['preco']) * int(item['quantidade'])

                cursor.execute(
                    "INSERT INTO pedido (cliente_id, endereco_id, valor_total, status, observacoes) VALUES (%s, %s, %s, %s, %s)",
                    (cliente_id, endereco_id, total, 'PENDENTE', observacoes),
                )
                pedido_id = cursor.lastrowid

                for item in itens:
                    subtotal = float(item['preco']) * int(item['quantidade'])
                    cursor.execute(
                        "INSERT INTO item_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal) VALUES (%s, %s, %s, %s, %s)",
                        (pedido_id, item['produto_id'], item['quantidade'], item['preco'], subtotal),
                    )
                    cursor.execute(
                        "UPDATE produto SET estoque = estoque - %s WHERE id = %s",
                        (item['quantidade'], item['produto_id']),
                    )

                cursor.execute("DELETE FROM item_carrinho WHERE carrinho_id IN (SELECT id FROM carrinho WHERE cliente_id = %s)", (cliente_id,))
                conn.commit()

                cursor.execute("SELECT * FROM pedido WHERE id = %s", (pedido_id,))
                pedido = cursor.fetchone()
                cursor.execute("SELECT * FROM item_pedido WHERE pedido_id = %s ORDER BY id ASC", (pedido_id,))
                itens_pedido = cursor.fetchall()

            return {"pedido": pedido, "itens": itens_pedido}
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

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
    def buscar_por_id(pedido_id: int) -> dict:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT * FROM pedido WHERE id = %s", (pedido_id,))
                pedido = cursor.fetchone()
                if pedido is None:
                    raise ValueError("Pedido não encontrado.")
                cursor.execute("SELECT * FROM item_pedido WHERE pedido_id = %s ORDER BY id ASC", (pedido_id,))
                itens = cursor.fetchall()
            return {"pedido": pedido, "itens": itens}
        finally:
            conn.close()

    @staticmethod
    def atualizar_status(pedido_id: int, novo_status: str) -> dict:
        status = validar_status_pedido(novo_status)
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT status FROM pedido WHERE id = %s", (pedido_id,))
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

                cursor.execute("UPDATE pedido SET status = %s WHERE id = %s", (status, pedido_id))
                conn.commit()
                cursor.execute("SELECT * FROM pedido WHERE id = %s", (pedido_id,))
                pedido_atualizado = cursor.fetchone()
            return pedido_atualizado
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def cancelar_pedido(pedido_id: int) -> dict:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT status FROM pedido WHERE id = %s", (pedido_id,))
                pedido = cursor.fetchone()
                if pedido is None:
                    raise ValueError("Pedido não encontrado.")
                if pedido['status'] == 'CANCELADO':
                    raise ValueError("Pedido já está cancelado.")

                cursor.execute("SELECT produto_id, quantidade FROM item_pedido WHERE pedido_id = %s", (pedido_id,))
                itens = cursor.fetchall()
                for item in itens:
                    cursor.execute("UPDATE produto SET estoque = estoque + %s WHERE id = %s", (item['quantidade'], item['produto_id']))

                cursor.execute("UPDATE pedido SET status = %s WHERE id = %s", ('CANCELADO', pedido_id))
                conn.commit()
                cursor.execute("SELECT * FROM pedido WHERE id = %s", (pedido_id,))
                pedido_cancelado = cursor.fetchone()
            return pedido_cancelado
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
