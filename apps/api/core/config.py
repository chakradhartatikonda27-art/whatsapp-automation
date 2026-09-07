import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "WhatsApp Campaign SaaS"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    SECRET_KEY: str = "super-secret-production-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # PostgreSQL Databases
    POSTGRES_USER: str = "whatsapp_user"
    POSTGRES_PASSWORD: str = "whatsapp_password"
    POSTGRES_DB: str = "whatsapp_saas"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    
    DATABASE_URL: str = "postgresql+asyncpg://whatsapp_user:whatsapp_password@localhost:5432/whatsapp_saas"
    SYNC_DATABASE_URL: str = "postgresql://whatsapp_user:whatsapp_password@localhost:5432/whatsapp_saas"

    # Redis Queue
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"

    # WhatsApp API Mode: "mock" or "meta"
    WHATSAPP_PROVIDER_MODE: str = "mock"

    # Meta Credentials
    WHATSAPP_API_VERSION: str = "v20.0"
    WHATSAPP_ACCESS_TOKEN: Optional[str] = None
    WHATSAPP_BUSINESS_ACCOUNT_ID: Optional[str] = None
    WHATSAPP_PHONE_NUMBER_ID: Optional[str] = None
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: str = "real_estate_whatsapp_webhook_secret_token_123"
    WHATSAPP_APP_SECRET: Optional[str] = None

    # Storage directory
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
