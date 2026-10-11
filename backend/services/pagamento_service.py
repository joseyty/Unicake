from __future__ import annotations

from database.conexao import get_connection
from models.pagamento import Pagamento


class PagamentoService:
    @staticmethod
    def listar_por_pedido(pedido_id: int) -> list[Pagamento]:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT * FROM pagamento WHERE pedido_id = ? ORDER BY id ASC", (pedido_id,))
                rows = cursor.fetchall()
            return [Pagamento(**row) for row in rows]
        finally:
            conn.close()

    @staticmethod
    def buscar_por_id(pagamento_id: int) -> Pagamento:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT * FROM pagamento WHERE id = ?", (pagamento_id,))
                row = cursor.fetchone()
            if row is None:
                raise ValueError("Pagamento não encontrado.")
            return Pagamento(**row)
        finally:
            conn.close()

    @staticmethod
    def confirmar(pagamento_id: int, codigo_transacao: str = None) -> Pagamento:
        return PagamentoService._mudar_status(pagamento_id, 'PENDENTE', 'APROVADO', codigo_transacao)

    @staticmethod
    def recusar(pagamento_id: int) -> Pagamento:
        return PagamentoService._mudar_status(pagamento_id, 'PENDENTE', 'RECUSADO')

    @staticmethod
    def estornar(pagamento_id: int) -> Pagamento:
        return PagamentoService._mudar_status(pagamento_id, 'APROVADO', 'ESTORNADO')

    @staticmethod
    def _mudar_status(pagamento_id: int, status_esperado: str, novo_status: str, codigo_transacao: str = None) -> Pagamento:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT status FROM pagamento WITH (UPDLOCK, ROWLOCK) WHERE id = ?", (pagamento_id,))
                pagamento = cursor.fetchone()
                if pagamento is None:
                    raise ValueError("Pagamento não encontrado.")
                if pagamento['status'] != status_esperado:
                    raise ValueError(f"Transição de pagamento inválida: {pagamento['status']} -> {novo_status}")

                if novo_status == 'APROVADO':
                    cursor.execute(
                        "UPDATE pagamento SET status = ?, codigo_transacao = ?, data_pagamento = SYSDATETIME(), data_atualizacao = SYSDATETIME() WHERE id = ?",
                        (novo_status, codigo_transacao, pagamento_id),
                    )
                else:
                    cursor.execute(
                        "UPDATE pagamento SET status = ?, data_atualizacao = SYSDATETIME() WHERE id = ?",
                        (novo_status, pagamento_id),
                    )
                conn.commit()
                cursor.execute("SELECT * FROM pagamento WHERE id = ?", (pagamento_id,))
                row = cursor.fetchone()
            return Pagamento(**row)
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
