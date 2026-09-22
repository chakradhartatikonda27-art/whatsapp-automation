import { NextResponse } from "next/server";
import { STORE, loadStore } from "@/lib/db";

export async function GET(req: Request) {
  loadStore();
  const orgId = req.headers.get("x-organization-id") || "org_sri_infra";
  const org = STORE.organizations.find((o) => o.id === orgId);
  const waConfig = org?.whatsapp_config || STORE.config;

  const isLive = waConfig.mode === "LIVE";
  const hasToken = Boolean(waConfig.access_token);

  return NextResponse.json({
    organization_id: orgId,
    organization_name: org?.name || "Active Business",
    is_connected: true,
    provider_mode: isLive ? (hasToken ? "Meta WhatsApp Cloud API (Live)" : "Meta Cloud API (Awaiting Token)") : "Demo Mode / Simulated Sandbox",
    mode: waConfig.mode,
    display_phone_number: waConfig.display_phone_number || "+91 98765 43210",
    business_account_id: waConfig.business_account_id || "act_10293847",
    phone_number_id: waConfig.phone_number_id || "pn_48372610",
    status: isLive ? (hasToken ? "connected" : "needs_credentials") : "connected",
    quality_rating: "GREEN",
    has_access_token: hasToken,
    verify_token: waConfig.verify_token
  });
}
