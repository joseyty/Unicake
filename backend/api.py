"""API HTTP usada pelo site para gravar compras e pagamentos no SQL Server.

Executar com: python api.py
"""
from __future__ import annotations

import os
from datetime import date, datetime
from decimal import Decimal

import pyodbc
from flask import Flask, jsonify, request

from services.confeiteiro_service import ConfeiteiroService, ErroAutenticacao
from services.pedido_service import PedidoService
from services.produto_service import ProdutoService

app = Flask(__name__)

ORIGENS_PERMITIDAS = {
    origem.strip()
    for origem in os.getenv("CORS_ORIGINS", "http://127.0.0.1:8000,http://localhost:8000").split(",")
    if origem.strip()
}


def _serializar(valor):
    if isinstance(valor, Decimal):
        return float(valor)
    if isinstance(valor, (datetime, date)):
        return valor.isoformat()
    if isinstance(valor, dict):
        return {chave: _serializar(item) for chave, item in valor.items()}
    if isinstance(valor, (list, tuple)):
        return [_serializar(item) for item in valor]
    return valor


@app.after_request
def adicionar_cors(resposta):
    origem = request.headers.get("Origin")
    if origem in ORIGENS_PERMITIDAS:
        resposta.headers["Access-Control-Allow-Origin"] = origem
        resposta.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        resposta.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        resposta.headers["Vary"] = "Origin"
    return resposta


@app.errorhandler(ValueError)
def erro_de_validacao(exc):
    return jsonify({"erro": str(exc)}), 400


@app.errorhandler(ErroAutenticacao)
def erro_de_autenticacao(exc):
    return jsonify({"erro": str(exc)}), 401


@app.errorhandler(pyodbc.Error)
def erro_de_banco(exc):
    app.logger.exception("Erro ao acessar o banco de dados")
    return jsonify({"erro": "Erro ao acessar o banco de dados."}), 500


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/api/produtos")
def listar_produtos():
    produtos = [produto.to_dict() for produto in ProdutoService.listar() if produto.status == 'ATIVO']
    return jsonify(_serializar(produtos))


@app.route("/api/pedidos", methods=["POST", "OPTIONS"])
def criar_pedido():
    if request.method == "OPTIONS":
        return "", 204

    dados = request.get_json(silent=True)
    if not isinstance(dados, dict):
        raise ValueError("Envie os dados do pedido em JSON.")
    cliente = dados.get("cliente")
    if not isinstance(cliente, dict):
        raise ValueError("Dados do cliente são obrigatórios.")

    compra = PedidoService.registrar_compra(
        nome=cliente.get("nome"),
        email=cliente.get("email"),
        itens=dados.get("itens"),
        metodo_pagamento=dados.get("metodo_pagamento"),
        cupom=dados.get("cupom"),
        observacoes=str(dados["observacoes"]) if dados.get("observacoes") else None,
    )
    return jsonify(_serializar(compra)), 201


def _token_da_requisicao() -> str:
    cabecalho = request.headers.get("Authorization", "")
    return cabecalho[7:].strip() if cabecalho.startswith("Bearer ") else ""


def _dados_json() -> dict:
    dados = request.get_json(silent=True)
    if not isinstance(dados, dict):
        raise ValueError("Envie os dados em JSON.")
    return dados


@app.post("/api/confeiteiros")
def cadastrar_confeiteiro():
    dados = _dados_json()
    ConfeiteiroService.cadastrar(
        nome=dados.get("nome"),
        nome_loja=dados.get("nome_loja"),
        cnpj=dados.get("cnpj"),
        email=dados.get("email"),
        senha=dados.get("senha"),
        telefone=dados.get("telefone"),
    )
    # Já devolve uma sessão aberta, para o confeiteiro entrar direto após o cadastro
    sessao = ConfeiteiroService.autenticar(dados.get("email"), dados.get("senha"))
    return jsonify(_serializar({"token": sessao["token"], "confeiteiro": sessao["confeiteiro"].to_dict()})), 201


@app.post("/api/confeiteiros/login")
def login_confeiteiro():
    dados = _dados_json()
    sessao = ConfeiteiroService.autenticar(dados.get("email"), dados.get("senha"))
    return jsonify(_serializar({"token": sessao["token"], "confeiteiro": sessao["confeiteiro"].to_dict()}))


@app.get("/api/confeiteiros/me")
def confeiteiro_atual():
    confeiteiro = ConfeiteiroService.buscar_por_token(_token_da_requisicao())
    return jsonify(_serializar(confeiteiro.to_dict()))


@app.post("/api/confeiteiros/logout")
def logout_confeiteiro():
    ConfeiteiroService.encerrar_sessao(_token_da_requisicao())
    return "", 204


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.getenv("API_PORT", "5000")))
