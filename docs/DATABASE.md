# Database & Schema Reference Documentation

## Overview

The database is built on PostgreSQL 16 using SQLAlchemy 2.0 and Alembic migrations.

## Key Tables & Composite Indexes

### 1. `organizations`
Primary tenant organization metadata.

### 2. `users`
Tenant users with role-based access (`owner`, `admin`, `operator`, `viewer`).

### 3. `contacts`
Normalized directory contacts with Google `phonenumbers` E.164 canonical phone formatting (`+919876543210`).
- Unique constraint: `(organization_id, phone_number)`.

### 4. `campaigns`
Campaign records tracking counts: `total_contacts`, `queued_count`, `sent_count`, `delivered_count`, `read_count`, `failed_count`, `skipped_count`.

### 5. `campaign_contacts`
Campaign recipient entry representing outbound message intent.
- Composite Unique Constraint: `uq_org_phone_message_hash` (`organization_id`, `phone_number`, `message_hash`).
- Protects against duplicate sends across repeat file uploads.

### 6. `message_attempts`
Auditable log of every Meta WhatsApp Graph API request and delivery webhook event.

---

## Row-Level Security (RLS) Policy

Every tenant-bound table uses PostgreSQL Row Level Security:

```sql
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY contacts_tenant_isolation ON contacts
FOR ALL USING (organization_id = NULLIF(current_setting('app.current_org_id', true), ''));
```
