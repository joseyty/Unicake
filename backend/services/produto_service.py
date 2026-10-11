from __future__ import annotations

from database.conexao import get_connection
from models.produto import Produto
from utils.validacoes import validar_nome, validar_preco, validar_estoque


class ProdutoService:
    # Quantos produtos de um mesmo confeiteiro podem participar do cartão fidelidade
    LIMITE_FIDELIDADE = 10

    @staticmethod
    def criar(categoria_id: int, nome: str, descricao: str = None, preco: float = 0, estoque: int = 0, status: str = 'ATIVO', codigo: str = None, loja: str = None, confeiteiro_id: int = None, imagem: str = None) -> Produto:
        nome = validar_nome(nome, "nome do produto")
        if len(nome) > 150:
            raise ValueError("O nome do produto deve ter no máximo 150 caracteres.")
        codigo = str(codigo or "").strip() or None
        preco = validar_preco(preco)
        estoque = validar_estoque(estoque)
        status = str(status or 'ATIVO').upper()
        if status not in {'ATIVO', 'INATIVO'}:
            raise ValueError("Status do produto inválido.")

        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "SELECT id FROM categoria WHERE id = ?",
                    (categoria_id,),
                )
                if cursor.fetchone() is None:
                    raise ValueError("Categoria não encontrada.")

                cursor.execute(
                    "INSERT INTO produto (categoria_id, codigo, loja, nome, descricao, preco, estoque, status, confeiteiro_id, imagem) OUTPUT INSERTED.id VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (categoria_id, codigo, loja, nome, descricao, preco, estoque, status, confeiteiro_id, imagem),
                )
                produto_id = cursor.fetchone()['id']
                if codigo is None and confeiteiro_id is not None:
                    # O site identifica o produto pelo código; os de confeiteiros usam "p" + id
                    cursor.execute("UPDATE produto SET codigo = ? WHERE id = ?", (f"p{produto_id}", produto_id))
                conn.commit()
                cursor.execute("SELECT * FROM produto WHERE id = ?", (produto_id,))
                row = cursor.fetchone()
            if row is None:
                raise ValueError("Produto não foi criado.")
            return Produto(**row)
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def listar() -> list[Produto]:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT * FROM produto ORDER BY id ASC")
                rows = cursor.fetchall()
            return [Produto(**row) for row in rows]
        finally:
            conn.close()

    @staticmethod
    def buscar_por_id(produto_id: int) -> Produto:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT * FROM produto WHERE id = ?", (produto_id,))
                row = cursor.fetchone()
            if row is None:
                raise ValueError("Produto não encontrado.")
            return Produto(**row)
        finally:
            conn.close()

    @staticmethod
    def atualizar(produto_id: int, categoria_id: int = None, nome: str = None, descricao: str = None, preco: float = None, estoque: int = None, status: str = None) -> Produto:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT * FROM produto WITH (UPDLOCK, ROWLOCK) WHERE id = ?", (produto_id,))
                atual = cursor.fetchone()
                if atual is None:
                    raise ValueError("Produto não encontrado.")
                produto = Produto(**atual)

                novo_categoria_id = produto.categoria_id if categoria_id is None else categoria_id
                novo_nome = produto.nome if nome is None else validar_nome(nome, "nome do produto")
                nova_descricao = produto.descricao if descricao is None else descricao
                novo_preco = produto.preco if preco is None else validar_preco(preco)
                novo_estoque = produto.estoque if estoque is None else validar_estoque(estoque)
                novo_status = produto.status if status is None else str(status).upper()

                if novo_status not in {'ATIVO', 'INATIVO'}:
                    raise ValueError("Status do produto inválido.")

                if novo_categoria_id is not None:
                    cursor.execute("SELECT id FROM categoria WHERE id = ?", (novo_categoria_id,))
                    if cursor.fetchone() is None:
                        raise ValueError("Categoria não encontrada.")

                cursor.execute(
                    "UPDATE produto SET categoria_id = ?, nome = ?, descricao = ?, preco = ?, estoque = ?, status = ? WHERE id = ?",
                    (novo_categoria_id, novo_nome, nova_descricao, novo_preco, novo_estoque, novo_status, produto_id),
                )
                conn.commit()
                cursor.execute("SELECT * FROM produto WHERE id = ?", (produto_id,))
                row = cursor.fetchone()
            if row is None:
                raise ValueError("Produto não encontrado após atualização.")
            return Produto(**row)
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def listar_por_confeiteiro(confeiteiro_id: int) -> list[Produto]:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT * FROM produto WHERE confeiteiro_id = ? ORDER BY id DESC", (confeiteiro_id,))
                rows = cursor.fetchall()
            return [Produto(**row) for row in rows]
        finally:
            conn.close()

    @staticmethod
    def listar_catalogo_parceiros() -> list[dict]:
        """Produtos ativos cadastrados por confeiteiros, com o nome da categoria, para o catálogo do site."""
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "SELECT p.id, p.codigo, p.loja, p.nome, p.descricao, p.preco, p.estoque, p.imagem, p.fidelidade, c.nome AS categoria "
                    "FROM produto p "
                    "INNER JOIN categoria c ON c.id = p.categoria_id "
                    "INNER JOIN confeiteiro f ON f.id = p.confeiteiro_id "
                    "WHERE p.status = 'ATIVO' AND p.estoque > 0 AND f.ativo = 1 "
                    "ORDER BY p.id DESC"
                )
                return cursor.fetchall()
        finally:
            conn.close()

    @staticmethod
    def definir_fidelidade(produto_id: int, confeiteiro_id: int, ativo: bool) -> Produto:
        """Coloca ou tira um produto do cartão fidelidade, respeitando o limite por confeiteiro."""
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                # Trava os produtos do confeiteiro para dois cliques simultâneos não passarem do limite
                cursor.execute(
                    "SELECT id, status, fidelidade FROM produto WITH (UPDLOCK, HOLDLOCK) WHERE confeiteiro_id = ?",
                    (confeiteiro_id,),
                )
                produtos = cursor.fetchall()
                produto = next((p for p in produtos if p['id'] == produto_id), None)
                if produto is None:
                    raise ValueError("Produto não encontrado.")
                if ativo and not produto['fidelidade']:
                    if produto['status'] != 'ATIVO':
                        raise ValueError("Produto desativado não pode entrar no cartão fidelidade.")
                    if sum(1 for p in produtos if p['fidelidade']) >= ProdutoService.LIMITE_FIDELIDADE:
                        raise ValueError(
                            f"O cartão fidelidade aceita até {ProdutoService.LIMITE_FIDELIDADE} produtos. "
                            "Tire um produto para colocar outro."
                        )
                cursor.execute("UPDATE produto SET fidelidade = ? WHERE id = ?", (1 if ativo else 0, produto_id))
                conn.commit()
                cursor.execute("SELECT * FROM produto WHERE id = ?", (produto_id,))
                return Produto(**cursor.fetchone())
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def excluir_do_confeiteiro(produto_id: int, confeiteiro_id: int) -> dict:
        """Remove um produto do confeiteiro. Se já houver pedidos com ele, apenas desativa.

        Retorna {"resultado": "excluido" | "desativado", "imagem": caminho da foto ou None}.
        """
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "SELECT id, imagem FROM produto WITH (UPDLOCK, ROWLOCK) WHERE id = ? AND confeiteiro_id = ?",
                    (produto_id, confeiteiro_id),
                )
                produto = cursor.fetchone()
                if produto is None:
                    raise ValueError("Produto não encontrado.")

                cursor.execute("SELECT TOP 1 1 AS usado FROM item_pedido WHERE produto_id = ?", (produto_id,))
                if cursor.fetchone() is not None:
                    cursor.execute("UPDATE produto SET status = 'INATIVO', fidelidade = 0 WHERE id = ?", (produto_id,))
                    conn.commit()
                    return {"resultado": "desativado", "imagem": None}

                cursor.execute("DELETE FROM item_carrinho WHERE produto_id = ?", (produto_id,))
                cursor.execute("DELETE FROM produto WHERE id = ?", (produto_id,))
                conn.commit()
            return {"resultado": "excluido", "imagem": produto['imagem']}
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def excluir(produto_id: int) -> None:
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM produto WHERE id = ?", (produto_id,))
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def alterar_preco(produto_id: int, novo_preco: float) -> Produto:
        preco = validar_preco(novo_preco)
        return ProdutoService.atualizar(produto_id, preco=preco)

    @staticmethod
    def alterar_estoque(produto_id: int, novo_estoque: int) -> Produto:
        estoque = validar_estoque(novo_estoque)
        return ProdutoService.atualizar(produto_id, estoque=estoque)

    @staticmethod
    def ativar(produto_id: int) -> Produto:
        return ProdutoService.atualizar(produto_id, status='ATIVO')

    @staticmethod
    def desativar(produto_id: int) -> Produto:
        return ProdutoService.atualizar(produto_id, status='INATIVO')
