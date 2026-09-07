from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, EmailStr, Field

# Auth DTOs
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    organization_id: str
    user_name: str
    role: str

class OrganizationDTO(BaseModel):
    id: str
    name: str
    slug: str
    status: str

# Contact DTOs
class ContactCreate(BaseModel):
    name: str
    phone_number: str
    location: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None

class ContactResponse(BaseModel):
    id: str
    organization_id: str
    name: str
    phone_number: str
    location: Optional[str]
    metadata_json: Optional[Dict[str, Any]]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Import & Validation DTOs
class ImportPreviewResponse(BaseModel):
    import_id: str
    file_name: str
    total_rows: int
    valid_contacts: int
    invalid_numbers: int
    duplicate_rows: int
    previously_processed: int
    ready_for_campaign: int
    sample_valid: List[Dict[str, Any]]
    sample_invalid: List[Dict[str, Any]]
    detected_columns: Dict[str, str]

# Template DTOs
class TemplateResponse(BaseModel):
    id: str
    name: str
    template_name: str
    language: str
    category: str
    status: str
    components: List[Dict[str, Any]]

    class Config:
        from_attributes = True

# Campaign DTOs
class CampaignCreate(BaseModel):
    name: str
    template_id: Optional[str] = None
    message_type: str = "template"
    message_body: Optional[str] = None
    media_url: Optional[str] = None
    import_id: Optional[str] = None
    contacts: Optional[List[Dict[str, Any]]] = None


class CampaignResponse(BaseModel):
    id: str
    organization_id: str
    name: str
    message_type: str
    template_id: Optional[str]
    status: str
    total_contacts: int
    queued_count: int
    sent_count: int
    delivered_count: int
    read_count: int
    failed_count: int
    skipped_count: int
    created_by: str
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

class CampaignRecipientResponse(BaseModel):
    id: str
    campaign_id: str
    phone_number: str
    name: Optional[str] = None
    location: Optional[str] = None
    message_hash: str
    status: str
    skip_reason: Optional[str]
    whatsapp_message_id: Optional[str]
    sent_at: Optional[datetime]
    delivered_at: Optional[datetime]
    read_at: Optional[datetime]

class WhatsAppAccountResponse(BaseModel):
    id: str
    organization_id: str
    business_account_id: str
    phone_number_id: str
    display_phone_number: str
    status: str
