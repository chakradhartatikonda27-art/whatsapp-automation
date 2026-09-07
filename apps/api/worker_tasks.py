import asyncio
import logging
from datetime import datetime, timezone
from worker_entry import celery_app
from core.database import SyncSessionLocal, set_sync_tenant_rls_context
from models.schema import Campaign, CampaignContact, MessageAttempt, Contact, MessageTemplate
from services.whatsapp.factory import get_whatsapp_provider

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, max_retries=3, default_retry_delay=10)
def process_recipient_send_task(self, campaign_contact_id: str, organization_id: str):
    """
    Celery background worker task for sending a single WhatsApp campaign message.
    Idempotent and transaction-safe.
    """
    session = SyncSessionLocal()
    try:
        # Enforce PostgreSQL Row-Level Security for this worker transaction
        set_sync_tenant_rls_context(session, organization_id)

        cc = session.query(CampaignContact).filter(CampaignContact.id == campaign_contact_id).first()
        if not cc or cc.status != "QUEUED":
            logger.info(f"Campaign contact {campaign_contact_id} skipped or already processed. Status: {cc.status if cc else 'None'}")
            return

        campaign = session.query(Campaign).filter(Campaign.id == cc.campaign_id).first()
        if not campaign or campaign.status in ("PAUSED", "CANCELLED"):
            logger.info(f"Campaign {cc.campaign_id} is PAUSED/CANCELLED. Skipping send for {cc.phone_number}.")
            return

        # Mark contact as PROCESSING
        cc.status = "PROCESSING"
        session.commit()

        # Resolve contact details & variables
        contact = session.query(Contact).filter(Contact.id == cc.contact_id).first() if cc.contact_id else None
        name_val = contact.name if contact else "Customer"
        loc_val = contact.location if contact and contact.location else "Hyderabad"

        provider = get_whatsapp_provider()

        # Execute async WhatsApp API request synchronously in worker
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        if campaign.message_type == "custom":
            body_text = campaign.message_body or ""
            body_text = body_text.replace("{{name}}", name_val).replace("{{Name}}", name_val).replace("{{1}}", name_val)
            body_text = body_text.replace("{{location}}", loc_val).replace("{{Location}}", loc_val).replace("{{2}}", loc_val)

            if campaign.media_url:
                response = loop.run_until_complete(
                    provider.send_image_message(
                        recipient_phone=cc.phone_number,
                        image_url=campaign.media_url,
                        caption=body_text
                    )
                )
            else:
                response = loop.run_until_complete(
                    provider.send_text_message(
                        recipient_phone=cc.phone_number,
                        message_body=body_text
                    )
                )
        else:
            template = session.query(MessageTemplate).filter(MessageTemplate.id == campaign.template_id).first() if campaign.template_id else None
            template_name = template.template_name if template else "hello_world"
            components = [
                {
                    "type": "body",
                    "parameters": [
                        {"type": "text", "text": name_val},
                        {"type": "text", "text": loc_val}
                    ]
                }
            ]

            if campaign.media_url:
                response = loop.run_until_complete(
                    provider.send_media_template_message(
                        recipient_phone=cc.phone_number,
                        template_name=template_name,
                        media_url=campaign.media_url,
                        components=components
                    )
                )
            else:
                response = loop.run_until_complete(
                    provider.send_template_message(
                        recipient_phone=cc.phone_number,
                        template_name=template_name,
                        components=components
                    )
                )
        loop.close()


        # Log attempt record
        attempt = MessageAttempt(
            organization_id=organization_id,
            campaign_id=campaign.id,
            contact_id=cc.contact_id,
            phone_number=cc.phone_number,
            message_hash=cc.message_hash,
            queued_at=datetime.now(timezone.utc)
        )
        session.add(attempt)

        if response.success:
            cc.status = "SENT"
            attempt.status = "SENT"
            attempt.whatsapp_message_id = response.whatsapp_message_id
            attempt.sent_at = datetime.now(timezone.utc)
            campaign.sent_count += 1
            logger.info(f"Successfully sent campaign message to {cc.phone_number}. WAMID: {response.whatsapp_message_id}")
        else:
            if response.is_transient_error and self.request.retries < self.max_retries:
                session.rollback()
                logger.warning(f"Transient error sending to {cc.phone_number}. Retrying ({self.request.retries + 1}/{self.max_retries})...")
                raise self.retry(exc=Exception(response.error_message))
            else:
                cc.status = "FAILED"
                cc.skip_reason = response.error_message
                attempt.status = "FAILED"
                attempt.failed_at = datetime.now(timezone.utc)
                attempt.last_error = response.error_message
                campaign.failed_count += 1
                logger.error(f"Permanent failure sending to {cc.phone_number}: {response.error_message}")

        session.commit()

        # Check if campaign complete
        remaining_queued = session.query(CampaignContact).filter(
            CampaignContact.campaign_id == campaign.id,
            CampaignContact.status == "QUEUED"
        ).count()

        if remaining_queued == 0 and campaign.status == "PROCESSING":
            campaign.status = "COMPLETED"
            campaign.completed_at = datetime.now(timezone.utc)
            session.commit()

    except Exception as exc:
        session.rollback()
        logger.exception(f"Unhandled error in worker task for {campaign_contact_id}: {str(exc)}")
        raise exc
    finally:
        session.close()
