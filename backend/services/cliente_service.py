from __future__ import annotations

from database.conexao import get_connection
from models.cliente import Cliente
from utils.validacoes import validar_email, validar_nome, validar_telefone


class ClienteService:
    @staticmethod
    def criar(nome: str, email: str, telefone: str) -> Cliente:
        nome = validar_nome(nome, "nome do cliente")
        email = validar_email(email)
        telefone = validar_telefone(telefone)

        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "INSERT INTO cliente (nome, email, telefone) VALUES (%s, %s, %s)",
                    (nome, email, telefone),
                )
                conn.commit()
                cliente_id = cursor.lastrowid
                cursor.execute("SELECT * FROM cliente WHERE id = %s", (cliente_id,))
                row = cursor.fetchone()
            if row is None:
                raise ValueError("Cliente não foi criado.")
            return Cliente(**row)
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def listar() -> list[Cliente]:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT * FROM cliente ORDER BY id ASC")
                rows = cursor.fetchall()
            return [Cliente(**row) for row in rows]
        finally:
            conn.close()

    @staticmethod
    def buscar_por_id(cliente_id: int) -> Cliente:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT * FROM cliente WHERE id = %s", (cliente_id,))
                row = cursor.fetchone()
            if row is None:
                raise ValueError("Cliente não encontrado.")
            return Cliente(**row)
        finally:
            conn.close()

    @staticmethod
    def atualizar(cliente_id: int, nome: str = None, email: str = None, telefone: str = None) -> Cliente:
        cliente = ClienteService.buscar_por_id(cliente_id)
        novo_nome = cliente.nome if nome is None else validar_nome(nome, "nome do cliente")
        novo_email = cliente.email if email is None else validar_email(email)
        novo_telefone = cliente.telefone if telefone is None else validar_telefone(telefone)

        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "UPDATE cliente SET nome = %s, email = %s, telefone = %s WHERE id = %s",
                    (novo_nome, novo_email, novo_telefone, cliente_id),
                )
                conn.commit()
                cursor.execute("SELECT * FROM cliente WHERE id = %s", (cliente_id,))
                row = cursor.fetchone()
            if row is None:
                raise ValueError("Cliente não encontrado após atualização.")
            return Cliente(**row)
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def excluir(cliente_id: int) -> None:
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM cliente WHERE id = %s", (cliente_id,))
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
