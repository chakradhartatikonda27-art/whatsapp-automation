import { NextResponse } from "next/server";
import { STORE, loadStore, saveStore } from "@/lib/db";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    loadStore();
    const orgId = req.headers.get("x-organization-id") || "org_sri_infra";
    const contact = STORE.contacts.find((c) => c.id === params.id && c.organization_id === orgId);

    if (!contact) {
      return NextResponse.json({ detail: "Contact not found" }, { status: 404 });
    }

    contact.opt_out = !contact.opt_out;
    contact.opt_out_at = contact.opt_out ? new Date().toISOString() : undefined;

    const org = STORE.organizations.find((o) => o.id === orgId);
    if (org) {
      if (!org.audit_logs) org.audit_logs = [];
      org.audit_logs.unshift({
        id: "log_" + Math.random().toString(36).substring(2, 9),
        organization_id: orgId,
        user_name: org.owner_name || "Admin",
        action: contact.opt_out ? "Contact Opted Out" : "Contact Opt-In Restored",
        details: `${contact.name} (${contact.phone_number}) ${contact.opt_out ? "marked as OPTED_OUT" : "restored to ACTIVE"}`,
        timestamp: new Date().toISOString()
      });
    }

    saveStore();

    return NextResponse.json({
      message: `Contact ${contact.name} is now ${contact.opt_out ? "OPTED OUT" : "ACTIVE"}`,
      contact
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to update opt-out status" }, { status: 500 });
  }
}
