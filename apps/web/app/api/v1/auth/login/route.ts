import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (email === "admin@apexrealestate.com" && password === "password123") {
      return NextResponse.json({
        access_token: "jwt_token_apex_admin_1029384756",
        token_type: "bearer",
        user_id: "usr_apex_admin",
        organization_id: "org_apex_realestate",
        user_name: "Vikram Sharma",
        role: "owner"
      });
    }

    return NextResponse.json(
      { detail: "Invalid email or password" },
      { status: 401 }
    );
  } catch (err) {
    return NextResponse.json(
      { detail: "Malformed request payload" },
      { status: 400 }
    );
  }
}
