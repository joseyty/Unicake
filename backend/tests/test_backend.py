from __future__ import annotations

import os
import random
import string
import sys
import unittest
from typing import Dict, List, Optional

# Ajusta o caminho para importar módulos do backend
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from database.conexao import get_connection
from services.categoria_service import CategoriaService
from services.cliente_service import ClienteService
from services.endereco_service import EnderecoService
from services.produto_service import ProdutoService
from services.carrinho_service import CarrinhoService
from services.pedido_service import PedidoService


class TestBackendDoces(unittest.TestCase):
    prefixo: str = "tst_"
    categoria_id: Optional[int] = None
    produto_id: Optional[int] = None
    cliente_id: Optional[int] = None
    endereco_id: Optional[int] = None
    pedido_id: Optional[int] = None
    carrinho_id: Optional[int] = None

    @classmethod
    def setUpClass(cls):
        if not os.getenv("DB_HOST") or not os.getenv("DB_USER") or not os.getenv("DB_NAME"):
            raise unittest.SkipTest("Credenciais do MySQL/MariaDB não configuradas no ambiente. Configure .env antes de executar os testes.")

        cls.prefixo = "tst_" + "".join(random.choice(string.ascii_lowercase) for _ in range(6)) + "_"
        cls._criar_dados_base()

    @classmethod
    def tearDownClass(cls):
        cls._limpar_dados_teste()

    @classmethod
    def _criar_dados_base(cls):
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "INSERT INTO categoria (nome, descricao, ativo) VALUES (%s, %s, %s)",
                    (cls.prefixo + "doces", "Categoria de teste para backend", 1),
                )
                cls.categoria_id = cursor.lastrowid

                cursor.execute(
                    "INSERT INTO produto (categoria_id, nome, descricao, preco, estoque, status) VALUES (%s, %s, %s, %s, %s, %s)",
                    (cls.categoria_id, cls.prefixo + "brigadeiro", "Produto de teste", 12.50, 10, "ATIVO"),
                )
                cls.produto_id = cursor.lastrowid

                cursor.execute(
                    "INSERT INTO cliente (nome, email, telefone) VALUES (%s, %s, %s)",
                    (cls.prefixo + "Cliente Teste", cls.prefixo + "cliente@email.com", "11999999999"),
                )
                cls.cliente_id = cursor.lastrowid

                cursor.execute(
                    "INSERT INTO carrinho (cliente_id) VALUES (%s)",
                    (cls.cliente_id,),
                )
                cls.carrinho_id = cursor.lastrowid

                cursor.execute(
                    "INSERT INTO endereco (cliente_id, cep, estado, cidade, bairro, rua, numero, complemento, referencia) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                    (cls.cliente_id, "01000-000", "SP", "São Paulo", "Centro", "Rua Teste", "123", "Casa", "Perto da praça"),
                )
                cls.endereco_id = cursor.lastrowid

                conn.commit()
        finally:
            conn.close()

    @classmethod
    def _limpar_dados_teste(cls):
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM item_pedido WHERE pedido_id IN (SELECT id FROM pedido WHERE cliente_id = %s)", (cls.cliente_id,))
                cursor.execute("DELETE FROM pedido WHERE cliente_id = %s", (cls.cliente_id,))
                cursor.execute("DELETE FROM item_carrinho WHERE carrinho_id = %s", (cls.carrinho_id,))
                cursor.execute("DELETE FROM carrinho WHERE cliente_id = %s", (cls.cliente_id,))
                cursor.execute("DELETE FROM endereco WHERE cliente_id = %s", (cls.cliente_id,))
                cursor.execute("DELETE FROM cliente WHERE id = %s", (cls.cliente_id,))
                cursor.execute("DELETE FROM produto WHERE id = %s", (cls.produto_id,))
                cursor.execute("DELETE FROM categoria WHERE id = %s", (cls.categoria_id,))
                conn.commit()
        finally:
            conn.close()

    def test_01_categoria_crud(self):
        categoria = CategoriaService.criar(self.prefixo + "bolos", "Categoria de bolos", True)
        self.assertIsNotNone(categoria.id)
        self.assertEqual(categoria.nome, self.prefixo + "bolos")

        listada = CategoriaService.listar()
        nomes = [item.nome for item in listada]
        self.assertIn(self.prefixo + "bolos", nomes)

        atualizada = CategoriaService.atualizar(categoria.id, nome=self.prefixo + "bolos_editado", descricao="Atualizado")
        self.assertEqual(atualizada.nome, self.prefixo + "bolos_editado")

        categoria_busca = CategoriaService.buscar_por_id(categoria.id)
        self.assertEqual(categoria_busca.id, categoria.id)

        CategoriaService.excluir(categoria.id)

    def test_02_produto_crud_e_validacoes(self):
        produto = ProdutoService.criar(
            self.categoria_id,
            self.prefixo + "brownie",
            "Brownie de teste",
            16.00,
            5,
            "ATIVO",
        )
        self.assertEqual(produto.nome, self.prefixo + "brownie")
        self.assertEqual(produto.estoque, 5)

        produto_por_id = ProdutoService.buscar_por_id(produto.id)
        self.assertEqual(produto_por_id.id, produto.id)

        ProdutoService.alterar_preco(produto.id, 18.50)
        ProdutoService.alterar_estoque(produto.id, 8)
        ProdutoService.desativar(produto.id)

        produto_desativado = ProdutoService.buscar_por_id(produto.id)
        self.assertEqual(produto_desativado.status, "INATIVO")

        with self.assertRaises(ValueError):
            ProdutoService.alterar_preco(produto.id, -1)

        with self.assertRaises(ValueError):
            ProdutoService.alterar_estoque(produto.id, -1)

        ProdutoService.excluir(produto.id)

    def test_03_cliente_endereco_crud(self):
        cliente = ClienteService.criar(self.prefixo + "Cliente 2", self.prefixo + "cliente2@email.com", "11888888888")
        self.assertIsNotNone(cliente.id)

        encontrado = ClienteService.buscar_por_id(cliente.id)
        self.assertEqual(encontrado.email, self.prefixo + "cliente2@email.com")

        atualizado = ClienteService.atualizar(cliente.id, nome=self.prefixo + "Cliente 2 Atualizado")
        self.assertIn("Cliente 2 Atualizado", atualizado.nome)

        endereco = EnderecoService.criar(
            cliente.id,
            "02000-000",
            "SP",
            "São Paulo",
            "Vila Teste",
            "Rua Endereco",
            "456",
            "Apto 1",
            "Próximo ao mercado",
        )
        self.assertEqual(endereco.cliente_id, cliente.id)

        enderecos = EnderecoService.listar_por_cliente(cliente.id)
        self.assertTrue(any(item.id == endereco.id for item in enderecos))

        endereco_atualizado = EnderecoService.atualizar(endereco.id, cidade="São Paulo", bairro="Lapa")
        self.assertEqual(endereco_atualizado.bairro, "Lapa")

        EnderecoService.excluir(endereco.id)
        ClienteService.excluir(cliente.id)

    def test_04_carrinho_fluxo_com_estoque(self):
        produto = ProdutoService.criar(
            self.categoria_id,
            self.prefixo + "cupcake",
            "Cupcake de teste",
            20.00,
            7,
            "ATIVO",
        )

        carrinho = CarrinhoService.criar_ou_obter(self.cliente_id)
        self.assertEqual(carrinho.cliente_id, self.cliente_id)

        item = CarrinhoService.adicionar_produto(self.cliente_id, produto.id, 2)
        self.assertEqual(item['produto_id'], produto.id)

        itens = CarrinhoService.listar_itens(self.cliente_id)
        self.assertTrue(any(item['produto_id'] == produto.id for item in itens))

        total = CarrinhoService.total(self.cliente_id)
        self.assertGreater(total, 0)

        CarrinhoService.alterar_quantidade(self.cliente_id, produto.id, 3)
        subtotal = CarrinhoService.subtotal(self.cliente_id)
        self.assertGreater(subtotal, 0)

        CarrinhoService.remover_produto(self.cliente_id, produto.id)
        self.assertEqual(CarrinhoService.listar_itens(self.cliente_id), [])

        ProdutoService.excluir(produto.id)

    def test_05_pedido_criacao_estoque_e_cancelamento(self):
        produto = ProdutoService.criar(
            self.categoria_id,
            self.prefixo + "docinho",
            "Docinho de teste",
            9.90,
            5,
            "ATIVO",
        )

        CarrinhoService.adicionar_produto(self.cliente_id, produto.id, 2)

        pedido_resp = PedidoService.criar_pedido(self.cliente_id, self.endereco_id, "Entrega no horário do almoço")
        pedido = pedido_resp['pedido']
        itens = pedido_resp['itens']

        self.assertIsNotNone(pedido)
        self.assertEqual(pedido['status'], 'PENDENTE')
        self.assertTrue(len(itens) >= 1)

        produto_atualizado = ProdutoService.buscar_por_id(produto.id)
        self.assertEqual(produto_atualizado.estoque, 3)

        PedidoService.atualizar_status(pedido['id'], 'CONFIRMADO')
        pedido_confirmado = PedidoService.buscar_por_id(pedido['id'])
        self.assertEqual(pedido_confirmado['pedido']['status'], 'CONFIRMADO')

        pedido_cancelado = PedidoService.cancelar_pedido(pedido['id'])
        self.assertEqual(pedido_cancelado['status'], 'CANCELADO')

        produto_final = ProdutoService.buscar_por_id(produto.id)
        self.assertEqual(produto_final.estoque, 5)

        ProdutoService.excluir(produto.id)

    def test_06_status_invalido(self):
        produto = ProdutoService.criar(
            self.categoria_id,
            self.prefixo + "bolo",
            "Bolo de teste",
            24.00,
            3,
            "ATIVO",
        )

        CarrinhoService.adicionar_produto(self.cliente_id, produto.id, 1)
        resp = PedidoService.criar_pedido(self.cliente_id, self.endereco_id, "Teste de transição")
        pedido_id = resp['pedido']['id']

        with self.assertRaises(ValueError):
            PedidoService.atualizar_status(pedido_id, 'ENTREGUE')

        PedidoService.cancelar_pedido(pedido_id)
        ProdutoService.excluir(produto.id)


if __name__ == "__main__":
    unittest.main()
