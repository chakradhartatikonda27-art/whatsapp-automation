# System Architecture Documentation

## Overview

PropConnect WhatsApp SaaS is a multi-tenant, queue-driven bulk messaging platform specifically architected for real estate firms managing thousands of prospect leads in Excel/CSV format.

---

## Architectural Principles

```text
[ Next.js 14 Web App ]
          |
          | REST API (JWT + Tenant RLS)
          v
[ FastAPI Backend Engine ] <----+
          |                     | Async Queue Tasks
          +---> [ PostgreSQL ]   +---> [ Redis Task Broker ]
          |     (with RLS)                    |
          |                                   v
[ Webhooks Endpoint ] <------------ [ Celery Worker Pool ]
                                              |
                                              v
                                   [ Meta WhatsApp API ]
                                   (Cloud API / Mock)
```

1. **Deterministic Outbound Message Idempotency**:
   - Outbound unique fingerprint: `SHA256(organization_id + canonical_phone_number + normalized_template_content + variable_values_hash + media_fingerprint)`.
   - Enforced by PostgreSQL unique index `uq_org_phone_message_hash`.
   - Ensures that re-uploading the exact same dataset or re-running campaigns with identical content skips duplicates (`Skipped: Same message already processed previously`).

2. **Official Meta WhatsApp Cloud API Integration**:
   - Uses `WhatsAppProvider` abstraction interface.
   - Dual modes: `MetaWhatsAppProvider` (official Graph API v20.0) and `MockWhatsAppProvider` (simulated offline mode).

3. **Multi-Tenancy Isolation via PostgreSQL Row-Level Security (RLS)**:
   - Tenant isolation enforced on every multi-tenant table (`contacts`, `campaigns`, `campaign_contacts`, `message_attempts`, etc.).
   - `set_config('app.current_org_id', :org_id, false)` executed per transaction connection.

4. **Non-Blocking Queue Worker Architecture**:
   - FastAPI returns campaign creation responses instantly (`Campaign queued successfully`).
   - Celery workers pick up individual recipient send tasks with rate control, exponential backoff (5s, 15s, 45s), and retry limits.
