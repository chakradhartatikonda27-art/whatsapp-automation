import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from core.config import settings
from core.security import get_current_user_and_org

router = APIRouter(prefix="/api/v1/media", tags=["Media"])

@router.post("/upload")
async def upload_media(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user_and_org)
):
    valid_extensions = (".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf")
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in valid_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported media format '{ext}'. Allowed formats: {', '.join(valid_extensions)}"
        )

    file_id = str(uuid.uuid4())
    filename = f"media_{file_id}{ext}"
    save_path = os.path.join(settings.UPLOAD_DIR, filename)

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    with open(save_path, "wb") as f:
        content = await file.read()
        f.write(content)

    media_url = f"http://localhost:8000/uploads/{filename}"
    return {
        "media_id": file_id,
        "filename": file.filename,
        "media_url": media_url
    }
