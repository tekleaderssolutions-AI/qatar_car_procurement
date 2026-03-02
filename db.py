"""
Qatar AI Platform - Database connection (PostgreSQL only).
Async SQLAlchemy engine (asyncpg) with sync facade for legacy code.
"""
import os
from pathlib import Path
from urllib.parse import quote_plus

from dotenv import load_dotenv
from sqlalchemy.engine import Engine
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

load_dotenv(Path(__file__).resolve().parent / ".env")


def get_database_url() -> str:
    url = os.environ.get("DATABASE_URL", "").strip()
    if url:
        # Prefer asyncpg driver for PostgreSQL
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url
    host = os.environ.get("DB_HOST", "").strip()
    if host:
        user = os.environ.get("DB_USER", "").strip() or "postgres"
        password = os.environ.get("DB_PASSWORD", "").strip()
        port = os.environ.get("DB_PORT", "").strip() or "5432"
        name = os.environ.get("DB_NAME", "").strip() or "qauto"
        sslmode = os.environ.get("DB_SSLMODE", "").strip()
        auth = f"{quote_plus(user)}:{quote_plus(password)}@" if password else f"{quote_plus(user)}@"
        base = f"postgresql+asyncpg://{auth}{host}:{port}/{name}"
        return f"{base}?sslmode={quote_plus(sslmode)}" if sslmode else base
    raise RuntimeError(
        "PostgreSQL required. Set DATABASE_URL (e.g. postgresql://user:password@host:5432/qauto) "
        "or DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (and optionally DB_PORT, DB_SSLMODE)."
    )


_async_engine: AsyncEngine | None = None
_sync_engine: Engine | None = None


def get_async_engine() -> AsyncEngine:
    """Return global AsyncEngine using asyncpg."""
    global _async_engine
    if _async_engine is None:
        url = get_database_url()
        _async_engine = create_async_engine(
            url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            pool_recycle=300,
        )
    return _async_engine


def get_engine() -> Engine:
    """
    Backwards-compatible synchronous Engine facade.
    Uses AsyncEngine.sync_engine under the hood so existing code keeps working.
    """
    global _sync_engine
    if _sync_engine is None:
        _sync_engine = get_async_engine().sync_engine
    return _sync_engine


def is_postgres() -> bool:
    return True
