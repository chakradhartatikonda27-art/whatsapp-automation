import os
import socket
from typing import AsyncGenerator
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
from core.config import settings

def is_postgres_reachable(host="localhost", port=5432) -> bool:
    try:
        with socket.create_connection((host, port), timeout=0.5):
            return True
    except Exception:
        return False

use_pg = is_postgres_reachable(settings.POSTGRES_HOST, settings.POSTGRES_PORT)

LOCAL_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "local_dev.db")

if use_pg:
    async_db_url = settings.DATABASE_URL
    if "postgresql" in async_db_url and not async_db_url.startswith("postgresql+asyncpg"):
        async_db_url = async_db_url.replace("postgresql://", "postgresql+asyncpg://")
    sync_db_url = settings.SYNC_DATABASE_URL
else:
    async_db_url = f"sqlite+aiosqlite:///{LOCAL_DB_PATH}"
    sync_db_url = f"sqlite:///{LOCAL_DB_PATH}"

# Async Engine (FastAPI handlers)
async_engine = create_async_engine(
    async_db_url,
    echo=False,
    future=True,
    **({"pool_size": 20, "max_overflow": 10} if use_pg else {})
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

# Sync Engine (Celery worker / seed script)
sync_engine = create_engine(
    sync_db_url,
    echo=False,
    **({"pool_size": 10, "max_overflow": 5} if use_pg else {"connect_args": {"check_same_thread": False}})
)

SyncSessionLocal = sessionmaker(
    bind=sync_engine,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for obtaining an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def set_tenant_rls_context(session: AsyncSession, organization_id: str):
    """Sets PostgreSQL session local variable 'app.current_org_id' to enforce RLS."""
    if organization_id and use_pg and session.bind and session.bind.dialect.name == "postgresql":
        await session.execute(
            text("SELECT set_config('app.current_org_id', :org_id, false)"),
            {"org_id": str(organization_id)}
        )

def set_sync_tenant_rls_context(session, organization_id: str):
    """Sets PostgreSQL session local variable in synchronous Celery workers."""
    if organization_id and use_pg and session.bind and session.bind.dialect.name == "postgresql":
        session.execute(
            text("SELECT set_config('app.current_org_id', :org_id, false)"),
            {"org_id": str(organization_id)}
        )
