from __future__ import annotations

from database.conexao import get_connection
from utils.validacoes import validar_email, validar_nome

# Tipos oferecidos no formulário da página Suporte
TIPOS = {
    "PEDIDO": "Pedido",
    "PRODUTO": "Produto",
    "RECLAMACAO": "Reclamação",
    "BUG": "Bug ou erro no site",
    "FEEDBACK": "Sugestão ou elogio",
    "EMPRESAS": "Empresas",
    "OUTRO": "Outro",
}
STATUS = ("ABERTO", "RESPONDIDO", "RESOLVIDO")
TAMANHO_MAXIMO = 2000

COLUNAS = "id, cliente_id, nome, email, tipo, mensagem, status, resposta, data_criacao, data_resposta"


def _texto(valor, campo: str) -> str:
    texto = str(valor or "").strip()
    if not texto:
        raise ValueError(f"Escreva a {campo}.")
    if len(texto) > TAMANHO_MAXIMO:
        raise ValueError(f"A {campo} deve ter no máximo {TAMANHO_MAXIMO} caracteres.")
    return texto


def _tipo(valor) -> str:
    tipo = str(valor or "").strip().upper()
    if tipo not in TIPOS:
        raise ValueError("Escolha o assunto da solicitação.")
    return tipo


def _status(valor) -> str:
    status = str(valor or "").strip().upper()
    if status not in STATUS:
        raise ValueError("Situação do chamado inválida.")
    return status


class ChamadoService:
    """Chamados do suporte: feedbacks, reclamações, bugs e dúvidas enviados pelo site."""

    @staticmethod
    def criar(nome: str, email: str, tipo: str, mensagem: str, cliente_id: int = None) -> dict:
        nome = validar_nome(nome, "nome")
        email = validar_email(email).lower()
        tipo = _tipo(tipo)
        mensagem = _texto(mensagem, "mensagem")

        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "INSERT INTO chamado (cliente_id, nome, email, tipo, mensagem) OUTPUT INSERTED.id VALUES (?, ?, ?, ?, ?)",
                    (cliente_id, nome, email, tipo, mensagem),
                )
                chamado_id = cursor.fetchone()['id']
                conn.commit()
                cursor.execute(f"SELECT {COLUNAS} FROM chamado WHERE id = ?", (chamado_id,))
                return cursor.fetchone()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def listar(status: str = None, tipo: str = None) -> list[dict]:
        """Todos os chamados, do mais novo para o mais antigo. Usado pelo painel de suporte."""
        filtros, parametros = [], []
        if status:
            filtros.append("status = ?")
            parametros.append(_status(status))
        if tipo:
            filtros.append("tipo = ?")
            parametros.append(_tipo(tipo))
        onde = (" WHERE " + " AND ".join(filtros)) if filtros else ""

        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(f"SELECT {COLUNAS} FROM chamado{onde} ORDER BY id DESC", tuple(parametros))
                return cursor.fetchall()
        finally:
            conn.close()

    @staticmethod
    def listar_do_cliente(cliente_id: int) -> list[dict]:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(f"SELECT {COLUNAS} FROM chamado WHERE cliente_id = ? ORDER BY id DESC", (cliente_id,))
                return cursor.fetchall()
        finally:
            conn.close()

    @staticmethod
    def responder(chamado_id: int, resposta: str, administrador_id: int) -> dict:
        resposta = _texto(resposta, "resposta")
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "UPDATE chamado SET resposta = ?, respondido_por = ?, data_resposta = SYSDATETIME(), status = 'RESPONDIDO' WHERE id = ?",
                    (resposta, administrador_id, chamado_id),
                )
                cursor.execute(f"SELECT {COLUNAS} FROM chamado WHERE id = ?", (chamado_id,))
                chamado = cursor.fetchone()
                if chamado is None:
                    raise ValueError("Chamado não encontrado.")
                conn.commit()
                return chamado
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def alterar_status(chamado_id: int, status: str) -> dict:
        status = _status(status)
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("UPDATE chamado SET status = ? WHERE id = ?", (status, chamado_id))
                cursor.execute(f"SELECT {COLUNAS} FROM chamado WHERE id = ?", (chamado_id,))
                chamado = cursor.fetchone()
                if chamado is None:
                    raise ValueError("Chamado não encontrado.")
                conn.commit()
                return chamado
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
