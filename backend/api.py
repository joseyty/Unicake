"""API HTTP usada pelo site para gravar compras e pagamentos no SQL Server.

Executar com: python api.py
"""
from __future__ import annotations

import os
import uuid
from datetime import date, datetime
from decimal import Decimal

import pyodbc
from flask import Flask, jsonify, request, send_from_directory
from werkzeug.exceptions import RequestEntityTooLarge

from services.categoria_service import CategoriaService
from services.confeiteiro_service import ConfeiteiroService, ErroAutenticacao
from services.pedido_service import PedidoService
from services.produto_service import ProdutoService

app = Flask(__name__)

# Fotos enviadas pelos confeiteiros ficam em backend/uploads (fora do Git)
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
TAMANHO_MAXIMO_FOTO_MB = 4
app.config["MAX_CONTENT_LENGTH"] = TAMANHO_MAXIMO_FOTO_MB * 1024 * 1024 + 64 * 1024

ORIGENS_PERMITIDAS = {
    origem.strip()
    for origem in os.getenv("CORS_ORIGINS", "http://127.0.0.1:8000,http://localhost:8000,http://127.0.0.1:5500,http://localhost:5500").split(",")
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
        resposta.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        resposta.headers["Vary"] = "Origin"
    return resposta


@app.errorhandler(ValueError)
def erro_de_validacao(exc):
    return jsonify({"erro": str(exc)}), 400


@app.errorhandler(ErroAutenticacao)
def erro_de_autenticacao(exc):
    return jsonify({"erro": str(exc)}), 401


@app.errorhandler(RequestEntityTooLarge)
def erro_de_tamanho(exc):
    return jsonify({"erro": f"A foto deve ter no máximo {TAMANHO_MAXIMO_FOTO_MB} MB."}), 413


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


def _url_da_foto(imagem: str):
    return f"{request.host_url.rstrip('/')}/uploads/{imagem}" if imagem else None


def _salvar_foto(arquivo) -> str:
    """Valida a foto pelo conteúdo (não pela extensão) e grava com nome aleatório. Retorna o caminho relativo."""
    if arquivo is None or not arquivo.filename:
        raise ValueError("Envie a foto do produto.")

    cabecalho = arquivo.stream.read(12)
    arquivo.stream.seek(0)
    if cabecalho.startswith(b"\xff\xd8\xff"):
        extensao = "jpg"
    elif cabecalho.startswith(b"\x89PNG\r\n\x1a\n"):
        extensao = "png"
    elif cabecalho[:4] == b"RIFF" and cabecalho[8:12] == b"WEBP":
        extensao = "webp"
    else:
        raise ValueError("A foto deve ser uma imagem JPG, PNG ou WEBP.")

    relativo = f"produtos/{uuid.uuid4().hex}.{extensao}"
    destino = os.path.join(UPLOAD_DIR, *relativo.split("/"))
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    arquivo.save(destino)
    return relativo


def _apagar_foto(relativo: str) -> None:
    if not relativo:
        return
    caminho = os.path.join(UPLOAD_DIR, *relativo.split("/"))
    try:
        os.remove(caminho)
    except OSError:
        app.logger.warning("Não foi possível apagar a foto %s", caminho)


def _produto_do_confeiteiro(produto) -> dict:
    dados = produto.to_dict()
    dados["imagem_url"] = _url_da_foto(produto.imagem)
    return dados


@app.get("/uploads/<path:caminho>")
def foto_enviada(caminho):
    return send_from_directory(UPLOAD_DIR, caminho, max_age=3600)


@app.get("/api/categorias")
def listar_categorias():
    categorias = [{"id": c.id, "nome": c.nome} for c in CategoriaService.listar() if c.ativo]
    return jsonify(categorias)


@app.get("/api/catalogo")
def catalogo_dos_confeiteiros():
    """Produtos cadastrados por confeiteiros, que o site soma ao catálogo fixo."""
    produtos = ProdutoService.listar_catalogo_parceiros()
    for produto in produtos:
        produto["imagem_url"] = _url_da_foto(produto.pop("imagem"))
    return jsonify(_serializar(produtos))


@app.get("/api/confeiteiros/me/produtos")
def produtos_do_confeiteiro():
    confeiteiro = ConfeiteiroService.buscar_por_token(_token_da_requisicao())
    produtos = ProdutoService.listar_por_confeiteiro(confeiteiro.id)
    return jsonify(_serializar([_produto_do_confeiteiro(produto) for produto in produtos]))


@app.post("/api/confeiteiros/me/produtos")
def cadastrar_produto_do_confeiteiro():
    confeiteiro = ConfeiteiroService.buscar_por_token(_token_da_requisicao())
    dados = request.form

    descricao = str(dados.get("descricao") or "").strip()
    if not descricao:
        raise ValueError("Descrição do produto é obrigatória.")
    if len(descricao) > 500:
        raise ValueError("A descrição deve ter no máximo 500 caracteres.")
    try:
        preco = Decimal(str(dados.get("preco") or "").replace(",", "."))
        categoria_id = int(dados.get("categoria_id") or 0)
    except (ArithmeticError, ValueError):
        raise ValueError("Informe o valor e a categoria do produto.")
    if not preco.is_finite() or preco <= 0:
        raise ValueError("O valor do produto deve ser maior que zero.")

    imagem = _salvar_foto(request.files.get("foto"))
    try:
        produto = ProdutoService.criar(
            categoria_id,
            dados.get("nome"),
            descricao,
            preco,
            dados.get("estoque") or 0,
            "ATIVO",
            loja=confeiteiro.nome_loja,
            confeiteiro_id=confeiteiro.id,
            imagem=imagem,
        )
    except Exception:
        _apagar_foto(imagem)
        raise
    return jsonify(_serializar(_produto_do_confeiteiro(produto))), 201


@app.put("/api/confeiteiros/me/produtos/<int:produto_id>/fidelidade")
def fidelidade_do_produto(produto_id):
    confeiteiro = ConfeiteiroService.buscar_por_token(_token_da_requisicao())
    ativo = _dados_json().get("ativo")
    if not isinstance(ativo, bool):
        raise ValueError("Informe se o produto participa do cartão fidelidade.")
    produto = ProdutoService.definir_fidelidade(produto_id, confeiteiro.id, ativo)
    return jsonify(_serializar(_produto_do_confeiteiro(produto)))


@app.delete("/api/confeiteiros/me/produtos/<int:produto_id>")
def excluir_produto_do_confeiteiro(produto_id):
    confeiteiro = ConfeiteiroService.buscar_por_token(_token_da_requisicao())
    resultado = ProdutoService.excluir_do_confeiteiro(produto_id, confeiteiro.id)
    _apagar_foto(resultado["imagem"])
    return jsonify({"resultado": resultado["resultado"]})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.getenv("API_PORT", "5000")))
