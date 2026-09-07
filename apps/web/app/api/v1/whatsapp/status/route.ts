import { NextResponse } from "next/server";
import { STORE } from "@/lib/db";

export async function GET() {
  const isLive = STORE.config.mode === "LIVE";
  const hasToken = Boolean(STORE.config.access_token);

  return NextResponse.json({
    is_connected: true,
    provider_mode: isLive ? (hasToken ? "Meta WhatsApp Cloud API (Live)" : "Meta Cloud API (Awaiting Token)") : "Demo Mode / Simulated Sandbox",
    mode: STORE.config.mode,
    display_phone_number: STORE.config.display_phone_number || "+91 98765 43210",
    business_account_id: STORE.config.business_account_id || "act_10293847",
    phone_number_id: STORE.config.phone_number_id || "pn_48372610",
    status: isLive ? (hasToken ? "connected" : "needs_credentials") : "connected",
    quality_rating: "GREEN",
    has_access_token: hasToken,
    verify_token: STORE.config.verify_token
  });
}
