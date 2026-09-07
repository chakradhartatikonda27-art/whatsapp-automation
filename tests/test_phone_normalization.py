import pytest
import sys
import os

# Add apps/api to path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "apps", "api"))

from services.excel_importer import normalize_phone_number

def test_india_phone_formats():
    # Standard 10 digits
    p1, v1 = normalize_phone_number("9876543210")
    assert v1 is True
    assert p1 == "+919876543210"

    # With 91 prefix
    p2, v2 = normalize_phone_number("919876543210")
    assert v2 is True
    assert p2 == "+919876543210"

    # With +91 prefix and formatting spaces
    p3, v3 = normalize_phone_number("+91 98765 43210")
    assert v3 is True
    assert p3 == "+919876543210"

def test_invalid_phone_formats():
    p, v = normalize_phone_number("INVALID_STRING")
    assert v is False
    assert p is None

    p_short, v_short = normalize_phone_number("12345")
    assert v_short is False
    assert p_short is None
