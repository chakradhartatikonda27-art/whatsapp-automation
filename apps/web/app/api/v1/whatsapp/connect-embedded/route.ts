import { NextResponse } from "next/server";
import { STORE, loadStore, saveStore } from "@/lib/db";

export async function POST(req: Request) {
  try {
    loadStore();
    const orgId = req.headers.get("x-organization-id") || "org_sri_infra";
    const body = await req.json();

    const org = STORE.organizations.find((o) => o.id === orgId);
    if (!org) {
      return NextResponse.json({ detail: "Organization not found" }, { status: 404 });
    }

    const mode = body.mode || "LIVE";
    const displayPhone = body.display_phone_number || org.mobile_number || "+91 98765 88888";

    org.whatsapp_config = {
      ...org.whatsapp_config,
      mode: mode,
      display_phone_number: displayPhone,
      phone_number_id: "pn_meta_" + Math.random().toString(36).substring(2, 9),
      business_account_id: "wba_meta_" + Math.random().toString(36).substring(2, 9),
      access_token: "EAAG_META_EMBEDDED_TOKEN_" + Math.random().toString(36).substring(2, 12),
      is_embedded_connected: true,
      connected_at: new Date().toISOString()
    };

    saveStore();

    return NextResponse.json({
      message: "Meta WhatsApp Business Account connected successfully via Embedded Flow",
      whatsapp_config: org.whatsapp_config
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Embedded connection failed" }, { status: 500 });
  }
}
