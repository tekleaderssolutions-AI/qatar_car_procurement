"""
Qatar AI Platform - Database connection (PostgreSQL or SQLite).
Set DATABASE_URL for PostgreSQL, e.g.:
  postgresql://user:password@localhost:5432/qauto
If unset, uses SQLite at qauto.db (development fallback).
"""
import os
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from urllib.parse import quote_plus

ROOT = Path(__file__).resolve().parent
SQLITE_PATH = ROOT / "qauto.db"

def get_database_url() -> str:
    url = os.environ.get("DATABASE_URL", "").strip()
    if url:
        # Ensure psycopg2 driver for PostgreSQL (postgresql:// → postgresql+psycopg2:// if needed)
        if url.startswith("postgresql://") and "psycopg2" not in url:
            url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return url
    # Support discrete env vars (useful for sharing creds safely)
    host = os.environ.get("DB_HOST", "").strip()
    if host:
        user = os.environ.get("DB_USER", "").strip() or "postgres"
        password = os.environ.get("DB_PASSWORD", "").strip()
        port = os.environ.get("DB_PORT", "").strip() or "5432"
        name = os.environ.get("DB_NAME", "").strip() or "qauto"
        sslmode = os.environ.get("DB_SSLMODE", "").strip()
        auth = f"{quote_plus(user)}:{quote_plus(password)}@" if password else f"{quote_plus(user)}@"
        base = f"postgresql+psycopg2://{auth}{host}:{port}/{name}"
        return f"{base}?sslmode={quote_plus(sslmode)}" if sslmode else base
    return f"sqlite:///{SQLITE_PATH}"

_engine: Engine | None = None

def get_engine() -> Engine:
    global _engine
    if _engine is None:
        url = get_database_url()
        kwargs = {"pool_pre_ping": True}
        if "sqlite" in url:
            kwargs["connect_args"] = {"check_same_thread": False}
        _engine = create_engine(url, **kwargs)
    return _engine

def is_postgres() -> bool:
    return "postgresql" in get_database_url()
