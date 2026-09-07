import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    is_connected: true,
    provider_mode: "Cloud API / Sandbox",
    display_phone_number: "+91 98765 43210",
    business_account_id: "act_10293847",
    phone_number_id: "pn_48372610",
    status: "connected",
    quality_rating: "GREEN"
  });
}
