import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from models.schema import MessageAttempt, CampaignContact, Campaign, WebhookEvent

logger = logging.getLogger(__name__)

STATUS_WEIGHTS = {
    "QUEUED": 10,
    "PROCESSING": 20,
    "SENT": 30,
    "DELIVERED": 40,
    "READ": 50,
    "FAILED": 60,
    "SKIPPED": 70,
}

async def process_whatsapp_webhook_event(
    db: AsyncSession,
    raw_payload: Dict[str, Any],
    external_event_id: str
) -> bool:
    """
    Idempotently processes Meta WhatsApp Cloud API webhooks.
    Updates MessageAttempt and CampaignContact statuses with non-downgrading state rules.
    """
    # 1. Deduplicate webhook event
    stmt = select(WebhookEvent).where(WebhookEvent.external_event_id == external_event_id)
    result = await db.execute(stmt)
    existing_event = result.scalar_one_or_none()

    if existing_event and existing_event.processed:
        logger.info(f"Webhook event {external_event_id} already processed. Skipping.")
        return True

    if not existing_event:
        event = WebhookEvent(
            external_event_id=external_event_id,
            event_type="status_update",
            payload=raw_payload,
            processed=False
        )
        db.add(event)
        await db.flush()
    else:
        event = existing_event

    entries = raw_payload.get("entry", [])
    for entry in entries:
        changes = entry.get("changes", [])
        for change in changes:
            value = change.get("value", {})
            statuses = value.get("statuses", [])
            for status_obj in statuses:
                wamid = status_obj.get("id")
                status_str = status_obj.get("status", "").upper()  # sent, delivered, read, failed
                timestamp_sec = int(status_obj.get("timestamp", datetime.now().timestamp()))
                event_time = datetime.fromtimestamp(timestamp_sec, tz=timezone.utc)

                errors = status_obj.get("errors", [])
                error_msg = errors[0].get("title") if errors else None

                if not wamid:
                    continue

                # Locate message attempt by WhatsApp Message ID
                attempt_stmt = select(MessageAttempt).where(MessageAttempt.whatsapp_message_id == wamid)
                attempt_res = await db.execute(attempt_stmt)
                attempt = attempt_res.scalar_one_or_none()

                if not attempt:
                    logger.warning(f"No message attempt found for WAMID: {wamid}")
                    continue

                # Check state precedence
                current_weight = STATUS_WEIGHTS.get(attempt.status, 0)
                new_weight = STATUS_WEIGHTS.get(status_str, 0)

                # Always update timestamps if present
                if status_str == "SENT" and not attempt.sent_at:
                    attempt.sent_at = event_time
                elif status_str == "DELIVERED" and not attempt.delivered_at:
                    attempt.delivered_at = event_time
                elif status_str == "READ" and not attempt.read_at:
                    attempt.read_at = event_time
                elif status_str == "FAILED" and not attempt.failed_at:
                    attempt.failed_at = event_time
                    attempt.last_error = error_msg or "Failed via WhatsApp webhook"

                # Update status only if it represents progress or failure (non-downgrading)
                if new_weight > current_weight or status_str == "FAILED":
                    old_status = attempt.status
                    attempt.status = status_str

                    # Also update CampaignContact status
                    cc_stmt = select(CampaignContact).where(
                        CampaignContact.campaign_id == attempt.campaign_id,
                        CampaignContact.phone_number == attempt.phone_number,
                        CampaignContact.message_hash == attempt.message_hash
                    )
                    cc_res = await db.execute(cc_stmt)
                    campaign_contact = cc_res.scalar_one_or_none()
                    if campaign_contact:
                        campaign_contact.status = status_str

                    # Update campaign counter metrics
                    campaign_stmt = select(Campaign).where(Campaign.id == attempt.campaign_id)
                    camp_res = await db.execute(campaign_stmt)
                    campaign = camp_res.scalar_one_or_none()
                    if campaign:
                        if status_str == "DELIVERED" and old_status != "DELIVERED":
                            campaign.delivered_count += 1
                        elif status_str == "READ" and old_status != "READ":
                            campaign.read_count += 1
                        elif status_str == "FAILED" and old_status != "FAILED":
                            campaign.failed_count += 1

    event.processed = True
    await db.commit()
    return True
