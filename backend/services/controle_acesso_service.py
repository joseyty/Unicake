from __future__ import annotations

from database.conexao import get_connection
from utils.seguranca import ErroBloqueio

# Depois de 5 senhas erradas seguidas, o login daquela conta fica travado por 2 minutos
LIMITE_FALHAS = 5
BLOQUEIO_SEGUNDOS = 120
# Erros com mais de 15 minutos de intervalo não se somam
JANELA_SEGUNDOS = 15 * 60


def _chave(email: str) -> str:
    return str(email or "").strip().lower()[:150]


class ControleAcesso:
    """Conta as tentativas de login erradas por conta (tipo + e-mail) e aplica o bloqueio temporário.

    Usa uma conexão própria: a falha precisa ficar gravada mesmo quando o login é recusado.
    """

    @staticmethod
    def conferir(tipo: str, email: str) -> None:
        """Levanta ErroBloqueio se a conta ainda está no tempo de espera."""
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "SELECT DATEDIFF(SECOND, SYSDATETIME(), bloqueado_ate) AS restante FROM tentativa_login WHERE tipo = ? AND email = ?",
                    (tipo, _chave(email)),
                )
                row = cursor.fetchone()
            if row and row['restante'] is not None and row['restante'] > 0:
                raise ErroBloqueio(row['restante'])
        finally:
            conn.close()

    @staticmethod
    def registrar_falha(tipo: str, email: str) -> int:
        """Soma uma senha errada. Devolve quantas tentativas restam, ou levanta ErroBloqueio na 5ª."""
        chave = _chave(email)
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "SELECT falhas, DATEDIFF(SECOND, ultima_falha, SYSDATETIME()) AS idade "
                    "FROM tentativa_login WITH (UPDLOCK, HOLDLOCK) WHERE tipo = ? AND email = ?",
                    (tipo, chave),
                )
                row = cursor.fetchone()
                falhas = 1 if row is None or row['idade'] > JANELA_SEGUNDOS else row['falhas'] + 1
                bloquear = falhas >= LIMITE_FALHAS

                if row is None:
                    cursor.execute("INSERT INTO tentativa_login (tipo, email, falhas) VALUES (?, ?, 0)", (tipo, chave))
                cursor.execute(
                    "UPDATE tentativa_login SET falhas = ?, ultima_falha = SYSDATETIME(), "
                    "bloqueado_ate = CASE WHEN ? = 1 THEN DATEADD(SECOND, ?, SYSDATETIME()) ELSE NULL END "
                    "WHERE tipo = ? AND email = ?",
                    (0 if bloquear else falhas, 1 if bloquear else 0, BLOQUEIO_SEGUNDOS, tipo, chave),
                )
                # Registros antigos não servem mais para nada
                cursor.execute("DELETE FROM tentativa_login WHERE ultima_falha < DATEADD(DAY, -1, SYSDATETIME())")
                conn.commit()
            if bloquear:
                raise ErroBloqueio(BLOQUEIO_SEGUNDOS)
            return LIMITE_FALHAS - falhas
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def limpar(tipo: str, email: str) -> None:
        """Login certo zera a contagem."""
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM tentativa_login WHERE tipo = ? AND email = ?", (tipo, _chave(email)))
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def mensagem_de_erro(restantes: int) -> str:
        if restantes == 1:
            return "E-mail ou senha incorretos. Resta 1 tentativa antes do bloqueio de 2 minutos."
        return f"E-mail ou senha incorretos. Restam {restantes} tentativas."
