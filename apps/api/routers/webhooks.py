import hashlib
import hmac
import uuid
from fastapi import APIRouter, Depends, Request, Response, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from core.config import settings
from core.database import get_db
from services.webhook_service import process_whatsapp_webhook_event

router = APIRouter(prefix="/api/v1/webhooks", tags=["Webhooks"])

@router.get("/whatsapp")
async def verify_whatsapp_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge")
):
    """
    Webhook Verification endpoint required by Meta Graph API.
    """
    if hub_mode == "subscribe" and hub_verify_token == settings.WHATSAPP_WEBHOOK_VERIFY_TOKEN:
        return Response(content=hub_challenge, media_type="text/plain")
    raise HTTPException(status_code=403, detail="Invalid verification token or hub mode")

@router.post("/whatsapp")
async def receive_whatsapp_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Receives real-time message status updates (sent, delivered, read, failed) from Meta WhatsApp Cloud API.
    """
    body_bytes = await request.body()
    
    # Optional Signature Validation if WHATSAPP_APP_SECRET is set
    if settings.WHATSAPP_APP_SECRET:
        signature = request.headers.get("X-Hub-Signature-256", "")
        if signature.startswith("sha256="):
            expected_sig = hmac.new(
                settings.WHATSAPP_APP_SECRET.encode('utf-8'),
                body_bytes,
                hashlib.sha256
            ).hexdigest()
            if not hmac.compare_digest(signature[7:], expected_sig):
                raise HTTPException(status_code=401, detail="Invalid X-Hub-Signature-256 signature")

    payload = await request.json()
    external_event_id = f"evt_{hashlib.md5(body_bytes).hexdigest()}"

    await process_whatsapp_webhook_event(db, payload, external_event_id)
    return {"status": "success"}
