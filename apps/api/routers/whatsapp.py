from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.config import settings
from core.database import get_db
from core.security import get_current_user_and_org
from models.schema import WhatsAppAccount
from schemas.dto import WhatsAppAccountResponse
from services.whatsapp.factory import get_whatsapp_provider

router = APIRouter(prefix="/api/v1/whatsapp", tags=["WhatsApp"])

@router.get("/status")
async def get_whatsapp_status(
    current_user=Depends(get_current_user_and_org),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(WhatsAppAccount).where(WhatsAppAccount.organization_id == current_user.organization_id)
    res = await db.execute(stmt)
    account = res.scalar_one_or_none()

    provider = get_whatsapp_provider()
    is_connected = await provider.validate_credentials()

    if account:
        return {
            "status": "connected" if is_connected else "error",
            "provider_mode": settings.WHATSAPP_PROVIDER_MODE,
            "display_phone_number": account.display_phone_number,
            "business_account_id": account.business_account_id,
            "phone_number_id": account.phone_number_id,
            "is_connected": is_connected
        }

    return {
        "status": "connected" if settings.WHATSAPP_PROVIDER_MODE == "mock" else "disconnected",
        "provider_mode": settings.WHATSAPP_PROVIDER_MODE,
        "display_phone_number": "+91 98765 43210 (Mock Provider)",
        "business_account_id": "100000000000000",
        "phone_number_id": "200000000000000",
        "is_connected": True
    }
