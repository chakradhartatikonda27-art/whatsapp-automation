import uuid
import logging
from typing import Dict, Any, List, Optional
from services.whatsapp.base import WhatsAppProvider, WhatsAppProviderResponse

logger = logging.getLogger(__name__)

class MockWhatsAppProvider(WhatsAppProvider):
    """
    Mock WhatsApp provider for local development, seed testing, and integration verification.
    Simulates successful Meta API responses and deterministic WAMIDs.
    """
    async def send_template_message(
        self,
        recipient_phone: str,
        template_name: str,
        language_code: str = "en_US",
        components: Optional[List[Dict[str, Any]]] = None
    ) -> WhatsAppProviderResponse:
        # Simulate optional failing test case for specific phone suffix e.g. "0000"
        if recipient_phone.endswith("0000"):
            return WhatsAppProviderResponse(
                success=False,
                error_message="Mock Error: Simulated invalid WhatsApp recipient phone number",
                is_transient_error=False,
                raw_response={"error": {"code": 131026, "message": "Recipient not on WhatsApp"}}
            )

        simulated_wamid = f"wamid.HBgM{uuid.uuid4().hex[:16]}"
        logger.info(f"[MOCK WHATSAPP PROVIDER] Sent template '{template_name}' to {recipient_phone} -> WAMID: {simulated_wamid}")

        return WhatsAppProviderResponse(
            success=True,
            whatsapp_message_id=simulated_wamid,
            raw_response={
                "messaging_product": "whatsapp",
                "contacts": [{"input": recipient_phone, "wa_id": recipient_phone.lstrip("+")}],
                "messages": [{"id": simulated_wamid}]
            }
        )

    async def send_media_template_message(
        self,
        recipient_phone: str,
        template_name: str,
        media_url: str,
        language_code: str = "en_US",
        components: Optional[List[Dict[str, Any]]] = None
    ) -> WhatsAppProviderResponse:
        if recipient_phone.endswith("0000"):
            return WhatsAppProviderResponse(
                success=False,
                error_message="Mock Error: Simulated invalid WhatsApp recipient phone number",
                is_transient_error=False,
                raw_response={"error": {"code": 131026, "message": "Recipient not on WhatsApp"}}
            )

        simulated_wamid = f"wamid.HBgM{uuid.uuid4().hex[:16]}"
        logger.info(f"[MOCK WHATSAPP PROVIDER] Sent media template '{template_name}' with image {media_url} to {recipient_phone} -> WAMID: {simulated_wamid}")

        return WhatsAppProviderResponse(
            success=True,
            whatsapp_message_id=simulated_wamid,
            raw_response={
                "messaging_product": "whatsapp",
                "contacts": [{"input": recipient_phone, "wa_id": recipient_phone.lstrip("+")}],
                "messages": [{"id": simulated_wamid}]
            }
        )

    async def send_text_message(
        self,
        recipient_phone: str,
        message_body: str
    ) -> WhatsAppProviderResponse:
        simulated_wamid = f"wamid.HBgM{uuid.uuid4().hex[:16]}"
        logger.info(f"[MOCK WHATSAPP PROVIDER] Sent text message to {recipient_phone} -> WAMID: {simulated_wamid}")
        return WhatsAppProviderResponse(
            success=True,
            whatsapp_message_id=simulated_wamid,
            raw_response={
                "messaging_product": "whatsapp",
                "contacts": [{"input": recipient_phone, "wa_id": recipient_phone.lstrip("+")}],
                "messages": [{"id": simulated_wamid}]
            }
        )

    async def send_image_message(
        self,
        recipient_phone: str,
        image_url: str,
        caption: Optional[str] = None
    ) -> WhatsAppProviderResponse:
        simulated_wamid = f"wamid.HBgM{uuid.uuid4().hex[:16]}"
        logger.info(f"[MOCK WHATSAPP PROVIDER] Sent image message ({image_url}) with caption to {recipient_phone} -> WAMID: {simulated_wamid}")
        return WhatsAppProviderResponse(
            success=True,
            whatsapp_message_id=simulated_wamid,
            raw_response={
                "messaging_product": "whatsapp",
                "contacts": [{"input": recipient_phone, "wa_id": recipient_phone.lstrip("+")}],
                "messages": [{"id": simulated_wamid}]
            }
        )

    async def validate_credentials(self) -> bool:
        return True

