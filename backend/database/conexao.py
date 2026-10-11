import os
from typing import Optional

import pyodbc
from dotenv import load_dotenv

load_dotenv()


class _Cursor:
    """Cursor do pyodbc com linhas em dicionário e uso em bloco with (sem commit implícito)."""

    def __init__(self, cursor, dictionary: bool = False):
        self._cursor = cursor
        self._dictionary = dictionary

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        self._cursor.close()
        return False

    def execute(self, sql: str, params=()):
        if params:
            self._cursor.execute(sql, tuple(params))
        else:
            self._cursor.execute(sql)
        return self

    def _converter(self, row):
        if row is None or not self._dictionary:
            return row
        colunas = [coluna[0] for coluna in self._cursor.description]
        return dict(zip(colunas, row))

    def fetchone(self):
        return self._converter(self._cursor.fetchone())

    def fetchall(self):
        return [self._converter(row) for row in self._cursor.fetchall()]

    @property
    def rowcount(self) -> int:
        return self._cursor.rowcount


class _Conexao:
    def __init__(self, conn):
        self._conn = conn

    def cursor(self, dictionary: bool = False) -> _Cursor:
        return _Cursor(self._conn.cursor(), dictionary)

    def commit(self) -> None:
        self._conn.commit()

    def rollback(self) -> None:
        self._conn.rollback()

    def close(self) -> None:
        self._conn.close()


def _valor_odbc(valor: str) -> str:
    return "{" + valor.replace("}", "}}") + "}"


def _conectar(database: Optional[str]) -> _Conexao:
    partes = [
        "DRIVER=" + _valor_odbc(os.getenv("DB_DRIVER", "ODBC Driver 18 for SQL Server")),
        "SERVER=" + os.getenv("DB_SERVER", r"localhost\SQLEXPRESS"),
        "Encrypt=" + os.getenv("DB_ENCRYPT", "yes"),
        "TrustServerCertificate=" + os.getenv("DB_TRUST_SERVER_CERTIFICATE", "yes"),
    ]
    if database:
        partes.append("DATABASE=" + _valor_odbc(database))

    usuario = os.getenv("DB_USER", "")
    if usuario:
        partes.append("UID=" + _valor_odbc(usuario))
        partes.append("PWD=" + _valor_odbc(os.getenv("DB_PASSWORD", "")))
    else:
        # Sem usuário configurado, usa a autenticação do Windows
        partes.append("Trusted_Connection=yes")

    conn = pyodbc.connect(";".join(partes), autocommit=False, timeout=int(os.getenv("DB_TIMEOUT", "10")))
    return _Conexao(conn)


def get_connection() -> _Conexao:
    return _conectar(os.getenv("DB_NAME", "unicake_db"))


def get_connection_without_db() -> _Conexao:
    return _conectar(None)
