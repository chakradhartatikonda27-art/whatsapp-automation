import logging
import httpx
from typing import Dict, Any, List, Optional
from core.config import settings
from services.whatsapp.base import WhatsAppProvider, WhatsAppProviderResponse

logger = logging.getLogger(__name__)

class MetaWhatsAppProvider(WhatsAppProvider):
    def __init__(
        self,
        access_token: Optional[str] = None,
        phone_number_id: Optional[str] = None,
        api_version: Optional[str] = None
    ):
        self.access_token = access_token or settings.WHATSAPP_ACCESS_TOKEN
        self.phone_number_id = phone_number_id or settings.WHATSAPP_PHONE_NUMBER_ID
        self.api_version = api_version or settings.WHATSAPP_API_VERSION
        self.base_url = f"https://graph.facebook.com/{self.api_version}/{self.phone_number_id}"

    async def send_template_message(
        self,
        recipient_phone: str,
        template_name: str,
        language_code: str = "en_US",
        components: Optional[List[Dict[str, Any]]] = None
    ) -> WhatsAppProviderResponse:
        return await self._dispatch_message({
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": recipient_phone.lstrip("+"),
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": language_code},
                "components": components or []
            }
        })

    async def send_media_template_message(
        self,
        recipient_phone: str,
        template_name: str,
        media_url: str,
        language_code: str = "en_US",
        components: Optional[List[Dict[str, Any]]] = None
    ) -> WhatsAppProviderResponse:
        final_components = list(components or [])
        # Prepend media header component if not already provided
        has_header = any(c.get("type", "").upper() == "HEADER" for c in final_components)
        if not has_header:
            final_components.insert(0, {
                "type": "header",
                "parameters": [
                    {
                        "type": "image",
                        "image": {"link": media_url}
                    }
                ]
            })

        return await self._dispatch_message({
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": recipient_phone.lstrip("+"),
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": language_code},
                "components": final_components
            }
        })

    async def send_text_message(
        self,
        recipient_phone: str,
        message_body: str
    ) -> WhatsAppProviderResponse:
        return await self._dispatch_message({
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": recipient_phone.lstrip("+"),
            "type": "text",
            "text": {"body": message_body}
        })

    async def send_image_message(
        self,
        recipient_phone: str,
        image_url: str,
        caption: Optional[str] = None
    ) -> WhatsAppProviderResponse:
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": recipient_phone.lstrip("+"),
            "type": "image",
            "image": {
                "link": image_url
            }
        }
        if caption:
            payload["image"]["caption"] = caption

        return await self._dispatch_message(payload)

    async def _dispatch_message(self, payload: Dict[str, Any]) -> WhatsAppProviderResponse:
        url = f"{self.base_url}/messages"
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                data = res.json()

                if res.status_code in (200, 201) and "messages" in data:
                    return WhatsAppProviderResponse(
                        success=True,
                        whatsapp_message_id=data["messages"][0]["id"],
                        raw_response=data
                    )

                error_obj = data.get("error", {})
                error_code = error_obj.get("code")
                error_message = error_obj.get("message", res.text)
                is_transient = res.status_code in (429, 500, 502, 503, 504) or error_code in (130429, 2)

                logger.error(f"Meta WhatsApp API Error [{res.status_code}]: {error_message}")
                return WhatsAppProviderResponse(
                    success=False,
                    error_message=f"Meta API Error ({error_code}): {error_message}",
                    is_transient_error=is_transient,
                    raw_response=data
                )

        except httpx.RequestError as exc:
            return WhatsAppProviderResponse(
                success=False,
                error_message=f"Network error: {str(exc)}",
                is_transient_error=True
            )

    async def validate_credentials(self) -> bool:
        url = f"https://graph.facebook.com/{self.api_version}/{self.phone_number_id}"
        headers = {"Authorization": f"Bearer {self.access_token}"}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url, headers=headers)
                return res.status_code == 200
        except Exception:
            return False
