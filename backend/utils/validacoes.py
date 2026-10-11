from __future__ import annotations

import re
import unicodedata
from datetime import datetime
from decimal import ROUND_HALF_UP, Decimal, InvalidOperation


def validar_nome(nome: str, campo: str = "nome") -> str:
    if nome is None:
        raise ValueError(f"{campo} é obrigatório.")
    nome = str(nome).strip()
    if not nome:
        raise ValueError(f"{campo} é obrigatório.")
    return nome


def validar_preco(preco: float) -> Decimal:
    try:
        valor = Decimal(str(preco))
    except (TypeError, ValueError, InvalidOperation):
        raise ValueError("Preço inválido.")
    if not valor.is_finite():
        raise ValueError("Preço inválido.")
    if valor < 0:
        raise ValueError("Preço não pode ser negativo.")
    return valor.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


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


def validar_senha(senha: str) -> str:
    senha = str(senha or "")
    if len(senha) < 8:
        raise ValueError("A senha deve ter pelo menos 8 caracteres.")
    if len(senha) > 200:
        raise ValueError("A senha deve ter no máximo 200 caracteres.")
    return senha


def calcular_dv_cnpj(base: str) -> str:
    """Calcula os 2 dígitos verificadores a partir dos 12 primeiros caracteres do CNPJ."""
    digitos = ""
    for pesos in ((5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2), (6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2)):
        # ord(c) - 48 vale para dígitos e para as letras do CNPJ alfanumérico (A=17, B=18...)
        soma = sum((ord(caractere) - 48) * peso for caractere, peso in zip(base + digitos, pesos))
        resto = soma % 11
        digitos += "0" if resto < 2 else str(11 - resto)
    return digitos


def validar_cnpj(cnpj: str) -> str:
    """Aceita o CNPJ com ou sem pontuação, numérico ou alfanumérico, e devolve os 14 caracteres."""
    cnpj = re.sub(r"[.\-/\s]", "", str(cnpj or "")).upper()
    if not cnpj:
        raise ValueError("CNPJ é obrigatório.")
    if not re.fullmatch(r"[0-9A-Z]{12}[0-9]{2}", cnpj) or len(set(cnpj)) == 1:
        raise ValueError("CNPJ inválido.")
    if calcular_dv_cnpj(cnpj[:12]) != cnpj[12:]:
        raise ValueError("CNPJ inválido.")
    return cnpj


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


def validar_metodo_pagamento(metodo: str) -> str:
    # Aceita os rótulos do site ("Pix", "Cartão", "Dinheiro") e devolve o valor gravado no banco
    texto = unicodedata.normalize("NFKD", str(metodo or "")).encode("ascii", "ignore").decode("ascii")
    texto = texto.strip().upper()
    if texto not in {"PIX", "CARTAO", "DINHEIRO"}:
        raise ValueError("Forma de pagamento inválida.")
    return texto


def normalizar_cupom(codigo: str) -> str:
    # Mesma normalização do carrinho do site: maiúsculas, só letras e números
    return re.sub(r"[^A-Z0-9]", "", str(codigo or "").strip().upper())


def data_atual_iso() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
