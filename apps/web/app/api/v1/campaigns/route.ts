import { NextResponse } from "next/server";
import { STORE, computeMessageFingerprint, normalizePhone, CampaignRecord, RecipientRecord } from "@/lib/db";

// Pre-populate initial mock campaign if empty
if (STORE.campaigns.length === 0) {
  STORE.campaigns.push({
    id: "4ef8a059-a9a3-4f1d-ae74-e65cdf4e915e",
    organization_id: "org_apex_realestate",
    name: "Gachibowli Luxury Villas Prospect Blast",
    message_type: "custom",
    template_id: null,
    status: "COMPLETED",
    total_contacts: 3,
    queued_count: 0,
    sent_count: 3,
    delivered_count: 3,
    read_count: 2,
    failed_count: 0,
    skipped_count: 0,
    created_by: "user_demo",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    started_at: new Date(Date.now() - 3500000).toISOString(),
    completed_at: new Date(Date.now() - 3400000).toISOString()
  });

  STORE.recipients.push(
    {
      id: "rec_1",
      campaign_id: "4ef8a059-a9a3-4f1d-ae74-e65cdf4e915e",
      organization_id: "org_apex_realestate",
      phone_number: "+919876543210",
      name: "Ravi Kumar",
      location: "Gachibowli, Hyderabad",
      message_hash: "hash_demo_1",
      status: "DELIVERED",
      whatsapp_message_id: "wamid.HBgM12345678",
      sent_at: new Date(Date.now() - 3500000).toISOString()
    },
    {
      id: "rec_2",
      campaign_id: "4ef8a059-a9a3-4f1d-ae74-e65cdf4e915e",
      organization_id: "org_apex_realestate",
      phone_number: "+919876543211",
      name: "Priya Sharma",
      location: "Jubilee Hills, Hyderabad",
      message_hash: "hash_demo_2",
      status: "READ",
      whatsapp_message_id: "wamid.HBgM12345679",
      sent_at: new Date(Date.now() - 3500000).toISOString()
    },
    {
      id: "rec_3",
      campaign_id: "4ef8a059-a9a3-4f1d-ae74-e65cdf4e915e",
      organization_id: "org_apex_realestate",
      phone_number: "+919876543212",
      name: "Suresh Reddy",
      location: "Banjara Hills, Hyderabad",
      message_hash: "hash_demo_3",
      status: "DELIVERED",
      whatsapp_message_id: "wamid.HBgM12345680",
      sent_at: new Date(Date.now() - 3500000).toISOString()
    }
  );
}

export async function GET() {
  return NextResponse.json(STORE.campaigns);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const campaignId = "cmp_" + Math.random().toString(36).substring(2, 9);
    const orgId = "org_apex_realestate";

    let targetContacts: any[] = [];

    if (body.import_id && STORE.imports[body.import_id]) {
      targetContacts = STORE.imports[body.import_id].valid_contacts || [];
    } else if (Array.isArray(body.contacts) && body.contacts.length > 0) {
      targetContacts = body.contacts;
    } else {
      // Fallback sample contacts if none specified
      targetContacts = [
        { name: "Ravi Kumar", phone_number: "+919876543210", location: "Gachibowli, Hyderabad" },
        { name: "Priya Sharma", phone_number: "+919876543211", location: "Jubilee Hills, Hyderabad" },
        { name: "Suresh Reddy", phone_number: "+919876543212", location: "Banjara Hills, Hyderabad" }
      ];
    }

    let sentCount = 0;
    let deliveredCount = 0;
    let readCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    const messageTemplateOrBody = body.message_body || body.template_id || "Real Estate Announcement";
    const mediaUrl = body.media_url || "";

    for (const c of targetContacts) {
      const phoneRes = normalizePhone(c.phone_number || c.phone || "");
      if (!phoneRes.is_valid) {
        failedCount++;
        continue;
      }

      const canonicalPhone = phoneRes.normalized;
      const contactName = c.name || "Valued Prospect";
      const location = c.location || "Hyderabad";

      const vars = { name: contactName, location };
      const fingerprint = computeMessageFingerprint(orgId, canonicalPhone, messageTemplateOrBody, vars, mediaUrl);

      const recipientId = "rec_" + Math.random().toString(36).substring(2, 9);

      if (STORE.messageHashes.has(fingerprint)) {
        // DUPLICATE DETECTED - SKIP OUTBOUND DISPATCH
        skippedCount++;
        STORE.recipients.push({
          id: recipientId,
          campaign_id: campaignId,
          organization_id: orgId,
          phone_number: canonicalPhone,
          name: contactName,
          location: location,
          message_hash: fingerprint,
          status: "SKIPPED",
          skip_reason: "DUPLICATE_MESSAGE_FINGERPRINT",
          whatsapp_message_id: null
        });
      } else {
        // NEW MESSAGE - DISPATCH AND RECORD FINGERPRINT
        STORE.messageHashes.add(fingerprint);
        sentCount++;
        deliveredCount++;
        readCount++;

        STORE.recipients.push({
          id: recipientId,
          campaign_id: campaignId,
          organization_id: orgId,
          phone_number: canonicalPhone,
          name: contactName,
          location: location,
          message_hash: fingerprint,
          status: "DELIVERED",
          skip_reason: null,
          whatsapp_message_id: "wamid." + Math.random().toString(36).substring(2, 12).toUpperCase(),
          sent_at: new Date().toISOString(),
          delivered_at: new Date().toISOString(),
          read_at: new Date().toISOString()
        });

        // Add to global contacts directory if not present
        if (!STORE.contacts.some((ct) => ct.phone_number === canonicalPhone)) {
          STORE.contacts.push({
            id: "ct_" + Math.random().toString(36).substring(2, 9),
            organization_id: orgId,
            name: contactName,
            phone_number: canonicalPhone,
            location: location,
            created_at: new Date().toISOString()
          });
        }
      }
    }

    const campaignRecord: CampaignRecord = {
      id: campaignId,
      organization_id: orgId,
      name: body.name || "Real Estate Prospect Campaign",
      message_type: body.message_type || (body.template_id ? "template" : "custom"),
      template_id: body.template_id || null,
      message_body: body.message_body || null,
      media_url: mediaUrl || null,
      status: "COMPLETED",
      total_contacts: targetContacts.length,
      queued_count: 0,
      sent_count: sentCount,
      delivered_count: deliveredCount,
      read_count: readCount,
      failed_count: failedCount,
      skipped_count: skippedCount,
      created_by: "user_demo",
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    };

    STORE.campaigns.unshift(campaignRecord);
    return NextResponse.json(campaignRecord, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to create campaign" }, { status: 500 });
  }
}
