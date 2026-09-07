import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Integer, Boolean, DateTime, ForeignKey, Index, UniqueConstraint, JSON
)
from sqlalchemy.orm import relationship
from core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    contacts = relationship("Contact", back_populates="organization", cascade="all, delete-orphan")
    campaigns = relationship("Campaign", back_populates="organization", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="operator")  # owner, admin, operator, viewer
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    organization = relationship("Organization", back_populates="users")


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False, index=True)  # Normalized E.164 (e.g. +919876543210)
    location = Column(String, nullable=True)
    metadata_json = Column(JSON, default=dict)
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    organization = relationship("Organization", back_populates="contacts")

    __table_args__ = (
        UniqueConstraint("organization_id", "phone_number", name="uq_org_contact_phone"),
        Index("idx_contacts_org_phone", "organization_id", "phone_number"),
    )


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    message_type = Column(String, default="template")  # template, custom
    template_id = Column(String, nullable=True)
    message_body = Column(Text, nullable=True)
    media_url = Column(String, nullable=True)
    status = Column(String, default="DRAFT", index=True)  # DRAFT, QUEUED, PROCESSING, COMPLETED, PAUSED, CANCELLED

    total_contacts = Column(Integer, default=0)
    queued_count = Column(Integer, default=0)
    sent_count = Column(Integer, default=0)
    delivered_count = Column(Integer, default=0)
    read_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    skipped_count = Column(Integer, default=0)

    created_by = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    organization = relationship("Organization", back_populates="campaigns")
    campaign_contacts = relationship("CampaignContact", back_populates="campaign", cascade="all, delete-orphan")


class CampaignContact(Base):
    """
    Campaign Recipient entry.
    Enforces deterministic outbound idempotency per organization + phone + message content.
    """
    __tablename__ = "campaign_contacts"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    campaign_id = Column(String, ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True)
    contact_id = Column(String, ForeignKey("contacts.id", ondelete="SET NULL"), nullable=True, index=True)

    phone_number = Column(String, nullable=False, index=True)
    message_hash = Column(String(64), nullable=False, index=True)  # SHA-256 fingerprint
    status = Column(String, default="QUEUED", index=True)  # QUEUED, SKIPPED, PROCESSING, SENT, DELIVERED, READ, FAILED, CANCELLED
    skip_reason = Column(String, nullable=True)
    job_id = Column(String, nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    campaign = relationship("Campaign", back_populates="campaign_contacts")

    __table_args__ = (
        UniqueConstraint("organization_id", "phone_number", "message_hash", name="uq_org_phone_message_hash"),
        Index("idx_campaign_contacts_org_status", "organization_id", "campaign_id", "status"),
    )


class MessageAttempt(Base):
    __tablename__ = "message_attempts"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    campaign_id = Column(String, ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True)
    contact_id = Column(String, nullable=True)

    phone_number = Column(String, nullable=False, index=True)
    message_hash = Column(String(64), nullable=False)

    status = Column(String, default="QUEUED", index=True)
    whatsapp_message_id = Column(String, nullable=True, index=True)

    attempt_count = Column(Integer, default=0)
    last_error = Column(Text, nullable=True)

    queued_at = Column(DateTime(timezone=True), default=utc_now)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    failed_at = Column(DateTime(timezone=True), nullable=True)


class WhatsAppAccount(Base):
    __tablename__ = "whatsapp_accounts"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, unique=True)
    business_account_id = Column(String, nullable=False)
    phone_number_id = Column(String, nullable=False)
    display_phone_number = Column(String, nullable=False)
    encrypted_access_token = Column(Text, nullable=False)
    status = Column(String, default="connected")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class MessageTemplate(Base):
    __tablename__ = "message_templates"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    template_name = Column(String, nullable=False)  # WhatsApp Graph API template name
    language = Column(String, default="en_US")
    category = Column(String, default="MARKETING")
    status = Column(String, default="APPROVED")  # APPROVED, PENDING, REJECTED
    components = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, nullable=True, index=True)
    provider = Column(String, default="meta_whatsapp")
    event_type = Column(String, nullable=False)
    external_event_id = Column(String, unique=True, nullable=False, index=True)
    payload = Column(JSON, nullable=False)
    processed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String, nullable=True)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=True)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utc_now)
