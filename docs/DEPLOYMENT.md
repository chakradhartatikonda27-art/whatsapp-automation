# Production Deployment Guide

## Prerequisites
- Docker Engine 24.0+ & Docker Compose v2+
- PostgreSQL 16
- Redis 7.0+

## Quickstart Deployment via Docker Compose

```bash
# 1. Clone repository & configure environment variables
cp .env.example .env

# 2. Build and launch containers
docker-compose up --build -d

# 3. Initialize Database Schema & Seed Data
docker exec -it whatsapp_api python seed.py
```

## Production Infrastructure Topology

Deploy services on AWS ECS / DigitalOcean App Platform / Railway / Render:
- `api`: FastAPI application (Uvicorn behind NGINX / ALB reverse proxy)
- `worker`: Celery background worker processes (`celery -A worker_entry.celery_app worker`)
- `web`: Next.js 14 frontend Node.js server
- `postgres`: Managed PostgreSQL instance (AWS RDS / DigitalOcean Managed DB)
- `redis`: Managed Redis instance (AWS ElastiCache / Redis Cloud)
