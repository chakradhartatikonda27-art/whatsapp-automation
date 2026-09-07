import os
import sys
from celery import Celery
from core.config import settings

# Add apps/api to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

celery_app = Celery(
    "whatsapp_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,
    worker_concurrency=4,
)

# Import tasks module
import worker_tasks  # noqa
