# Security & Multi-Tenancy Architecture

## Tenant Isolation & RLS

Multi-tenancy is guaranteed at the database engine level via PostgreSQL Row Level Security (RLS).

Every multi-tenant query automatically scopes database rows to the tenant's `organization_id` set in the session variable `app.current_org_id`.

## Outbound Message Idempotency

Prevents accidental duplicate outbound sends to prospects:
- Fingerprint: `SHA256(organization_id + phone + template_name + variables_json + media_id)`
- Unique Index: `(organization_id, phone_number, message_hash)`

## Excel Formula Injection Protection

All imported text fields are sanitized in `excel_importer.py` by stripping dangerous formula prefix characters (`=`, `+`, `-`, `@`, `\t`, `\r`).
