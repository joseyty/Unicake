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
from services.pagamento_service import PagamentoService
from services.confeiteiro_service import ConfeiteiroService, ErroAutenticacao
from utils.validacoes import calcular_dv_cnpj, validar_cnpj


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
        if not os.getenv("DB_SERVER") or not os.getenv("DB_NAME"):
            raise unittest.SkipTest("Conexão com o SQL Server não configurada no ambiente. Configure .env antes de executar os testes.")

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
                    "INSERT INTO categoria (nome, descricao, ativo) OUTPUT INSERTED.id VALUES (?, ?, ?)",
                    (cls.prefixo + "doces", "Categoria de teste para backend", 1),
                )
                cls.categoria_id = cursor.fetchone()['id']

                cursor.execute(
                    "INSERT INTO produto (categoria_id, nome, descricao, preco, estoque, status) OUTPUT INSERTED.id VALUES (?, ?, ?, ?, ?, ?)",
                    (cls.categoria_id, cls.prefixo + "brigadeiro", "Produto de teste", 12.50, 10, "ATIVO"),
                )
                cls.produto_id = cursor.fetchone()['id']

                cursor.execute(
                    "INSERT INTO cliente (nome, email, telefone) OUTPUT INSERTED.id VALUES (?, ?, ?)",
                    (cls.prefixo + "Cliente Teste", cls.prefixo + "cliente@email.com", "11999999999"),
                )
                cls.cliente_id = cursor.fetchone()['id']

                cursor.execute(
                    "INSERT INTO carrinho (cliente_id) OUTPUT INSERTED.id VALUES (?)",
                    (cls.cliente_id,),
                )
                cls.carrinho_id = cursor.fetchone()['id']

                cursor.execute(
                    "INSERT INTO endereco (cliente_id, cep, estado, cidade, bairro, rua, numero, complemento, referencia) OUTPUT INSERTED.id VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (cls.cliente_id, "01000-000", "SP", "São Paulo", "Centro", "Rua Teste", "123", "Casa", "Perto da praça"),
                )
                cls.endereco_id = cursor.fetchone()['id']

                conn.commit()
        finally:
            conn.close()

    @classmethod
    def _limpar_dados_teste(cls):
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                # Limpa por prefixo para remover também o que os testes criaram, mesmo se algum falhar no meio.
                p = (len(cls.prefixo), cls.prefixo)
                cursor.execute("DELETE FROM pedido WHERE cliente_id IN (SELECT id FROM cliente WHERE LEFT(email, ?) = ?)", p)
                cursor.execute("DELETE FROM cliente WHERE LEFT(email, ?) = ?", p)
                cursor.execute("DELETE FROM produto WHERE LEFT(nome, ?) = ?", p)
                cursor.execute("DELETE FROM categoria WHERE LEFT(nome, ?) = ?", p)
                cursor.execute("DELETE FROM confeiteiro WHERE LEFT(email, ?) = ?", p)
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

        with self.assertRaises(ValueError):
            PedidoService.cancelar_pedido(pedido['id'])

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

        # Cancelar via atualizar_status também deve devolver o estoque
        self.assertEqual(ProdutoService.buscar_por_id(produto.id).estoque, 2)
        PedidoService.atualizar_status(pedido_id, 'CANCELADO')
        self.assertEqual(ProdutoService.buscar_por_id(produto.id).estoque, 3)

    def test_07_pedido_entregue_nao_cancela(self):
        produto = ProdutoService.criar(
            self.categoria_id,
            self.prefixo + "torta",
            "Torta de teste",
            29.90,
            4,
            "ATIVO",
        )

        CarrinhoService.adicionar_produto(self.cliente_id, produto.id, 3)
        resp = PedidoService.criar_pedido(self.cliente_id, self.endereco_id)
        pedido_id = resp['pedido']['id']
        self.assertEqual(str(resp['pedido']['valor_total']), "89.70")

        for status in ('CONFIRMADO', 'EM_PREPARACAO', 'PRONTO', 'SAIU_PARA_ENTREGA', 'ENTREGUE'):
            PedidoService.atualizar_status(pedido_id, status)

        with self.assertRaises(ValueError):
            PedidoService.cancelar_pedido(pedido_id)
        self.assertEqual(ProdutoService.buscar_por_id(produto.id).estoque, 1)

    def test_08_compra_do_site_grava_pedido_e_pagamento(self):
        codigo = self.prefixo + "mousse"
        produto = ProdutoService.criar(
            self.categoria_id,
            self.prefixo + "mousse",
            "Mousse de teste",
            30.00,
            5,
            "ATIVO",
            codigo=codigo,
            loja="Loja Teste",
        )

        compra = PedidoService.registrar_compra(
            nome=self.prefixo + "Cliente Site",
            email=self.prefixo + "site@email.com",
            itens=[{"codigo": codigo, "quantidade": 2}],
            metodo_pagamento="Cartão",
            cupom="unicake-10",
        )
        pedido = compra['pedido']
        self.assertEqual(str(pedido['subtotal']), "60.00")
        self.assertEqual(str(pedido['desconto']), "6.00")
        self.assertEqual(str(pedido['taxa_entrega']), "5.00")
        self.assertEqual(str(pedido['valor_total']), "59.00")
        self.assertEqual(pedido['cupom_codigo'], "UNICAKE10")
        self.assertEqual(compra['itens'][0]['nome_produto'], self.prefixo + "mousse")
        self.assertEqual(ProdutoService.buscar_por_id(produto.id).estoque, 3)

        self.assertEqual(len(compra['pagamentos']), 1)
        pagamento = compra['pagamentos'][0]
        self.assertEqual(pagamento['metodo'], "CARTAO")
        self.assertEqual(pagamento['status'], "PENDENTE")
        self.assertEqual(str(pagamento['valor']), "59.00")

        aprovado = PagamentoService.confirmar(pagamento['id'], "TESTE-123")
        self.assertEqual(aprovado.status, "APROVADO")
        self.assertIsNotNone(aprovado.data_pagamento)

        with self.assertRaises(ValueError):
            PedidoService.registrar_compra(
                nome=self.prefixo + "Cliente Site",
                email=self.prefixo + "site@email.com",
                itens=[{"codigo": codigo, "quantidade": 99}],
                metodo_pagamento="Pix",
            )

        PedidoService.cancelar_pedido(pedido['id'])
        self.assertEqual(PagamentoService.buscar_por_id(pagamento['id']).status, "ESTORNADO")
        self.assertEqual(ProdutoService.buscar_por_id(produto.id).estoque, 5)

    def test_11_produtos_do_confeiteiro(self):
        base = "".join(random.choice(string.digits) for _ in range(8))
        dono = ConfeiteiroService.cadastrar("Bia Doceira", "Doces da Bia", base + "0003" + calcular_dv_cnpj(base + "0003"), self.prefixo + "bia@email.com", "SenhaForte123")
        outro = ConfeiteiroService.cadastrar("Caio Doceiro", "Doces do Caio", base + "0004" + calcular_dv_cnpj(base + "0004"), self.prefixo + "caio@email.com", "SenhaForte123")

        produto = ProdutoService.criar(
            self.categoria_id,
            self.prefixo + "pudim",
            "Pudim de leite",
            18.00,
            4,
            "ATIVO",
            loja=dono.nome_loja,
            confeiteiro_id=dono.id,
            imagem="produtos/teste.jpg",
        )
        self.assertEqual(produto.codigo, f"p{produto.id}")
        self.assertEqual(produto.confeiteiro_id, dono.id)
        self.assertEqual(produto.imagem, "produtos/teste.jpg")

        self.assertEqual([p.id for p in ProdutoService.listar_por_confeiteiro(dono.id)], [produto.id])
        self.assertEqual(ProdutoService.listar_por_confeiteiro(outro.id), [])
        catalogo = [item for item in ProdutoService.listar_catalogo_parceiros() if item['id'] == produto.id]
        self.assertEqual(len(catalogo), 1)
        self.assertEqual(catalogo[0]['loja'], "Doces da Bia")
        self.assertEqual(catalogo[0]['categoria'], self.prefixo + "doces")

        # Cartão fidelidade: só o dono escolhe, e no máximo 10 produtos
        with self.assertRaises(ValueError):
            ProdutoService.definir_fidelidade(produto.id, outro.id, True)
        self.assertTrue(ProdutoService.definir_fidelidade(produto.id, dono.id, True).fidelidade)
        self.assertTrue([i for i in ProdutoService.listar_catalogo_parceiros() if i['id'] == produto.id][0]['fidelidade'])
        extras = [
            ProdutoService.criar(self.categoria_id, f"{self.prefixo}fid{n}", "Doce", 5, 1, "ATIVO", loja=dono.nome_loja, confeiteiro_id=dono.id)
            for n in range(ProdutoService.LIMITE_FIDELIDADE)
        ]
        for extra in extras[:-1]:
            ProdutoService.definir_fidelidade(extra.id, dono.id, True)
        with self.assertRaises(ValueError):
            ProdutoService.definir_fidelidade(extras[-1].id, dono.id, True)
        # Tirando um, abre vaga para outro
        self.assertFalse(ProdutoService.definir_fidelidade(extras[0].id, dono.id, False).fidelidade)
        self.assertTrue(ProdutoService.definir_fidelidade(extras[-1].id, dono.id, True).fidelidade)
        for extra in extras:
            ProdutoService.excluir_do_confeiteiro(extra.id, dono.id)

        # Outro confeiteiro não pode remover o produto
        with self.assertRaises(ValueError):
            ProdutoService.excluir_do_confeiteiro(produto.id, outro.id)

        # O produto do confeiteiro pode ser comprado pelo site usando o código
        PedidoService.registrar_compra(
            nome=self.prefixo + "Cliente Site",
            email=self.prefixo + "site2@email.com",
            itens=[{"codigo": produto.codigo, "quantidade": 1}],
            metodo_pagamento="Pix",
        )
        # Com pedido registrado, remover apenas desativa (o histórico da compra é mantido)
        resultado = ProdutoService.excluir_do_confeiteiro(produto.id, dono.id)
        self.assertEqual(resultado['resultado'], "desativado")
        self.assertEqual(ProdutoService.buscar_por_id(produto.id).status, "INATIVO")
        # Produto desativado sai do cartão fidelidade e não ocupa vaga
        self.assertFalse(ProdutoService.buscar_por_id(produto.id).fidelidade)
        with self.assertRaises(ValueError):
            ProdutoService.definir_fidelidade(produto.id, dono.id, True)
        self.assertEqual([item for item in ProdutoService.listar_catalogo_parceiros() if item['id'] == produto.id], [])

        # Sem pedidos, o produto é excluído de vez
        avulso = ProdutoService.criar(self.categoria_id, self.prefixo + "quindim", "Quindim", 6.50, 2, "ATIVO", loja=dono.nome_loja, confeiteiro_id=dono.id, imagem="produtos/teste2.jpg")
        resultado = ProdutoService.excluir_do_confeiteiro(avulso.id, dono.id)
        self.assertEqual(resultado, {"resultado": "excluido", "imagem": "produtos/teste2.jpg"})
        with self.assertRaises(ValueError):
            ProdutoService.buscar_por_id(avulso.id)

    def test_10_validacao_de_cnpj(self):
        self.assertEqual(validar_cnpj("11.222.333/0001-81"), "11222333000181")
        self.assertEqual(validar_cnpj("11222333000181"), "11222333000181")
        # CNPJ alfanumérico (exemplo oficial da Receita Federal)
        self.assertEqual(validar_cnpj("12.abc.345/01de-35"), "12ABC34501DE35")
        for invalido in ("", "11.222.333/0001-82", "00000000000000", "1122233300018", "11222333000A81", "12ABC34501DE36"):
            with self.assertRaises(ValueError):
                validar_cnpj(invalido)

    def test_09_confeiteiro_cadastro_login_e_sessao(self):
        email = self.prefixo + "confeiteiro@email.com"

        # CNPJs válidos e diferentes a cada execução
        base = "".join(random.choice(string.digits) for _ in range(8))
        cnpj = base + "0001" + calcular_dv_cnpj(base + "0001")
        outro_cnpj = base + "0002" + calcular_dv_cnpj(base + "0002")
        cnpj_formatado = f"{cnpj[:2]}.{cnpj[2:5]}.{cnpj[5:8]}/{cnpj[8:12]}-{cnpj[12:]}"

        with self.assertRaises(ValueError):
            ConfeiteiroService.cadastrar("Ana Doceira", "Doces da Ana", cnpj, email, "curta")
        with self.assertRaises(ValueError):
            ConfeiteiroService.cadastrar("Ana Doceira", "Doces da Ana", cnpj[:12] + "99", email, "SenhaForte123")
        with self.assertRaises(ValueError):
            ConfeiteiroService.cadastrar("Ana Doceira", "Doces da Ana", "", email, "SenhaForte123")

        confeiteiro = ConfeiteiroService.cadastrar("Ana Doceira", "Doces da Ana", cnpj_formatado, email.upper(), "SenhaForte123", "11977777777")
        self.assertEqual(confeiteiro.email, email)
        self.assertEqual(confeiteiro.nome_loja, "Doces da Ana")
        self.assertEqual(confeiteiro.cnpj, cnpj)
        self.assertFalse(hasattr(confeiteiro, "senha_hash"))

        with self.assertRaises(ValueError):
            ConfeiteiroService.cadastrar("Outra Ana", "Outra Loja", outro_cnpj, email, "SenhaForte123")
        with self.assertRaises(ValueError):
            ConfeiteiroService.cadastrar("Outra Ana", "Outra Loja", cnpj, self.prefixo + "outra@email.com", "SenhaForte123")

        with self.assertRaises(ErroAutenticacao):
            ConfeiteiroService.autenticar(email, "senha-errada")
        with self.assertRaises(ErroAutenticacao):
            ConfeiteiroService.autenticar(self.prefixo + "naoexiste@email.com", "SenhaForte123")

        sessao = ConfeiteiroService.autenticar(email, "SenhaForte123")
        self.assertEqual(sessao['confeiteiro'].id, confeiteiro.id)
        self.assertEqual(ConfeiteiroService.buscar_por_token(sessao['token']).id, confeiteiro.id)

        # A senha e o token não ficam gravados em texto puro
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT senha_hash FROM confeiteiro WHERE id = ?", (confeiteiro.id,))
                self.assertNotIn("SenhaForte123", cursor.fetchone()['senha_hash'])
                cursor.execute("SELECT token_hash FROM sessao_confeiteiro WHERE confeiteiro_id = ?", (confeiteiro.id,))
                self.assertNotEqual(cursor.fetchone()['token_hash'], sessao['token'])
        finally:
            conn.close()

        with self.assertRaises(ErroAutenticacao):
            ConfeiteiroService.buscar_por_token("token-invalido")

        ConfeiteiroService.encerrar_sessao(sessao['token'])
        with self.assertRaises(ErroAutenticacao):
            ConfeiteiroService.buscar_por_token(sessao['token'])


if __name__ == "__main__":
    unittest.main()
