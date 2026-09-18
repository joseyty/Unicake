from __future__ import annotations

from database.conexao import get_connection
from models.categoria import Categoria
from utils.validacoes import validar_nome


class CategoriaService:
    @staticmethod
    def criar(nome: str, descricao: str = None, ativo: bool = True) -> Categoria:
        nome = validar_nome(nome, "nome da categoria")
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "INSERT INTO categoria (nome, descricao, ativo) VALUES (%s, %s, %s)",
                    (nome, descricao, int(bool(ativo))),
                )
                conn.commit()
                categoria_id = cursor.lastrowid
                cursor.execute("SELECT * FROM categoria WHERE id = %s", (categoria_id,))
                result = cursor.fetchone()
            if not result:
                raise ValueError("Categoria não foi criada.")
            return Categoria(**result)
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def listar() -> list[Categoria]:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT * FROM categoria ORDER BY id ASC")
                rows = cursor.fetchall()
            return [Categoria(**row) for row in rows]
        finally:
            conn.close()

    @staticmethod
    def buscar_por_id(categoria_id: int) -> Categoria:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT * FROM categoria WHERE id = %s", (categoria_id,))
                row = cursor.fetchone()
            if not row:
                raise ValueError("Categoria não encontrada.")
            return Categoria(**row)
        finally:
            conn.close()

    @staticmethod
    def atualizar(categoria_id: int, nome: str = None, descricao: str = None, ativo: bool = None) -> Categoria:
        categoria = CategoriaService.buscar_por_id(categoria_id)
        novo_nome = validar_nome(nome, "nome da categoria") if nome is not None else categoria.nome
        nova_descricao = descricao if descricao is not None else categoria.descricao
        novo_ativo = categoria.ativo if ativo is None else int(bool(ativo))

        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "UPDATE categoria SET nome = %s, descricao = %s, ativo = %s WHERE id = %s",
                    (novo_nome, nova_descricao, novo_ativo, categoria_id),
                )
                conn.commit()
                cursor.execute("SELECT * FROM categoria WHERE id = %s", (categoria_id,))
                row = cursor.fetchone()
            if not row:
                raise ValueError("Categoria não encontrada após atualização.")
            return Categoria(**row)
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def excluir(categoria_id: int) -> None:
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM categoria WHERE id = %s", (categoria_id,))
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
