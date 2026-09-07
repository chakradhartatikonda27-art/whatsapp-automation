import hashlib
import json
from typing import Dict, Any, Optional

def compute_message_fingerprint(
    organization_id: str,
    phone_number: str,
    message_content_or_template: str,
    variables: Optional[Dict[str, Any]] = None,
    media_identifier: Optional[str] = None
) -> str:
    """
    Computes a deterministic SHA-256 fingerprint representing an outbound message payload.
    
    Uniqueness Formula:
      SHA256(organization_id + canonical_phone + normalized_content + variables_json + media_id)
      
    Guarantees:
    - Same phone + same message = identical hash
    - Same phone + different message/variables = different hash (allowed in future campaigns)
    """
    norm_org = (organization_id or "").strip().lower()
    norm_phone = (phone_number or "").strip()
    norm_content = (message_content_or_template or "").strip()
    
    # Sort variable keys for deterministic JSON serialization
    norm_vars = json.dumps(variables or {}, sort_keys=True)
    norm_media = (media_identifier or "").strip()

    raw_payload = f"{norm_org}|{norm_phone}|{norm_content}|{norm_vars}|{norm_media}"
    return hashlib.sha256(raw_payload.encode('utf-8')).hexdigest()
