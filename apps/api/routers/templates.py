from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from core.database import get_db
from core.security import get_current_user_and_org
from models.schema import MessageTemplate
from schemas.dto import TemplateResponse

router = APIRouter(prefix="/api/v1/templates", tags=["Templates"])

@router.get("", response_model=List[TemplateResponse])
async def list_templates(
    current_user=Depends(get_current_user_and_org),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(MessageTemplate).where(
        MessageTemplate.organization_id == current_user.organization_id
    ).order_by(desc(MessageTemplate.created_at))
    result = await db.execute(stmt)
    return result.scalars().all()
