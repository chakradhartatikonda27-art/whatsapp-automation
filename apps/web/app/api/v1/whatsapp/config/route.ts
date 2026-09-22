import { NextResponse } from "next/server";
import { STORE, loadStore, saveStore } from "@/lib/db";

export async function GET(req: Request) {
  loadStore();
  const orgId = req.headers.get("x-organization-id") || "org_sri_infra";
  const org = STORE.organizations.find((o) => o.id === orgId);
  const waConfig = org?.whatsapp_config || STORE.config;

  return NextResponse.json({
    organization_id: orgId,
    mode: waConfig.mode,
    phone_number_id: waConfig.phone_number_id,
    business_account_id: waConfig.business_account_id,
    display_phone_number: waConfig.display_phone_number,
    has_access_token: Boolean(waConfig.access_token),
    verify_token: waConfig.verify_token
  });
}

export async function POST(req: Request) {
  try {
    loadStore();
    const orgId = req.headers.get("x-organization-id") || "org_sri_infra";
    const body = await req.json();

    const org = STORE.organizations.find((o) => o.id === orgId);
    if (!org) {
      return NextResponse.json({ detail: "Organization not found" }, { status: 404 });
    }

    if (body.mode && (body.mode === "DEMO" || body.mode === "LIVE")) {
      org.whatsapp_config.mode = body.mode;
    }
    if (body.phone_number_id !== undefined) {
      org.whatsapp_config.phone_number_id = body.phone_number_id.trim();
    }
    if (body.business_account_id !== undefined) {
      org.whatsapp_config.business_account_id = body.business_account_id.trim();
    }
    if (body.display_phone_number !== undefined) {
      org.whatsapp_config.display_phone_number = body.display_phone_number.trim();
    }
    if (body.access_token !== undefined && body.access_token !== "") {
      org.whatsapp_config.access_token = body.access_token.trim();
    }
    if (body.verify_token !== undefined) {
      org.whatsapp_config.verify_token = body.verify_token.trim();
    }

    saveStore();

    return NextResponse.json({
      message: `WhatsApp Configuration updated for ${org.name}`,
      organization_id: orgId,
      mode: org.whatsapp_config.mode,
      phone_number_id: org.whatsapp_config.phone_number_id,
      business_account_id: org.whatsapp_config.business_account_id,
      display_phone_number: org.whatsapp_config.display_phone_number,
      has_access_token: Boolean(org.whatsapp_config.access_token),
      verify_token: org.whatsapp_config.verify_token
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to update configuration" }, { status: 400 });
  }
}
