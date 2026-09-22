import { NextResponse } from "next/server";
import { STORE, loadStore, saveStore, computeMessageFingerprint, normalizePhone, CampaignRecord, RecipientRecord } from "@/lib/db";

export async function GET(req: Request) {
  loadStore();
  const orgId = req.headers.get("x-organization-id") || "org_sri_infra";
  const tenantCampaigns = STORE.campaigns.filter((c) => c.organization_id === orgId || !c.organization_id);
  return NextResponse.json(tenantCampaigns);
}

export async function POST(req: Request) {
  try {
    loadStore();
    const orgId = req.headers.get("x-organization-id") || "org_sri_infra";
    const body = await req.json();
    const campaignId = "cmp_" + Math.random().toString(36).substring(2, 9);

    // Fetch tenant organization whatsapp credentials
    const org = STORE.organizations.find((o) => o.id === orgId);
    const waConfig = org?.whatsapp_config || STORE.config;

    if (Array.isArray(body.client_fingerprints)) {
      body.client_fingerprints.forEach((h: string) => STORE.messageHashes.add(h));
    }

    let targetContacts: any[] = [];

    if (body.import_id && STORE.imports[body.import_id]) {
      targetContacts = STORE.imports[body.import_id].valid_contacts || [];
    } else if (Array.isArray(body.contacts) && body.contacts.length > 0) {
      targetContacts = body.contacts;
    } else {
      // Default tenant contacts fallback
      targetContacts = STORE.contacts.filter((c) => c.organization_id === orgId);
      if (targetContacts.length === 0) {
        targetContacts = [
          { name: "Ram", phone_number: "+918074418868", location: "Rajahmundry" },
          { name: "Chakri", phone_number: "+916302042599", location: "Rajahmundry" },
          { name: "Pujitha", phone_number: "+918885397517", location: "Rajahmundry" },
          { name: "Ramu", phone_number: "+919390560625", location: "Kakinada" }
        ];
      }
    }

    let sentCount = 0;
    let deliveredCount = 0;
    let readCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    const processedFingerprints: string[] = [];

    const messageTemplateOrBody = body.message_body || body.template_id || "Real Estate Announcement";
    const mediaUrl = body.media_url || "";
    const isLiveMode = waConfig.mode === "LIVE" && Boolean(waConfig.access_token);

    for (const c of targetContacts) {
      const phoneRes = normalizePhone(c.phone_number || c.phone || "");
      if (!phoneRes.is_valid) {
        failedCount++;
        continue;
      }

      const canonicalPhone = phoneRes.normalized;
      const contactName = c.name || "Valued Prospect";
      const location = c.location || "Rajahmundry";

      const vars = { name: contactName, location };
      const fingerprint = computeMessageFingerprint(orgId, canonicalPhone, messageTemplateOrBody, vars, mediaUrl);
      const recipientId = "rec_" + Math.random().toString(36).substring(2, 9);
      processedFingerprints.push(fingerprint);

      const isDuplicate = 
        STORE.messageHashes.has(fingerprint) || 
        STORE.recipients.some((r) => r.organization_id === orgId && r.message_hash === fingerprint) ||
        STORE.recipients.some((r) => {
          if (r.organization_id !== orgId) return false;
          const rPhone = normalizePhone(r.phone_number).normalized;
          if (rPhone !== canonicalPhone) return false;
          const parentCamp = STORE.campaigns.find((cp) => cp.id === r.campaign_id);
          if (parentCamp) {
            const parentContent = (parentCamp.message_body || parentCamp.template_id || "").trim().toLowerCase();
            const currentContent = (messageTemplateOrBody || "").trim().toLowerCase();
            return parentContent === currentContent && parentContent !== "";
          }
          return false;
        });

      if (isDuplicate) {
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
        // NEW MESSAGE DISPATCH
        let wamid: string | null = null;
        let dispatchStatus = "DELIVERED";
        let failureReason: string | null = null;

        if (isLiveMode) {
          // DISPATCH TO LIVE META WHATSAPP CLOUD API FOR THIS TENANT
          try {
            const interpolatedText = (body.message_body || "Hello {{Name}}")
              .replace(/\{\{\s*Name\s*\}\}/gi, contactName)
              .replace(/\{\{\s*Location\s*\}\}/gi, location)
              .replace(/\{\{1\}\}/g, contactName)
              .replace(/\{\{2\}\}/g, location);

            const metaPayload: any = {
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: canonicalPhone.replace("+", ""),
            };

            if (body.template_id) {
              metaPayload.type = "template";
              metaPayload.template = {
                name: body.template_id,
                language: { code: "en_US" }
              };
            } else {
              metaPayload.type = "text";
              metaPayload.text = { body: interpolatedText };
            }

            const metaRes = await fetch(
              `https://graph.facebook.com/v19.0/${waConfig.phone_number_id}/messages`,
              {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${waConfig.access_token}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(metaPayload)
              }
            );

            if (metaRes.ok) {
              const metaData = await metaRes.json();
              wamid = metaData.messages?.[0]?.id || "wamid.META_" + Math.random().toString(36).substring(2, 10);
              dispatchStatus = "SENT";
              sentCount++;
              deliveredCount++;
              STORE.messageHashes.add(fingerprint);
            } else {
              const errData = await metaRes.json().catch(() => ({}));
              dispatchStatus = "FAILED";
              failureReason = "Meta API Error: " + (errData.error?.message || "HTTP " + metaRes.status);
              failedCount++;
            }
          } catch (metaErr: any) {
            dispatchStatus = "FAILED";
            failureReason = "Meta API Exception: " + metaErr.message;
            failedCount++;
          }
        } else {
          // DEMO MODE / SIMULATED DISPATCH
          STORE.messageHashes.add(fingerprint);
          wamid = "wamid.DEMO_" + Math.random().toString(36).substring(2, 10).toUpperCase();
          dispatchStatus = "DELIVERED";
          sentCount++;
          deliveredCount++;
          readCount++;
        }

        STORE.recipients.push({
          id: recipientId,
          campaign_id: campaignId,
          organization_id: orgId,
          phone_number: canonicalPhone,
          name: contactName,
          location: location,
          message_hash: fingerprint,
          status: dispatchStatus,
          skip_reason: failureReason,
          whatsapp_message_id: wamid,
          sent_at: new Date().toISOString(),
          delivered_at: dispatchStatus === "DELIVERED" ? new Date().toISOString() : undefined,
          read_at: dispatchStatus === "READ" || dispatchStatus === "DELIVERED" ? new Date().toISOString() : undefined
        });

        // Add to tenant contacts directory if not present
        if (!STORE.contacts.some((ct) => ct.organization_id === orgId && ct.phone_number === canonicalPhone)) {
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

    const totalToProcess = targetContacts.length;
    const isAllSkipped = skippedCount >= totalToProcess;
    const initialStatus = isAllSkipped ? "COMPLETED" : "PROCESSING";

    const campaignRecord: CampaignRecord = {
      id: campaignId,
      organization_id: orgId,
      name: body.name || `${org?.name || "Real Estate"} Campaign`,
      message_type: body.message_type || (body.template_id ? "template" : "custom"),
      template_id: body.template_id || null,
      message_body: body.message_body || null,
      media_url: mediaUrl || null,
      status: initialStatus,
      total_contacts: totalToProcess,
      queued_count: isAllSkipped ? 0 : totalToProcess - skippedCount,
      sent_count: isAllSkipped ? 0 : sentCount,
      delivered_count: isAllSkipped ? 0 : deliveredCount,
      read_count: isAllSkipped ? 0 : readCount,
      failed_count: failedCount,
      skipped_count: skippedCount,
      created_by: "tenant_admin",
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      completed_at: isAllSkipped ? new Date().toISOString() : undefined,
      processed_fingerprints: processedFingerprints
    } as any;

    STORE.campaigns.unshift(campaignRecord);
    saveStore();
    return NextResponse.json(campaignRecord, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to create campaign" }, { status: 500 });
  }
}
