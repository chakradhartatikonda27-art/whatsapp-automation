import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from fastapi.staticfiles import StaticFiles
from routers import auth, imports, campaigns, contacts, templates, webhooks, whatsapp, media

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Ensure upload directory exists and mount static files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(imports.router)
app.include_router(campaigns.router)
app.include_router(contacts.router)
app.include_router(templates.router)
app.include_router(webhooks.router)
app.include_router(whatsapp.router)
app.include_router(media.router)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "provider_mode": settings.WHATSAPP_PROVIDER_MODE
    }

@app.get("/ready")
def readiness_check():
    return {"status": "ready"}
