import { NextResponse } from "next/server";
import { STORE, loadStore, saveStore, UserRecord } from "@/lib/db";

export async function GET(req: Request) {
  loadStore();
  const orgId = req.headers.get("x-organization-id") || "org_sri_infra";
  const org = STORE.organizations.find((o) => o.id === orgId);
  const users = org?.users || [
    { id: `usr_${orgId}_1`, organization_id: orgId, name: org?.owner_name || "Owner", email: org?.email || "admin@company.com", role: "Owner" as const, created_at: new Date().toISOString() }
  ];
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  try {
    loadStore();
    const orgId = req.headers.get("x-organization-id") || "org_sri_infra";
    const body = await req.json();

    if (!body.name || !body.email || !body.role) {
      return NextResponse.json({ detail: "Missing name, email, or role" }, { status: 400 });
    }

    const org = STORE.organizations.find((o) => o.id === orgId);
    if (!org) {
      return NextResponse.json({ detail: "Organization not found" }, { status: 404 });
    }

    const newUser: UserRecord = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      organization_id: orgId,
      name: body.name.trim(),
      email: body.email.trim(),
      role: body.role,
      created_at: new Date().toISOString()
    };

    if (!org.users) org.users = [];
    org.users.push(newUser);

    if (!org.audit_logs) org.audit_logs = [];
    org.audit_logs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 9),
      organization_id: orgId,
      user_name: org.owner_name || "Admin",
      action: "Team User Added",
      details: `Added ${newUser.name} (${newUser.email}) with role: ${newUser.role}`,
      timestamp: new Date().toISOString()
    });

    saveStore();

    return NextResponse.json(newUser, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to add team user" }, { status: 400 });
  }
}
