import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    user_id: "usr_apex_admin",
    organization_id: "org_apex_realestate",
    user_name: "Vikram Sharma",
    email: "admin@apexrealestate.com",
    role: "owner"
  });
}
