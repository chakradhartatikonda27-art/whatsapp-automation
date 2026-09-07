import { NextResponse } from "next/server";
import { STORE } from "@/lib/db";

export async function GET() {
  return NextResponse.json({
    mode: STORE.config.mode,
    phone_number_id: STORE.config.phone_number_id,
    business_account_id: STORE.config.business_account_id,
    display_phone_number: STORE.config.display_phone_number,
    has_access_token: Boolean(STORE.config.access_token),
    verify_token: STORE.config.verify_token
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.mode && (body.mode === "DEMO" || body.mode === "LIVE")) {
      STORE.config.mode = body.mode;
    }
    if (body.phone_number_id !== undefined) {
      STORE.config.phone_number_id = body.phone_number_id.trim();
    }
    if (body.business_account_id !== undefined) {
      STORE.config.business_account_id = body.business_account_id.trim();
    }
    if (body.display_phone_number !== undefined) {
      STORE.config.display_phone_number = body.display_phone_number.trim();
    }
    if (body.access_token !== undefined && body.access_token !== "") {
      STORE.config.access_token = body.access_token.trim();
    }
    if (body.verify_token !== undefined) {
      STORE.config.verify_token = body.verify_token.trim();
    }

    return NextResponse.json({
      message: "WhatsApp Configuration updated successfully",
      mode: STORE.config.mode,
      phone_number_id: STORE.config.phone_number_id,
      business_account_id: STORE.config.business_account_id,
      display_phone_number: STORE.config.display_phone_number,
      has_access_token: Boolean(STORE.config.access_token),
      verify_token: STORE.config.verify_token
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to update configuration" }, { status: 400 });
  }
}
