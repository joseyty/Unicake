from __future__ import annotations

import re
from datetime import datetime


def validar_nome(nome: str, campo: str = "nome") -> str:
    if nome is None:
        raise ValueError(f"{campo} é obrigatório.")
    nome = str(nome).strip()
    if not nome:
        raise ValueError(f"{campo} é obrigatório.")
    return nome


def validar_preco(preco: float) -> float:
    try:
        valor = float(preco)
    except (TypeError, ValueError):
        raise ValueError("Preço inválido.")
    if valor < 0:
        raise ValueError("Preço não pode ser negativo.")
    return valor


def validar_estoque(estoque: int) -> int:
    try:
        valor = int(estoque)
    except (TypeError, ValueError):
        raise ValueError("Estoque inválido.")
    if valor < 0:
        raise ValueError("Estoque não pode ser negativo.")
    return valor


def validar_quantidade(quantidade: int) -> int:
    try:
        valor = int(quantidade)
    except (TypeError, ValueError):
        raise ValueError("Quantidade inválida.")
    if valor <= 0:
        raise ValueError("Quantidade deve ser maior que zero.")
    return valor


def validar_email(email: str) -> str:
    if email is None:
        raise ValueError("E-mail é obrigatório.")
    email = str(email).strip()
    if not email:
        raise ValueError("E-mail é obrigatório.")
    padrao = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    if not re.match(padrao, email):
        raise ValueError("E-mail inválido.")
    return email


def validar_telefone(telefone: str) -> str:
    if telefone is None:
        raise ValueError("Telefone é obrigatório.")
    telefone = str(telefone).strip()
    if not telefone:
        raise ValueError("Telefone é obrigatório.")
    return telefone


def validar_cep(cep: str) -> str:
    cep = str(cep or "").strip()
    if not cep:
        raise ValueError("CEP é obrigatório.")
    return cep


def validar_status_pedido(status: str) -> str:
    status_esperado = {
        "PENDENTE",
        "CONFIRMADO",
        "EM_PREPARACAO",
        "PRONTO",
        "SAIU_PARA_ENTREGA",
        "ENTREGUE",
        "CANCELADO",
    }
    status = str(status or "").strip().upper()
    if status not in status_esperado:
        raise ValueError("Status do pedido inválido.")
    return status


def data_atual_iso() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
