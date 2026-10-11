"""Senhas e sessões: usado pelos logins de cliente e de confeiteiro."""
from __future__ import annotations

import hashlib
import hmac
import secrets

PBKDF2_ITERACOES = 600_000
SESSAO_DIAS = 7


class ErroAutenticacao(ValueError):
    """Login inválido ou sessão ausente/expirada."""


def novo_salt() -> str:
    return secrets.token_hex(16)


def novo_token() -> str:
    return secrets.token_urlsafe(32)


def hash_senha(senha: str, salt_hex: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", senha.encode("utf-8"), bytes.fromhex(salt_hex), PBKDF2_ITERACOES).hex()


def hash_token(token: str) -> str:
    """O banco guarda só o SHA-256 do token; o token em si fica apenas no navegador."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def senha_confere(senha: str, salt_hex: str | None, hash_gravado: str | None) -> bool:
    """Compara em tempo constante e calcula o hash mesmo sem cadastro, para não revelar se a conta existe."""
    calculado = hash_senha(str(senha or ""), salt_hex or "00" * 16)
    return hmac.compare_digest(calculado, hash_gravado or "")
