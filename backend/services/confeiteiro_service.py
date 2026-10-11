from __future__ import annotations

from database.conexao import get_connection
from models.confeiteiro import Confeiteiro
from services.controle_acesso_service import ControleAcesso
from utils.seguranca import ErroAutenticacao, SESSAO_DIAS, hash_senha, hash_token, novo_salt, novo_token, senha_confere
from utils.validacoes import validar_cnpj, validar_email, validar_nome, validar_senha

# Colunas públicas: nunca devolve senha_hash/senha_salt
COLUNAS = "id, nome, nome_loja, cnpj, email, telefone, ativo, data_cadastro"


class ConfeiteiroService:
    @staticmethod
    def cadastrar(nome: str, nome_loja: str, cnpj: str, email: str, senha: str, telefone: str = None) -> Confeiteiro:
        nome = validar_nome(nome, "nome do confeiteiro")
        nome_loja = validar_nome(nome_loja, "nome da loja")
        cnpj = validar_cnpj(cnpj)
        email = validar_email(email).lower()
        senha = validar_senha(senha)
        telefone = str(telefone or "").strip() or None

        salt = novo_salt()
        senha_hash = hash_senha(senha, salt)

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
        # Conta travada por senhas erradas nem chega a conferir a senha
        ControleAcesso.conferir("CONFEITEIRO", email)

        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    f"SELECT {COLUNAS}, senha_hash, senha_salt FROM confeiteiro WHERE email = ?",
                    (email,),
                )
                row = cursor.fetchone()

                confere = senha_confere(senha, row['senha_salt'] if row else None, row['senha_hash'] if row else None)
                if row is None or not confere:
                    restantes = ControleAcesso.registrar_falha("CONFEITEIRO", email)
                    raise ErroAutenticacao(ControleAcesso.mensagem_de_erro(restantes))
                ControleAcesso.limpar("CONFEITEIRO", email)
                if not row['ativo']:
                    raise ErroAutenticacao("Este cadastro está desativado.")

                token = novo_token()
                cursor.execute(
                    "INSERT INTO sessao_confeiteiro (confeiteiro_id, token_hash, data_expiracao) VALUES (?, ?, DATEADD(DAY, ?, SYSDATETIME()))",
                    (row['id'], hash_token(token), SESSAO_DIAS),
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
                    (hash_token(token),),
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
                cursor.execute("DELETE FROM sessao_confeiteiro WHERE token_hash = ?", (hash_token(token),))
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def excluir_conta(confeiteiro_id: int, senha: str) -> list[str]:
        """Exclui a conta do confeiteiro depois de conferir a senha. Retorna as fotos a apagar do disco.

        Produtos que já foram comprados ficam no banco, desativados e sem dono, para manter o
        histórico dos pedidos; os demais são apagados junto com a conta.
        """
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "SELECT id, senha_hash, senha_salt FROM confeiteiro WITH (UPDLOCK, ROWLOCK) WHERE id = ?",
                    (confeiteiro_id,),
                )
                row = cursor.fetchone()
                if row is None:
                    raise ValueError("Confeiteiro não encontrado.")
                if not senha_confere(senha, row['senha_salt'], row['senha_hash']):
                    raise ValueError("Senha incorreta.")

                cursor.execute(
                    "SELECT imagem FROM produto WITH (UPDLOCK) WHERE confeiteiro_id = ? AND imagem IS NOT NULL",
                    (confeiteiro_id,),
                )
                fotos = [produto['imagem'] for produto in cursor.fetchall()]

                cursor.execute(
                    "DELETE FROM item_carrinho WHERE produto_id IN (SELECT id FROM produto WHERE confeiteiro_id = ?)",
                    (confeiteiro_id,),
                )
                cursor.execute(
                    "UPDATE produto SET status = 'INATIVO', fidelidade = 0, imagem = NULL, confeiteiro_id = NULL "
                    "WHERE confeiteiro_id = ? AND id IN (SELECT produto_id FROM item_pedido)",
                    (confeiteiro_id,),
                )
                cursor.execute("DELETE FROM produto WHERE confeiteiro_id = ?", (confeiteiro_id,))
                # As sessões saem junto (ON DELETE CASCADE)
                cursor.execute("DELETE FROM confeiteiro WHERE id = ?", (confeiteiro_id,))
                conn.commit()
            return fotos
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
