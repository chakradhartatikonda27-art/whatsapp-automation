from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from core.security import verify_password, create_access_token, get_current_user_and_org
from models.schema import User, Organization
from schemas.dto import LoginRequest, TokenResponse

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == payload.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    token = create_access_token(
        data={"sub": user.id, "org_id": user.organization_id, "role": user.role}
    )

    return TokenResponse(
        access_token=token,
        user_id=user.id,
        organization_id=user.organization_id,
        user_name=user.name,
        role=user.role
    )

@router.get("/me")
async def get_me(current_user=Depends(get_current_user_and_org), db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.id == current_user.user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    
    org_stmt = select(Organization).where(Organization.id == current_user.organization_id)
    org_res = await db.execute(org_stmt)
    org = org_res.scalar_one_or_none()

    return {
        "user_id": user.id if user else current_user.user_id,
        "name": user.name if user else "User",
        "email": user.email if user else "",
        "role": current_user.role,
        "organization": {
            "id": org.id if org else current_user.organization_id,
            "name": org.name if org else "Default Org",
            "slug": org.slug if org else "default"
        }
    }
