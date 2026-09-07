from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class WhatsAppProviderResponse:
    def __init__(
        self,
        success: bool,
        whatsapp_message_id: Optional[str] = None,
        error_message: Optional[str] = None,
        is_transient_error: bool = False,
        raw_response: Optional[Dict[str, Any]] = None
    ):
        self.success = success
        self.whatsapp_message_id = whatsapp_message_id
        self.error_message = error_message
        self.is_transient_error = is_transient_error
        self.raw_response = raw_response or {}

class WhatsAppProvider(ABC):
    @abstractmethod
    async def send_template_message(
        self,
        recipient_phone: str,
        template_name: str,
        language_code: str = "en_US",
        components: Optional[List[Dict[str, Any]]] = None
    ) -> WhatsAppProviderResponse:
        """Sends an approved WhatsApp template message."""
        pass

    @abstractmethod
    async def send_media_template_message(
        self,
        recipient_phone: str,
        template_name: str,
        media_url: str,
        language_code: str = "en_US",
        components: Optional[List[Dict[str, Any]]] = None
    ) -> WhatsAppProviderResponse:
        """Sends a WhatsApp template message with an image/media header attachment."""
        pass

    @abstractmethod
    async def send_text_message(
        self,
        recipient_phone: str,
        message_body: str
    ) -> WhatsAppProviderResponse:
        """Sends a custom text message."""
        pass

    @abstractmethod
    async def send_image_message(
        self,
        recipient_phone: str,
        image_url: str,
        caption: Optional[str] = None
    ) -> WhatsAppProviderResponse:
        """Sends a custom image message with optional caption."""
        pass

    @abstractmethod
    async def validate_credentials(self) -> bool:
        """Validates API credentials connection with provider."""
        pass
