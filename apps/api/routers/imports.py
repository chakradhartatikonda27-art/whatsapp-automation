import os
import uuid
import json
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.config import settings
from core.database import get_db
from core.security import get_current_user_and_org
from services.excel_importer import parse_and_validate_dataset
from services.idempotency import compute_message_fingerprint
from models.schema import CampaignContact, MessageTemplate
from schemas.dto import ImportPreviewResponse

router = APIRouter(prefix="/api/v1/imports", tags=["Imports"])

# Temporary in-memory cache for import previews
IMPORT_CACHE = {}

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    template_id: str = None,
    current_user=Depends(get_current_user_and_org),
    db: AsyncSession = Depends(get_db)
):
    if not file.filename.endswith((".xlsx", ".xls", ".csv")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file."
        )

    import_id = str(uuid.uuid4())
    save_path = os.path.join(settings.UPLOAD_DIR, f"{import_id}_{file.filename}")

    with open(save_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Parse and validate file rows
    parsed = parse_and_validate_dataset(save_path)
    valid_contacts = parsed["valid_contacts"]

    # Compute idempotency check if template_id is passed or check general baseline content
    template_name = "hello_world"
    if template_id:
        tmpl_stmt = select(MessageTemplate).where(
            MessageTemplate.id == template_id,
            MessageTemplate.organization_id == current_user.organization_id
        )
        tmpl_res = await db.execute(tmpl_stmt)
        tmpl = tmpl_res.scalar_one_or_none()
        if tmpl:
            template_name = tmpl.template_name

    previously_processed = 0
    ready_for_campaign = 0

    for c in valid_contacts:
        msg_hash = compute_message_fingerprint(
            organization_id=current_user.organization_id,
            phone_number=c["phone_number"],
            message_content_or_template=template_name,
            variables={"1": c["name"], "2": c["location"]}
        )
        c["message_hash"] = msg_hash

        # Check existing CampaignContact database entries
        stmt = select(CampaignContact).where(
            CampaignContact.organization_id == current_user.organization_id,
            CampaignContact.phone_number == c["phone_number"],
            CampaignContact.message_hash == msg_hash
        )
        res = await db.execute(stmt)
        existing = res.scalar_one_or_none()

        if existing and existing.status in ("SENT", "DELIVERED", "READ", "QUEUED", "PROCESSING"):
            c["is_duplicate_send"] = True
            c["skip_reason"] = "Same message already processed previously"
            previously_processed += 1
        else:
            c["is_duplicate_send"] = False
            c["skip_reason"] = None
            ready_for_campaign += 1

    IMPORT_CACHE[import_id] = {
        "import_id": import_id,
        "file_name": file.filename,
        "file_path": save_path,
        "organization_id": current_user.organization_id,
        "parsed_data": parsed,
        "valid_contacts": valid_contacts,
        "previously_processed": previously_processed,
        "ready_for_campaign": ready_for_campaign
    }

    return {
        "import_id": import_id,
        "file_name": file.filename,
        "total_rows": parsed["total_rows"],
        "valid_contacts": parsed["valid_count"],
        "invalid_numbers": parsed["invalid_count"],
        "duplicate_rows": parsed["duplicate_in_file_count"],
        "previously_processed": previously_processed,
        "ready_for_campaign": ready_for_campaign,
        "detected_columns": parsed["detected_columns"],
        "sample_valid": valid_contacts[:5],
        "sample_invalid": parsed["invalid_contacts"][:5]
    }

@router.get("/{import_id}/preview", response_model=ImportPreviewResponse)
async def get_import_preview(import_id: str, current_user=Depends(get_current_user_and_org)):
    data = IMPORT_CACHE.get(import_id)
    if not data or data["organization_id"] != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Import session expired or not found.")

    parsed = data["parsed_data"]
    return ImportPreviewResponse(
        import_id=import_id,
        file_name=data["file_name"],
        total_rows=parsed["total_rows"],
        valid_contacts=parsed["valid_count"],
        invalid_numbers=parsed["invalid_count"],
        duplicate_rows=parsed["duplicate_in_file_count"],
        previously_processed=data["previously_processed"],
        ready_for_campaign=data["ready_for_campaign"],
        sample_valid=data["valid_contacts"][:10],
        sample_invalid=parsed["invalid_contacts"][:10],
        detected_columns=parsed["detected_columns"]
    )
