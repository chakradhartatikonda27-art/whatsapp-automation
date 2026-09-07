from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func, desc

from core.database import get_db
from core.security import get_current_user_and_org
from models.schema import Campaign, CampaignContact, Contact, MessageTemplate, MessageAttempt
from schemas.dto import CampaignCreate, CampaignResponse, CampaignRecipientResponse
from services.idempotency import compute_message_fingerprint
from routers.imports import IMPORT_CACHE
from worker_tasks import process_recipient_send_task

router = APIRouter(prefix="/api/v1/campaigns", tags=["Campaigns"])

@router.post("", response_model=CampaignResponse)
async def create_and_launch_campaign(
    payload: CampaignCreate,
    current_user=Depends(get_current_user_and_org),
    db: AsyncSession = Depends(get_db)
):
    # 1. Resolve template
    template_name = "hello_world"
    if payload.template_id:
        tmpl_stmt = select(MessageTemplate).where(
            MessageTemplate.id == payload.template_id,
            MessageTemplate.organization_id == current_user.organization_id
        )
        tmpl_res = await db.execute(tmpl_stmt)
        template = tmpl_res.scalar_one_or_none()
        if template:
            template_name = template.template_name

    # 2. Resolve contacts from import cache or passed payload
    raw_contacts = []
    if payload.import_id:
        import_data = IMPORT_CACHE.get(payload.import_id)
        if not import_data or import_data["organization_id"] != current_user.organization_id:
            raise HTTPException(status_code=404, detail="Import session not found or expired.")
        raw_contacts = import_data["valid_contacts"]
    elif payload.contacts:
        raw_contacts = payload.contacts
    else:
        raise HTTPException(status_code=400, detail="Must provide either import_id or contacts list.")

    # 3. Create Campaign entity
    msg_type = payload.message_type or "template"
    campaign = Campaign(
        organization_id=current_user.organization_id,
        name=payload.name,
        message_type=msg_type,
        template_id=payload.template_id,
        message_body=payload.message_body,
        media_url=payload.media_url,
        status="PROCESSING",
        created_by=current_user.user_id,
        started_at=datetime.now(timezone.utc)
    )
    db.add(campaign)
    await db.flush()

    queued_contacts = []
    skipped_count = 0
    queued_count = 0

    for item in raw_contacts:
        phone = item["phone_number"]
        name = item.get("name") or "Customer"
        loc = item.get("location") or "Hyderabad"

        # Upsert into directory contacts
        contact_stmt = select(Contact).where(
            Contact.organization_id == current_user.organization_id,
            Contact.phone_number == phone
        )
        contact_res = await db.execute(contact_stmt)
        contact_entity = contact_res.scalar_one_or_none()

        if not contact_entity:
            contact_entity = Contact(
                organization_id=current_user.organization_id,
                name=name,
                phone_number=phone,
                location=loc
            )
            db.add(contact_entity)
            await db.flush()

        # Compute deterministic message hash
        content_for_hash = payload.message_body if msg_type == "custom" else template_name
        msg_hash = compute_message_fingerprint(
            organization_id=current_user.organization_id,
            phone_number=phone,
            message_content_or_template=content_for_hash,
            variables={"1": name, "2": loc},
            media_identifier=payload.media_url
        )


        # Check idempotency duplicate rule in DB
        dup_stmt = select(CampaignContact).where(
            CampaignContact.organization_id == current_user.organization_id,
            CampaignContact.phone_number == phone,
            CampaignContact.message_hash == msg_hash
        )
        dup_res = await db.execute(dup_stmt)
        existing_dup = dup_res.scalar_one_or_none()

        if existing_dup and existing_dup.status in ("SENT", "DELIVERED", "READ", "QUEUED", "PROCESSING"):
            # Record skipped recipient in this campaign's reports
            cc = CampaignContact(
                organization_id=current_user.organization_id,
                campaign_id=campaign.id,
                contact_id=contact_entity.id,
                phone_number=phone,
                message_hash=f"{msg_hash}_skip_{campaign.id[:8]}_{item.get('row_number', len(queued_contacts))}",
                status="SKIPPED",
                skip_reason="Same message already processed previously"
            )
            db.add(cc)
            skipped_count += 1
        else:
            cc = CampaignContact(
                organization_id=current_user.organization_id,
                campaign_id=campaign.id,
                contact_id=contact_entity.id,
                phone_number=phone,
                message_hash=msg_hash,
                status="QUEUED"
            )
            db.add(cc)
            queued_contacts.append(cc)
            queued_count += 1

    campaign.total_contacts = len(raw_contacts)
    campaign.queued_count = queued_count
    campaign.skipped_count = skipped_count

    await db.commit()
    await db.refresh(campaign)

    # Detach job execution from HTTP request lifecycle so HTTP request returns instantly (<50ms)
    cc_ids = [cc.id for cc in queued_contacts]
    org_id = current_user.organization_id

    def dispatch_jobs_async(job_ids, tenant_id):
        for job_id in job_ids:
            try:
                process_recipient_send_task.delay(job_id, tenant_id)
            except Exception:
                process_recipient_send_task(job_id, tenant_id)

    import threading
    threading.Thread(target=dispatch_jobs_async, args=(cc_ids, org_id), daemon=True).start()

    return campaign

