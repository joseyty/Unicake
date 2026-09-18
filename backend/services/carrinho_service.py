from __future__ import annotations

from database.conexao import get_connection
from models.carrinho import Carrinho
from models.produto import Produto
from services.produto_service import ProdutoService
from utils.validacoes import validar_quantidade


class CarrinhoService:
    @staticmethod
    def criar_ou_obter(cliente_id: int) -> Carrinho:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT * FROM carrinho WHERE cliente_id = %s", (cliente_id,))
                row = cursor.fetchone()
                if row:
                    return Carrinho(**row)

                cursor.execute("INSERT INTO carrinho (cliente_id) VALUES (%s)", (cliente_id,))
                conn.commit()
                carrinho_id = cursor.lastrowid
                cursor.execute("SELECT * FROM carrinho WHERE id = %s", (carrinho_id,))
                row = cursor.fetchone()
            if row is None:
                raise ValueError("Carrinho não foi criado.")
            return Carrinho(**row)
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def listar_itens(cliente_id: int) -> list[dict]:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    """
                    SELECT ic.id, ic.carrinho_id, ic.produto_id, p.nome, ic.quantidade, ic.preco_unitario, ic.subtotal
                    FROM item_carrinho ic
                    INNER JOIN carrinho c ON c.id = ic.carrinho_id
                    INNER JOIN produto p ON p.id = ic.produto_id
                    WHERE c.cliente_id = %s
                    ORDER BY ic.id ASC
                    """,
                    (cliente_id,),
                )
                return cursor.fetchall()
        finally:
            conn.close()

    @staticmethod
    def adicionar_produto(cliente_id: int, produto_id: int, quantidade: int) -> dict:
        quantidade = validar_quantidade(quantidade)
        produto = ProdutoService.buscar_por_id(produto_id)
        if produto.status != 'ATIVO':
            raise ValueError("Produto inativo não pode ser adicionado ao carrinho.")
        if produto.estoque < quantidade:
            raise ValueError("Quantidade indisponível em estoque.")

        carrinho = CarrinhoService.criar_ou_obter(cliente_id)

        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "SELECT * FROM item_carrinho WHERE carrinho_id = %s AND produto_id = %s",
                    (carrinho.id, produto_id),
                )
                item = cursor.fetchone()

                if item is None:
                    subtotal = float(produto.preco) * quantidade
                    cursor.execute(
                        "INSERT INTO item_carrinho (carrinho_id, produto_id, quantidade, preco_unitario, subtotal) VALUES (%s, %s, %s, %s, %s)",
                        (carrinho.id, produto_id, quantidade, produto.preco, subtotal),
                    )
                else:
                    nova_quantidade = int(item['quantidade']) + quantidade
                    if produto.estoque < nova_quantidade:
                        raise ValueError("Quantidade total no carrinho excede o estoque disponível.")
                    novo_subtotal = float(produto.preco) * nova_quantidade
                    cursor.execute(
                        "UPDATE item_carrinho SET quantidade = %s, preco_unitario = %s, subtotal = %s WHERE id = %s",
                        (nova_quantidade, produto.preco, novo_subtotal, item['id']),
                    )
                conn.commit()
                cursor.execute(
                    "SELECT * FROM item_carrinho WHERE carrinho_id = %s AND produto_id = %s",
                    (carrinho.id, produto_id),
                )
                result = cursor.fetchone()
            if result is None:
                raise ValueError("Produto não foi adicionado ao carrinho.")
            return result
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def remover_produto(cliente_id: int, produto_id: int) -> None:
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "DELETE ic FROM item_carrinho ic INNER JOIN carrinho c ON c.id = ic.carrinho_id WHERE c.cliente_id = %s AND ic.produto_id = %s",
                    (cliente_id, produto_id),
                )
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def alterar_quantidade(cliente_id: int, produto_id: int, quantidade: int) -> dict:
        quantidade = validar_quantidade(quantidade)
        produto = ProdutoService.buscar_por_id(produto_id)
        if produto.status != 'ATIVO':
            raise ValueError("Produto inativo não pode estar no carrinho.")

        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "SELECT ic.* FROM item_carrinho ic INNER JOIN carrinho c ON c.id = ic.carrinho_id WHERE c.cliente_id = %s AND ic.produto_id = %s",
                    (cliente_id, produto_id),
                )
                item = cursor.fetchone()
                if item is None:
                    raise ValueError("Produto não encontrado no carrinho.")
                if produto.estoque < quantidade:
                    raise ValueError("Quantidade maior do que o estoque disponível.")
                subtotal = float(produto.preco) * quantidade
                cursor.execute(
                    "UPDATE item_carrinho SET quantidade = %s, preco_unitario = %s, subtotal = %s WHERE id = %s",
                    (quantidade, produto.preco, subtotal, item['id']),
                )
                conn.commit()
                cursor.execute("SELECT * FROM item_carrinho WHERE id = %s", (item['id'],))
                result = cursor.fetchone()
            return result
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def subtotal(cliente_id: int) -> float:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "SELECT COALESCE(SUM(subtotal), 0) AS total FROM item_carrinho ic INNER JOIN carrinho c ON c.id = ic.carrinho_id WHERE c.cliente_id = %s",
                    (cliente_id,),
                )
                row = cursor.fetchone()
            return float(row['total']) if row and row['total'] is not None else 0.0
        finally:
            conn.close()

    @staticmethod
    def total(cliente_id: int) -> float:
        return CarrinhoService.subtotal(cliente_id)

    @staticmethod
    def limpar(cliente_id: int) -> None:
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "DELETE ic FROM item_carrinho ic INNER JOIN carrinho c ON c.id = ic.carrinho_id WHERE c.cliente_id = %s",
                    (cliente_id,),
                )
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
