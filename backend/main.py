from __future__ import annotations

from database.conexao import get_connection
from services.categoria_service import CategoriaService
from services.produto_service import ProdutoService
from services.cliente_service import ClienteService
from services.endereco_service import EnderecoService
from services.carrinho_service import CarrinhoService
from services.pedido_service import PedidoService


MENU = """
=== Backend Unicake ===
1. Listar categorias
2. Cadastrar categoria
3. Listar produtos
4. Cadastrar produto
5. Cadastrar cliente
6. Cadastrar endereço
7. Criar carrinho
8. Adicionar produto ao carrinho
9. Criar pedido
10. Listar pedidos
11. Cancelar pedido
0. Sair
"""


def testar_conexao() -> None:
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1")
            resultado = cursor.fetchone()
        print("Conexão com MySQL/MariaDB OK:", resultado)
        conn.close()
    except Exception as exc:
        print(f"Não foi possível conectar ao banco: {exc}")
        print("Configure as variáveis de ambiente em .env antes de testar operações reais.")


def exemplo_basico() -> None:
    try:
        categorias = CategoriaService.listar()
        print("Categorias:", categorias)
    except Exception as exc:
        print(f"Erro ao consultar categorias: {exc}")


def main() -> None:
    print("Backend de vendas de doces da Unicake")
    testar_conexao()
    exemplo_basico()

    print("\nObservações:")
    print("- O banco deve estar em MySQL/MariaDB externo.")
    print("- Ajuste as credenciais em .env antes de operar em dados reais.")
    print("- Este arquivo serve como ponto de teste do backend em terminal.")


if __name__ == "__main__":
    main()
