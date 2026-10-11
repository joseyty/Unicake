from __future__ import annotations

from database.conexao import get_connection
from models.cliente import Cliente
from utils.seguranca import ErroAutenticacao, SESSAO_DIAS, hash_senha, hash_token, novo_salt, novo_token, senha_confere
from utils.validacoes import validar_email, validar_nome, validar_senha, validar_telefone

# Colunas públicas: nunca devolve senha_hash/senha_salt
COLUNAS = "id, nome, email, telefone, data_cadastro, administrador, CASE WHEN senha_hash IS NULL THEN 0 ELSE 1 END AS tem_senha"


class ClienteService:
    @staticmethod
    def _abrir_sessao(cursor, cliente_id: int) -> str:
        token = novo_token()
        cursor.execute(
            "INSERT INTO sessao_cliente (cliente_id, token_hash, data_expiracao) VALUES (?, ?, DATEADD(DAY, ?, SYSDATETIME()))",
            (cliente_id, hash_token(token), SESSAO_DIAS),
        )
        cursor.execute("DELETE FROM sessao_cliente WHERE data_expiracao <= SYSDATETIME()")
        return token

    @staticmethod
    def _carregar(cursor, cliente_id: int) -> Cliente:
        cursor.execute(f"SELECT {COLUNAS} FROM cliente WHERE id = ?", (cliente_id,))
        return Cliente(**cursor.fetchone())

    @staticmethod
    def cadastrar(nome: str, email: str, senha: str) -> dict:
        """Cria a conta do cliente com senha e já abre uma sessão. Retorna {"token", "cliente"}."""
        nome = validar_nome(nome, "nome do cliente")
        email = validar_email(email).lower()
        senha = validar_senha(senha)
        salt = novo_salt()
        senha_hash = hash_senha(senha, salt)

        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "SELECT id, senha_hash, google_sub FROM cliente WITH (UPDLOCK, HOLDLOCK) WHERE email = ?",
                    (email,),
                )
                existente = cursor.fetchone()
                if existente is None:
                    cursor.execute(
                        "INSERT INTO cliente (nome, email, senha_hash, senha_salt) OUTPUT INSERTED.id VALUES (?, ?, ?, ?)",
                        (nome, email, senha_hash, salt),
                    )
                    cliente_id = cursor.fetchone()['id']
                elif existente['senha_hash'] is not None:
                    raise ValueError("Já existe uma conta cadastrada com este e-mail.")
                elif existente['google_sub'] is not None:
                    raise ValueError("Este e-mail já tem conta com login do Google. Entre com o Google.")
                else:
                    # Cliente gravado por uma compra antiga, de antes de existir senha: passa a ter conta
                    cliente_id = existente['id']
                    cursor.execute(
                        "UPDATE cliente SET nome = ?, senha_hash = ?, senha_salt = ? WHERE id = ?",
                        (nome, senha_hash, salt, cliente_id),
                    )
                token = ClienteService._abrir_sessao(cursor, cliente_id)
                conn.commit()
                return {"token": token, "cliente": ClienteService._carregar(cursor, cliente_id)}
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def autenticar(email: str, senha: str) -> dict:
        """Confere e-mail e senha e abre uma sessão. Retorna {"token", "cliente"}."""
        email = str(email or "").strip().lower()
        senha = str(senha or "")
        if len(senha) > 200:
            raise ErroAutenticacao("E-mail ou senha incorretos.")

        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT id, senha_hash, senha_salt FROM cliente WHERE email = ?", (email,))
                row = cursor.fetchone()
                confere = senha_confere(senha, row['senha_salt'] if row else None, row['senha_hash'] if row else None)
                if row is None or row['senha_hash'] is None or not confere:
                    raise ErroAutenticacao("E-mail ou senha incorretos.")
                token = ClienteService._abrir_sessao(cursor, row['id'])
                conn.commit()
                return {"token": token, "cliente": ClienteService._carregar(cursor, row['id'])}
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def entrar_com_google(google_sub: str, nome: str, email: str) -> dict:
        """Abre sessão para uma conta Google já conferida pela API. Cria o cliente na primeira vez."""
        google_sub = str(google_sub or "").strip()
        if not google_sub:
            raise ErroAutenticacao("Login do Google inválido.")
        email = validar_email(email).lower()
        nome = validar_nome(nome or email.split("@")[0], "nome do cliente")

        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT id FROM cliente WITH (UPDLOCK, HOLDLOCK) WHERE google_sub = ?", (google_sub,))
                row = cursor.fetchone()
                if row is None:
                    cursor.execute("SELECT id FROM cliente WITH (UPDLOCK, HOLDLOCK) WHERE email = ?", (email,))
                    row = cursor.fetchone()
                    if row is None:
                        cursor.execute(
                            "INSERT INTO cliente (nome, email, google_sub) OUTPUT INSERTED.id VALUES (?, ?, ?)",
                            (nome, email, google_sub),
                        )
                        row = cursor.fetchone()
                    else:
                        # O Google confirmou que o e-mail é da pessoa, então liga à conta que já existe
                        cursor.execute("UPDATE cliente SET google_sub = ? WHERE id = ?", (google_sub, row['id']))
                token = ClienteService._abrir_sessao(cursor, row['id'])
                conn.commit()
                return {"token": token, "cliente": ClienteService._carregar(cursor, row['id'])}
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def buscar_por_token(token: str) -> Cliente:
        if not token:
            raise ErroAutenticacao("Entre na sua conta para continuar.")

        colunas = COLUNAS.replace("id, nome, email, telefone, data_cadastro, administrador", "c.id, c.nome, c.email, c.telefone, c.data_cadastro, c.administrador")
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    f"SELECT {colunas} FROM sessao_cliente s "
                    "INNER JOIN cliente c ON c.id = s.cliente_id "
                    "WHERE s.token_hash = ? AND s.data_expiracao > SYSDATETIME()",
                    (hash_token(token),),
                )
                row = cursor.fetchone()
            if row is None:
                raise ErroAutenticacao("Sessão inválida ou expirada. Entre novamente.")
            return Cliente(**row)
        finally:
            conn.close()

    @staticmethod
    def encerrar_sessao(token: str) -> None:
        if not token:
            return
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM sessao_cliente WHERE token_hash = ?", (hash_token(token),))
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def excluir_conta(cliente_id: int, senha: str = None) -> str:
        """Exclui a conta do cliente. Quem tem senha precisa confirmá-la.

        Sem pedidos, o cadastro é apagado ("excluida"). Com pedidos, os dados pessoais são
        apagados e o registro fica anônimo ("anonimizada"), para manter o histórico de vendas.
        """
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "SELECT id, senha_hash, senha_salt FROM cliente WITH (UPDLOCK, ROWLOCK) WHERE id = ?",
                    (cliente_id,),
                )
                row = cursor.fetchone()
                if row is None:
                    raise ValueError("Cliente não encontrado.")
                if row['senha_hash'] is not None and not senha_confere(senha, row['senha_salt'], row['senha_hash']):
                    raise ValueError("Senha incorreta.")

                cursor.execute("DELETE FROM sessao_cliente WHERE cliente_id = ?", (cliente_id,))
                cursor.execute(
                    "DELETE FROM item_carrinho WHERE carrinho_id IN (SELECT id FROM carrinho WHERE cliente_id = ?)",
                    (cliente_id,),
                )
                cursor.execute("DELETE FROM carrinho WHERE cliente_id = ?", (cliente_id,))
                # Os chamados de suporte ficam, mas sem o nome e o e-mail de quem saiu
                cursor.execute(
                    "UPDATE chamado SET nome = N'Cliente removido', email = ? WHERE cliente_id = ?",
                    (f"removido-{cliente_id}@unicake.invalid", cliente_id),
                )

                cursor.execute("SELECT TOP 1 1 AS tem FROM pedido WHERE cliente_id = ?", (cliente_id,))
                if cursor.fetchone() is None:
                    cursor.execute("DELETE FROM cliente WHERE id = ?", (cliente_id,))
                    resultado = "excluida"
                else:
                    cursor.execute(
                        "UPDATE cliente SET nome = N'Cliente removido', email = ?, telefone = NULL, "
                        "senha_hash = NULL, senha_salt = NULL, google_sub = NULL, administrador = 0 WHERE id = ?",
                        (f"removido-{cliente_id}@unicake.invalid", cliente_id),
                    )
                    resultado = "anonimizada"
                conn.commit()
            return resultado
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def criar(nome: str, email: str, telefone: str) -> Cliente:
        nome = validar_nome(nome, "nome do cliente")
        email = validar_email(email)
        telefone = validar_telefone(telefone)

        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "INSERT INTO cliente (nome, email, telefone) OUTPUT INSERTED.id VALUES (?, ?, ?)",
                    (nome, email, telefone),
                )
                cliente_id = cursor.fetchone()['id']
                conn.commit()
                cursor.execute(f"SELECT {COLUNAS} FROM cliente WHERE id = ?", (cliente_id,))
                row = cursor.fetchone()
            if row is None:
                raise ValueError("Cliente não foi criado.")
            return Cliente(**row)
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def listar() -> list[Cliente]:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(f"SELECT {COLUNAS} FROM cliente ORDER BY id ASC")
                rows = cursor.fetchall()
            return [Cliente(**row) for row in rows]
        finally:
            conn.close()

    @staticmethod
    def buscar_por_id(cliente_id: int) -> Cliente:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(f"SELECT {COLUNAS} FROM cliente WHERE id = ?", (cliente_id,))
                row = cursor.fetchone()
            if row is None:
                raise ValueError("Cliente não encontrado.")
            return Cliente(**row)
        finally:
            conn.close()

    @staticmethod
    def atualizar(cliente_id: int, nome: str = None, email: str = None, telefone: str = None) -> Cliente:
        cliente = ClienteService.buscar_por_id(cliente_id)
        novo_nome = cliente.nome if nome is None else validar_nome(nome, "nome do cliente")
        novo_email = cliente.email if email is None else validar_email(email)
        novo_telefone = cliente.telefone if telefone is None else validar_telefone(telefone)

        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "UPDATE cliente SET nome = ?, email = ?, telefone = ? WHERE id = ?",
                    (novo_nome, novo_email, novo_telefone, cliente_id),
                )
                conn.commit()
                cursor.execute(f"SELECT {COLUNAS} FROM cliente WHERE id = ?", (cliente_id,))
                row = cursor.fetchone()
            if row is None:
                raise ValueError("Cliente não encontrado após atualização.")
            return Cliente(**row)
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def excluir(cliente_id: int) -> None:
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM cliente WHERE id = ?", (cliente_id,))
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
