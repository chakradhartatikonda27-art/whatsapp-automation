from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from core.database import get_db
from core.security import get_current_user_and_org
from models.schema import Contact, CampaignContact, Campaign
from schemas.dto import ContactCreate, ContactResponse

router = APIRouter(prefix="/api/v1/contacts", tags=["Contacts"])

@router.get("", response_model=List[ContactResponse])
async def list_contacts(
    search: Optional[str] = Query(None),
    current_user=Depends(get_current_user_and_org),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Contact).where(
        Contact.organization_id == current_user.organization_id
    ).order_by(desc(Contact.created_at))

    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            (Contact.name.ilike(pattern)) |
            (Contact.phone_number.ilike(pattern)) |
            (Contact.location.ilike(pattern))
        )

    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("", response_model=ContactResponse)
async def create_contact(
    payload: ContactCreate,
    current_user=Depends(get_current_user_and_org),
    db: AsyncSession = Depends(get_db)
):
    contact = Contact(
        organization_id=current_user.organization_id,
        name=payload.name,
        phone_number=payload.phone_number,
        location=payload.location,
        metadata_json=payload.metadata_json or {}
    )
    db.add(contact)
    await db.commit()
    await db.refresh(contact)
    return contact

@router.get("/{contact_id}/history")
async def get_contact_campaign_history(
    contact_id: str,
    current_user=Depends(get_current_user_and_org),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(CampaignContact, Campaign).join(
        Campaign, Campaign.id == CampaignContact.campaign_id
    ).where(
        CampaignContact.contact_id == contact_id,
        CampaignContact.organization_id == current_user.organization_id
    ).order_by(desc(CampaignContact.created_at))

    result = await db.execute(stmt)
    rows = result.all()

    history = []
    for cc, campaign in rows:
        history.append({
            "campaign_id": campaign.id,
            "campaign_name": campaign.name,
            "status": cc.status,
            "skip_reason": cc.skip_reason,
            "created_at": cc.created_at
        })

    return history
