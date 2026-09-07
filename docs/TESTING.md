# Testing & Verification Guide

## Automated Unit Tests (`pytest`)

Run unit test suite covering phone number normalization, message hashing, and multi-tenant isolation:

```bash
PYTHONPATH=apps/api pytest tests/
```

### Test Coverage Breakdown:

1. **`test_phone_normalization.py`**:
   - `test_india_phone_formats`: Verifies `9876543210`, `919876543210`, `+91 98765 43210` all normalize to canonical `+919876543210`.
   - `test_invalid_phone_formats`: Rejects malformed phone numbers.

2. **`test_idempotency.py`**:
   - `test_deterministic_message_hash`: Verifies hash matches deterministically across identical payloads.
   - `test_different_message_content_produces_different_hash`: Verifies different template content yields distinct hashes.
   - `test_multi_tenant_hash_isolation`: Verifies org isolation in hash fingerprints.
