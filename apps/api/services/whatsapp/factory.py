from core.config import settings
from services.whatsapp.base import WhatsAppProvider
from services.whatsapp.meta_provider import MetaWhatsAppProvider
from services.whatsapp.mock_provider import MockWhatsAppProvider

def get_whatsapp_provider(
    mode: str = None,
    access_token: str = None,
    phone_number_id: str = None
) -> WhatsAppProvider:
    provider_mode = mode or settings.WHATSAPP_PROVIDER_MODE
    if provider_mode.lower() == "meta" and (access_token or settings.WHATSAPP_ACCESS_TOKEN):
        return MetaWhatsAppProvider(
            access_token=access_token or settings.WHATSAPP_ACCESS_TOKEN,
            phone_number_id=phone_number_id or settings.WHATSAPP_PHONE_NUMBER_ID
        )
    return MockWhatsAppProvider()
