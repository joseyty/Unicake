from __future__ import annotations

from database.conexao import get_connection
from models.endereco import Endereco
from utils.validacoes import validar_cep


class EnderecoService:
    @staticmethod
    def criar(cliente_id: int, cep: str, estado: str, cidade: str, bairro: str, rua: str, numero: str, complemento: str = None, referencia: str = None) -> Endereco:
        if not cliente_id:
            raise ValueError("Cliente é obrigatório.")
        cep = validar_cep(cep)
        estado = str(estado or "").strip()
        cidade = str(cidade or "").strip()
        bairro = str(bairro or "").strip()
        rua = str(rua or "").strip()
        numero = str(numero or "").strip()
        if not estado or not cidade or not bairro or not rua or not numero:
            raise ValueError("Estado, cidade, bairro, rua e número são obrigatórios.")

        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT id FROM cliente WHERE id = %s", (cliente_id,))
                if cursor.fetchone() is None:
                    raise ValueError("Cliente não encontrado.")

                cursor.execute(
                    "INSERT INTO endereco (cliente_id, cep, estado, cidade, bairro, rua, numero, complemento, referencia) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                    (cliente_id, cep, estado, cidade, bairro, rua, numero, complemento, referencia),
                )
                conn.commit()
                endereco_id = cursor.lastrowid
                cursor.execute("SELECT * FROM endereco WHERE id = %s", (endereco_id,))
                row = cursor.fetchone()
            if row is None:
                raise ValueError("Endereço não foi criado.")
            return Endereco(**row)
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def listar_por_cliente(cliente_id: int) -> list[Endereco]:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT * FROM endereco WHERE cliente_id = %s ORDER BY id ASC", (cliente_id,))
                rows = cursor.fetchall()
            return [Endereco(**row) for row in rows]
        finally:
            conn.close()

    @staticmethod
    def buscar_por_id(endereco_id: int) -> Endereco:
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT * FROM endereco WHERE id = %s", (endereco_id,))
                row = cursor.fetchone()
            if row is None:
                raise ValueError("Endereço não encontrado.")
            return Endereco(**row)
        finally:
            conn.close()

    @staticmethod
    def atualizar(endereco_id: int, cep: str = None, estado: str = None, cidade: str = None, bairro: str = None, rua: str = None, numero: str = None, complemento: str = None, referencia: str = None) -> Endereco:
        endereco = EnderecoService.buscar_por_id(endereco_id)
        novo_cep = endereco.cep if cep is None else validar_cep(cep)
        novo_estado = endereco.estado if estado is None else str(estado).strip()
        nova_cidade = endereco.cidade if cidade is None else str(cidade).strip()
        novo_bairro = endereco.bairro if bairro is None else str(bairro).strip()
        nova_rua = endereco.rua if rua is None else str(rua).strip()
        novo_numero = endereco.numero if numero is None else str(numero).strip()
        novo_complemento = endereco.complemento if complemento is None else complemento
        nova_referencia = endereco.referencia if referencia is None else referencia

        if not novo_estado or not nova_cidade or not novo_bairro or not nova_rua or not novo_numero:
            raise ValueError("Estado, cidade, bairro, rua e número são obrigatórios.")

        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "UPDATE endereco SET cep = %s, estado = %s, cidade = %s, bairro = %s, rua = %s, numero = %s, complemento = %s, referencia = %s WHERE id = %s",
                    (novo_cep, novo_estado, nova_cidade, novo_bairro, nova_rua, novo_numero, novo_complemento, nova_referencia, endereco_id),
                )
                conn.commit()
                cursor.execute("SELECT * FROM endereco WHERE id = %s", (endereco_id,))
                row = cursor.fetchone()
            if row is None:
                raise ValueError("Endereço não encontrado após atualização.")
            return Endereco(**row)
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def excluir(endereco_id: int) -> None:
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM endereco WHERE id = %s", (endereco_id,))
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
