# WhatsApp Cloud API & Webhook Configuration Guide

## Meta WhatsApp Business Platform Setup

1. **Meta Developer Console Registration**:
   - Create a Business App on [developers.facebook.com](https://developers.facebook.com/).
   - Add **WhatsApp** product.
   - Obtain `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, and Permanent System User Access Token.

2. **Configure Environment Variables**:
   Set in `.env`:
   ```ini
   WHATSAPP_PROVIDER_MODE="meta"
   WHATSAPP_ACCESS_TOKEN="EAAG..."
   WHATSAPP_PHONE_NUMBER_ID="200000000000000"
   WHATSAPP_BUSINESS_ACCOUNT_ID="100000000000000"
   WHATSAPP_WEBHOOK_VERIFY_TOKEN="real_estate_whatsapp_webhook_secret_token_123"
   ```

3. **Webhook Registration**:
   - In Meta Developer Dashboard -> WhatsApp -> Configuration -> Webhook URL:
     `https://your-domain.com/api/v1/webhooks/whatsapp`
   - Verify Token: Matches `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.
   - Subscribe to fields: `messages`.

4. **Local Development (Mock Mode)**:
   - When `WHATSAPP_PROVIDER_MODE=mock`, the application runs completely offline without sending real messages or incurring WhatsApp Meta API billing.
