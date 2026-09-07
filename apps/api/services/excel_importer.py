import re
import pandas as pd
import phonenumbers
from typing import List, Dict, Any, Tuple, Optional

def normalize_phone_number(raw_phone: Any, default_region: str = "IN") -> Tuple[Optional[str], bool]:
    """
    Normalizes a raw phone input into canonical E.164 format (+919876543210).
    Uses Google's phonenumbers library.
    """
    if raw_phone is None or pd.isna(raw_phone):
        return None, False

    # Convert numeric/float values from Excel to clean string
    phone_str = str(raw_phone).strip()
    if phone_str.endswith(".0"):
        phone_str = phone_str[:-2]
    
    # Strip whitespace, dashes, parens
    clean_str = re.sub(r"[^\d+]", "", phone_str)
    if not clean_str:
        return None, False

    try:
        parsed = phonenumbers.parse(clean_str, default_region)
        if phonenumbers.is_valid_number(parsed):
            formatted = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
            return formatted, True
    except Exception:
        pass

    # Fallback heuristic for 10-digit Indian numbers without country code
    digits_only = re.sub(r"\D", "", phone_str)
    if len(digits_only) == 10:
        return f"+91{digits_only}", True
    elif len(digits_only) == 12 and digits_only.startswith("91"):
        return f"+{digits_only}", True

    return None, False

def sanitize_field(value: Any) -> str:
    """Sanitizes text strings against spreadsheet formula injection attacks."""
    if value is None or pd.isna(value):
        return ""
    text = str(value).strip()
    # Strip dangerous formula prefixes
    if text.startswith(("=", "+", "-", "@", "\t", "\r")):
        text = text.lstrip("=+-@\t\r")
    return text

def parse_and_validate_dataset(
    file_path: str,
    column_mapping: Optional[Dict[str, str]] = None,
    default_region: str = "IN"
) -> Dict[str, Any]:
    """
    Parses an uploaded Excel/CSV file and performs strict validation.
    
    Returns structured stats and contact lists:
    {
       "total_rows": int,
       "valid_count": int,
       "invalid_count": int,
       "duplicate_in_file_count": int,
       "valid_contacts": [...],
       "invalid_contacts": [...],
       "duplicate_contacts": [...]
    }
    """
    if file_path.endswith(".csv"):
        df = pd.read_csv(file_path, dtype=str)
    elif file_path.endswith((".xlsx", ".xls")):
        df = pd.read_excel(file_path, dtype=str)
    else:
        raise ValueError("Unsupported file format. Please upload .xlsx, .xls, or .csv")

    df = df.fillna("")

    # Auto-detect columns if mapping not explicitly passed
    detected_name_col = None
    detected_phone_col = None
    detected_loc_col = None

    for col in df.columns:
        col_lower = str(col).lower().strip()
        if not detected_name_col and any(k in col_lower for k in ["name", "full name", "customer", "prospect"]):
            detected_name_col = col
        if not detected_phone_col and any(k in col_lower for k in ["mobile", "phone", "whatsapp", "contact", "number", "tel"]):
            detected_phone_col = col
        if not detected_loc_col and any(k in col_lower for k in ["location", "city", "area", "address"]):
            detected_loc_col = col

    name_col = (column_mapping or {}).get("name") or detected_name_col or df.columns[0]
    phone_col = (column_mapping or {}).get("phone") or detected_phone_col or (df.columns[1] if len(df.columns) > 1 else df.columns[0])
    loc_col = (column_mapping or {}).get("location") or detected_loc_col or (df.columns[2] if len(df.columns) > 2 else None)

    valid_contacts = []
    invalid_contacts = []
    duplicate_contacts = []

    seen_phones = set()

    for idx, row in df.iterrows():
        row_num = idx + 2  # Excel 1-indexed row number offset (header is row 1)
        raw_name = row.get(name_col, "")
        raw_phone = row.get(phone_col, "")
        raw_loc = row.get(loc_col, "") if loc_col else ""

        name = sanitize_field(raw_name) or f"Contact {row_num}"
        location = sanitize_field(raw_loc)

        canonical_phone, is_valid = normalize_phone_number(raw_phone, default_region=default_region)

        if not is_valid or not canonical_phone:
            invalid_contacts.append({
                "row_number": row_num,
                "name": name,
                "raw_phone": str(raw_phone),
                "location": location,
                "reason": "Malformed or missing phone number"
            })
            continue

        if canonical_phone in seen_phones:
            duplicate_contacts.append({
                "row_number": row_num,
                "name": name,
                "phone_number": canonical_phone,
                "location": location,
                "reason": "Duplicate phone number in uploaded file"
            })
            continue

        seen_phones.add(canonical_phone)
        valid_contacts.append({
            "name": name,
            "phone_number": canonical_phone,
            "location": location,
            "row_number": row_num
        })

    return {
        "total_rows": len(df),
        "valid_count": len(valid_contacts),
        "invalid_count": len(invalid_contacts),
        "duplicate_in_file_count": len(duplicate_contacts),
        "valid_contacts": valid_contacts,
        "invalid_contacts": invalid_contacts,
        "duplicate_contacts": duplicate_contacts,
        "detected_columns": {
            "name": name_col,
            "phone": phone_col,
            "location": loc_col
        }
    }
