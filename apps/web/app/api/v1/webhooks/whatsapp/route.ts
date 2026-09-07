import { NextResponse } from "next/server";
import { STORE } from "@/lib/db";

// GET Endpoint for Meta Webhook Verification Challenge
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = STORE.config.verify_token || "apex_realestate_verify_secret";

  if (mode === "subscribe" && token === expectedToken) {
    console.log("[Webhook] Verification successful!");
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// POST Endpoint for Meta Real-Time Status Notifications
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (value?.statuses && Array.isArray(value.statuses)) {
      for (const st of value.statuses) {
        const wamid = st.id;
        const statusStr = (st.status || "").toUpperCase(); // SENT, DELIVERED, READ, FAILED

        const recipient = STORE.recipients.find((r) => r.whatsapp_message_id === wamid);
        if (recipient) {
          recipient.status = statusStr;
          if (statusStr === "DELIVERED") recipient.delivered_at = new Date().toISOString();
          if (statusStr === "READ") recipient.read_at = new Date().toISOString();

          // Update parent campaign stats
          const campaign = STORE.campaigns.find((c) => c.id === recipient.campaign_id);
          if (campaign) {
            if (statusStr === "DELIVERED") campaign.delivered_count++;
            if (statusStr === "READ") campaign.read_count++;
          }
        }
      }
    }

    return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
