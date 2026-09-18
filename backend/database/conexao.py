import os
from typing import Optional

import mysql.connector
from dotenv import load_dotenv

load_dotenv()


def get_connection():
    config = {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("DB_PORT", "3306")),
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD", ""),
        "database": os.getenv("DB_NAME", "unicake_db"),
        "autocommit": False,
        "charset": "utf8mb4",
        "raise_on_warnings": True,
    }
    return mysql.connector.connect(**config)


def get_connection_without_db():
    config = {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("DB_PORT", "3306")),
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD", ""),
        "charset": "utf8mb4",
        "autocommit": False,
    }
    return mysql.connector.connect(**config)
