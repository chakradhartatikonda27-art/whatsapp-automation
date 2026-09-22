import { NextResponse } from "next/server";
import { STORE, loadStore } from "@/lib/db";

export async function GET(req: Request) {
  loadStore();
  const orgId = req.headers.get("x-organization-id") || "org_sri_infra";
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase();

  let tenantContacts = STORE.contacts.filter((c) => c.organization_id === orgId);

  // If no contacts exist yet for this tenant, provide initial sample contacts
  if (tenantContacts.length === 0) {
    const org = STORE.organizations.find((o) => o.id === orgId);
    const orgName = org ? org.name : "Real Estate";
    tenantContacts = [
      {
        id: `c_${orgId}_1`,
        organization_id: orgId,
        name: "Ram",
        phone_number: "+918074418868",
        location: "Rajahmundry",
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: `c_${orgId}_2`,
        organization_id: orgId,
        name: "Chakri",
        phone_number: "+916302042599",
        location: "Rajahmundry",
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: `c_${orgId}_3`,
        organization_id: orgId,
        name: "Pujitha",
        phone_number: "+918885397517",
        location: "Rajahmundry",
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: `c_${orgId}_4`,
        organization_id: orgId,
        name: "Ramu",
        phone_number: "+919390560625",
        location: "Kakinada",
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    STORE.contacts.push(...tenantContacts);
  }

  if (search) {
    tenantContacts = tenantContacts.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.phone_number.includes(search) ||
        (c.location && c.location.toLowerCase().includes(search))
    );
  }

  return NextResponse.json(tenantContacts);
}
