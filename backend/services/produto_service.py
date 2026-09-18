from __future__ import annotations

from database.conexao import get_connection
from models.produto import Produto
from utils.validacoes import validar_nome, validar_preco, validar_estoque


class ProdutoService:
    @staticmethod
    def criar(categoria_id: int, nome: str, descricao: str = None, preco: float = 0, estoque: int = 0, status: str = 'ATIVO') -> Produto:
        nome = validar_nome(nome, "nome do produto")
        preco = validar_preco(preco)
        estoque = validar_estoque(estoque)
        status = str(status or 'ATIVO').upper()
        if status not in {'ATIVO', 'INATIVO'}:
            raise ValueError("Status do produto inválido.")

        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "SELECT id FROM categoria WHERE id = %s",
                    (categoria_id,),
                )
                if cursor.fetchone() is None:
                    raise ValueError("Categoria não encontrada.")

                cursor.execute(
                    "INSERT INTO produto (categoria_id, nome, descricao, preco, estoque, status) VALUES (%s, %s, %s, %s, %s, %s)",
                    (categoria_id, nome, descricao, preco, estoque, status),
                )
                conn.commit()
                produto_id = cursor.lastrowid
                cursor.execute("SELECT * FROM produto WHERE id = %s", (produto_id,))
                row = cursor.fetchone()
            if row is None:
                raise ValueError("Produto não foi criado.")
            return Produto(**row)
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def listar() -> list[Produto]:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT * FROM produto ORDER BY id ASC")
                rows = cursor.fetchall()
            return [Produto(**row) for row in rows]
        finally:
            conn.close()

    @staticmethod
    def buscar_por_id(produto_id: int) -> Produto:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT * FROM produto WHERE id = %s", (produto_id,))
                row = cursor.fetchone()
            if row is None:
                raise ValueError("Produto não encontrado.")
            return Produto(**row)
        finally:
            conn.close()

    @staticmethod
    def atualizar(produto_id: int, categoria_id: int = None, nome: str = None, descricao: str = None, preco: float = None, estoque: int = None, status: str = None) -> Produto:
        produto = ProdutoService.buscar_por_id(produto_id)

        novo_categoria_id = produto.categoria_id if categoria_id is None else categoria_id
        novo_nome = produto.nome if nome is None else validar_nome(nome, "nome do produto")
        nova_descricao = produto.descricao if descricao is None else descricao
        novo_preco = produto.preco if preco is None else validar_preco(preco)
        novo_estoque = produto.estoque if estoque is None else validar_estoque(estoque)
        novo_status = produto.status if status is None else str(status).upper()

        if novo_status not in {'ATIVO', 'INATIVO'}:
            raise ValueError("Status do produto inválido.")

        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                if novo_categoria_id is not None:
                    cursor.execute("SELECT id FROM categoria WHERE id = %s", (novo_categoria_id,))
                    if cursor.fetchone() is None:
                        raise ValueError("Categoria não encontrada.")

                cursor.execute(
                    "UPDATE produto SET categoria_id = %s, nome = %s, descricao = %s, preco = %s, estoque = %s, status = %s WHERE id = %s",
                    (novo_categoria_id, novo_nome, nova_descricao, novo_preco, novo_estoque, novo_status, produto_id),
                )
                conn.commit()
                cursor.execute("SELECT * FROM produto WHERE id = %s", (produto_id,))
                row = cursor.fetchone()
            if row is None:
                raise ValueError("Produto não encontrado após atualização.")
            return Produto(**row)
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def excluir(produto_id: int) -> None:
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM produto WHERE id = %s", (produto_id,))
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def alterar_preco(produto_id: int, novo_preco: float) -> Produto:
        preco = validar_preco(novo_preco)
        produto = ProdutoService.buscar_por_id(produto_id)
        produto.preco = preco
        return ProdutoService.atualizar(produto_id, preco=preco)

    @staticmethod
    def alterar_estoque(produto_id: int, novo_estoque: int) -> Produto:
        estoque = validar_estoque(novo_estoque)
        produto = ProdutoService.buscar_por_id(produto_id)
        produto.estoque = estoque
        return ProdutoService.atualizar(produto_id, estoque=estoque)

    @staticmethod
    def ativar(produto_id: int) -> Produto:
        return ProdutoService.atualizar(produto_id, status='ATIVO')

    @staticmethod
    def desativar(produto_id: int) -> Produto:
        return ProdutoService.atualizar(produto_id, status='INATIVO')