@router.get("", response_model=List[CampaignResponse])
async def list_campaigns(
    current_user=Depends(get_current_user_and_org),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Campaign).where(
        Campaign.organization_id == current_user.organization_id
    ).order_by(desc(Campaign.created_at))
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: str,
    current_user=Depends(get_current_user_and_org),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Campaign).where(
        Campaign.id == campaign_id,
        Campaign.organization_id == current_user.organization_id
    )
    result = await db.execute(stmt)
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@router.get("/{campaign_id}/recipients", response_model=List[CampaignRecipientResponse])
async def get_campaign_recipients(
    campaign_id: str,
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    current_user=Depends(get_current_user_and_org),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(CampaignContact, Contact, MessageAttempt).outerjoin(
        Contact, Contact.id == CampaignContact.contact_id
    ).outerjoin(
        MessageAttempt, (MessageAttempt.campaign_id == CampaignContact.campaign_id) & (MessageAttempt.phone_number == CampaignContact.phone_number)
    ).where(
        CampaignContact.campaign_id == campaign_id,
        CampaignContact.organization_id == current_user.organization_id
    )

    if status_filter and status_filter.upper() != "ALL":
        stmt = stmt.where(CampaignContact.status == status_filter.upper())

    if search:
        search_pattern = f"%{search}%"
        stmt = stmt.where(
            (CampaignContact.phone_number.ilike(search_pattern)) |
            (Contact.name.ilike(search_pattern)) |
            (Contact.location.ilike(search_pattern))
        )

    result = await db.execute(stmt)
    rows = result.all()

    recipients = []
    for cc, contact, attempt in rows:
        recipients.append(CampaignRecipientResponse(
            id=cc.id,
            campaign_id=cc.campaign_id,
            phone_number=cc.phone_number,
            name=contact.name if contact else "Customer",
            location=contact.location if contact else None,
            message_hash=cc.message_hash,
            status=cc.status,
            skip_reason=cc.skip_reason,
            whatsapp_message_id=attempt.whatsapp_message_id if attempt else None,
            sent_at=attempt.sent_at if attempt else None,
            delivered_at=attempt.delivered_at if attempt else None,
            read_at=attempt.read_at if attempt else None
        ))

    return recipients

@router.post("/{campaign_id}/pause")
async def pause_campaign(
    campaign_id: str,
    current_user=Depends(get_current_user_and_org),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Campaign).where(
        Campaign.id == campaign_id,
        Campaign.organization_id == current_user.organization_id
    )
    res = await db.execute(stmt)
    campaign = res.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    campaign.status = "PAUSED"
    await db.commit()
    return {"status": "PAUSED", "message": "Campaign paused successfully."}

@router.post("/{campaign_id}/resume")
async def resume_campaign(
    campaign_id: str,
    current_user=Depends(get_current_user_and_org),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Campaign).where(
        Campaign.id == campaign_id,
        Campaign.organization_id == current_user.organization_id
    )
    res = await db.execute(stmt)
    campaign = res.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    campaign.status = "PROCESSING"
    await db.commit()

    # Re-trigger queued contacts
    cc_stmt = select(CampaignContact).where(
        CampaignContact.campaign_id == campaign_id,
        CampaignContact.status == "QUEUED"
    )
    cc_res = await db.execute(cc_stmt)
    queued_list = cc_res.scalars().all()

    for cc in queued_list:
        process_recipient_send_task.delay(cc.id, current_user.organization_id)

    return {"status": "PROCESSING", "message": f"Resumed campaign with {len(queued_list)} queued contacts."}

@router.post("/{campaign_id}/cancel")
async def cancel_campaign(
    campaign_id: str,
    current_user=Depends(get_current_user_and_org),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Campaign).where(
        Campaign.id == campaign_id,
        Campaign.organization_id == current_user.organization_id
    )
    res = await db.execute(stmt)
    campaign = res.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    campaign.status = "CANCELLED"
    await db.execute(
        update(CampaignContact)
        .where(CampaignContact.campaign_id == campaign_id, CampaignContact.status == "QUEUED")
        .values(status="CANCELLED", skip_reason="Campaign cancelled by user")
    )
    await db.commit()
    return {"status": "CANCELLED", "message": "Campaign cancelled successfully."}
