import pytest
import sys
import os

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "apps", "api"))

from services.idempotency import compute_message_fingerprint

def test_deterministic_message_hash():
    org_id = "org_apex_123"
    phone = "+919876543210"
    template = "real_estate_launch"
    vars_a = {"1": "Ravi Kumar", "2": "Hyderabad"}

    hash1 = compute_message_fingerprint(org_id, phone, template, vars_a)
    hash2 = compute_message_fingerprint(org_id, phone, template, vars_a)

    # Identical input must produce identical SHA-256 fingerprint
    assert hash1 == hash2
    assert len(hash1) == 64

def test_different_message_content_produces_different_hash():
    org_id = "org_apex_123"
    phone = "+919876543210"
    
    hash_campaign_1 = compute_message_fingerprint(org_id, phone, "real_estate_launch", {"1": "Ravi Kumar"})
    hash_campaign_2 = compute_message_fingerprint(org_id, phone, "property_inquiry_followup", {"1": "Ravi Kumar"})

    # Different template / content must yield different fingerprint
    assert hash_campaign_1 != hash_campaign_2

def test_multi_tenant_hash_isolation():
    phone = "+919876543210"
    template = "real_estate_launch"
    vars_data = {"1": "Ravi"}

    hash_org_a = compute_message_fingerprint("org_a", phone, template, vars_data)
    hash_org_b = compute_message_fingerprint("org_b", phone, template, vars_data)

    # Different organization MUST yield different hash even for same recipient + content
    assert hash_org_a != hash_org_b
