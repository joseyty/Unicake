from __future__ import annotations

import hashlib
import hmac
import secrets

from database.conexao import get_connection
from models.confeiteiro import Confeiteiro
from utils.validacoes import validar_cnpj, validar_email, validar_nome, validar_senha

PBKDF2_ITERACOES = 600_000
SESSAO_DIAS = 7
# Colunas públicas: nunca devolve senha_hash/senha_salt
COLUNAS = "id, nome, nome_loja, cnpj, email, telefone, ativo, data_cadastro"


class ErroAutenticacao(ValueError):
    """Login inválido ou sessão ausente/expirada."""


def _hash_senha(senha: str, salt_hex: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", senha.encode("utf-8"), bytes.fromhex(salt_hex), PBKDF2_ITERACOES).hex()


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


class ConfeiteiroService:
    @staticmethod
    def cadastrar(nome: str, nome_loja: str, cnpj: str, email: str, senha: str, telefone: str = None) -> Confeiteiro:
        nome = validar_nome(nome, "nome do confeiteiro")
        nome_loja = validar_nome(nome_loja, "nome da loja")
        cnpj = validar_cnpj(cnpj)
        email = validar_email(email).lower()
        senha = validar_senha(senha)
        telefone = str(telefone or "").strip() or None

        salt = secrets.token_hex(16)
        senha_hash = _hash_senha(senha, salt)

        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT id FROM confeiteiro WITH (UPDLOCK, HOLDLOCK) WHERE email = ?", (email,))
                if cursor.fetchone() is not None:
                    raise ValueError("Já existe um confeiteiro cadastrado com este e-mail.")
                cursor.execute("SELECT id FROM confeiteiro WITH (UPDLOCK, HOLDLOCK) WHERE cnpj = ?", (cnpj,))
                if cursor.fetchone() is not None:
                    raise ValueError("Já existe um confeiteiro cadastrado com este CNPJ.")

                cursor.execute(
                    "INSERT INTO confeiteiro (nome, nome_loja, cnpj, email, telefone, senha_hash, senha_salt) OUTPUT INSERTED.id VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (nome, nome_loja, cnpj, email, telefone, senha_hash, salt),
                )
                confeiteiro_id = cursor.fetchone()['id']
                conn.commit()
                cursor.execute(f"SELECT {COLUNAS} FROM confeiteiro WHERE id = ?", (confeiteiro_id,))
                row = cursor.fetchone()
            return Confeiteiro(**row)
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def autenticar(email: str, senha: str) -> dict:
        """Confere e-mail e senha e abre uma sessão. Retorna {"token", "confeiteiro"}."""
        email = str(email or "").strip().lower()
        senha = str(senha or "")
        if len(senha) > 200:
            raise ErroAutenticacao("E-mail ou senha incorretos.")

        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    f"SELECT {COLUNAS}, senha_hash, senha_salt FROM confeiteiro WHERE email = ?",
                    (email,),
                )
                row = cursor.fetchone()

                # Calcula o hash mesmo sem cadastro, para a resposta não revelar se o e-mail existe
                salt = row['senha_salt'] if row else "00" * 16
                senha_confere = hmac.compare_digest(_hash_senha(senha, salt), row['senha_hash'] if row else "")
                if row is None or not senha_confere:
                    raise ErroAutenticacao("E-mail ou senha incorretos.")
                if not row['ativo']:
                    raise ErroAutenticacao("Este cadastro está desativado.")

                token = secrets.token_urlsafe(32)
                cursor.execute(
                    "INSERT INTO sessao_confeiteiro (confeiteiro_id, token_hash, data_expiracao) VALUES (?, ?, DATEADD(DAY, ?, SYSDATETIME()))",
                    (row['id'], _hash_token(token), SESSAO_DIAS),
                )
                cursor.execute("DELETE FROM sessao_confeiteiro WHERE data_expiracao <= SYSDATETIME()")
                conn.commit()

            del row['senha_hash'], row['senha_salt']
            return {"token": token, "confeiteiro": Confeiteiro(**row)}
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def buscar_por_token(token: str) -> Confeiteiro:
        if not token:
            raise ErroAutenticacao("Sessão não informada.")

        colunas = ", ".join("c." + coluna for coluna in COLUNAS.split(", "))
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    f"SELECT {colunas} FROM sessao_confeiteiro s "
                    "INNER JOIN confeiteiro c ON c.id = s.confeiteiro_id "
                    "WHERE s.token_hash = ? AND s.data_expiracao > SYSDATETIME() AND c.ativo = 1",
                    (_hash_token(token),),
                )
                row = cursor.fetchone()
            if row is None:
                raise ErroAutenticacao("Sessão inválida ou expirada. Entre novamente.")
            return Confeiteiro(**row)
        finally:
            conn.close()

    @staticmethod
    def encerrar_sessao(token: str) -> None:
        if not token:
            return
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM sessao_confeiteiro WHERE token_hash = ?", (_hash_token(token),))
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def excluir(confeiteiro_id: int) -> None:
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM confeiteiro WHERE id = ?", (confeiteiro_id,))
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
