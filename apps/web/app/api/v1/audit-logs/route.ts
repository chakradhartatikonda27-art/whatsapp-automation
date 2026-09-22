import { NextResponse } from "next/server";
import { STORE, loadStore } from "@/lib/db";

export async function GET(req: Request) {
  loadStore();
  const orgId = req.headers.get("x-organization-id") || "org_sri_infra";
  const org = STORE.organizations.find((o) => o.id === orgId);
  const logs = org?.audit_logs || [];
  return NextResponse.json(logs);
}
