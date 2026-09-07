# REST API Specification & Endpoint Guide

## Base URL
`/api/v1`

## Authentication
JWT Bearer token required in HTTP Header:
`Authorization: Bearer <access_token>`

---

## Core Endpoints

### Auth
- `POST /api/v1/auth/login`: Authenticate and obtain JWT token.
- `GET /api/v1/auth/me`: Fetch authenticated user profile & tenant organization.

### Imports
- `POST /api/v1/imports/upload`: Upload Excel (`.xlsx`, `.xls`) or CSV file for validation and duplicate checking.
- `GET /api/v1/imports/{id}/preview`: Get detailed validation summary counters and sample rows.

### Campaigns
- `POST /api/v1/campaigns`: Create campaign and dispatch queued background worker tasks.
- `GET /api/v1/campaigns`: List all tenant campaigns.
- `GET /api/v1/campaigns/{id}`: Detailed campaign statistics.
- `GET /api/v1/campaigns/{id}/recipients`: Paginated list of campaign recipients with filter & search.
- `POST /api/v1/campaigns/{id}/pause`: Pause campaign send loop.
- `POST /api/v1/campaigns/{id}/resume`: Resume campaign execution.
- `POST /api/v1/campaigns/{id}/cancel`: Cancel remaining queued jobs.

### Contacts & History
- `GET /api/v1/contacts`: Directory contact list with search.
- `GET /api/v1/contacts/{id}/history`: Campaign sending history for a single contact.

### Webhooks
- `GET /api/v1/webhooks/whatsapp`: Challenge verification for Meta Developer Console.
- `POST /api/v1/webhooks/whatsapp`: Delivery status callback payload processor (`SENT`, `DELIVERED`, `READ`, `FAILED`).
