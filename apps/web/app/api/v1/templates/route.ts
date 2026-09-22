import { NextResponse } from "next/server";
import { STORE, loadStore, saveStore } from "@/lib/db";

export async function GET(req: Request) {
  loadStore();
  const orgId = req.headers.get("x-organization-id") || "org_sri_infra";
  const tenantTemplates = STORE.templates.filter((t) => t.organization_id === orgId || !t.organization_id);

  if (tenantTemplates.length === 0) {
    const org = STORE.organizations.find((o) => o.id === orgId);
    const orgName = org ? org.name : "Real Estate";
    return NextResponse.json([
      {
        id: `tpl_${orgId}_1`,
        organization_id: orgId,
        name: `${orgName} Exclusive Launch Offer`,
        template_name: `${orgId}_exclusive_launch`,
        language: "en_US",
        category: "MARKETING",
        status: "APPROVED",
        components: [
          {
            type: "BODY",
            text: `Hi {{1}}, ${orgName} has a new property opportunity in {{2}}. Contact us today for exclusive pre-launch discounts!`
          }
        ]
      }
    ]);
  }

  return NextResponse.json(tenantTemplates);
}

export async function POST(req: Request) {
  try {
    loadStore();
    const orgId = req.headers.get("x-organization-id") || "org_sri_infra";
    const body = await req.json();
    const newTemplate = {
      id: "tpl_" + Math.random().toString(36).substring(2, 9),
      organization_id: orgId,
      name: body.name || "Custom Real Estate Template",
      template_name: body.template_name || "custom_template",
      language: body.language || "en_US",
      category: body.category || "MARKETING",
      status: "APPROVED",
      components: body.components || [
        {
          type: "BODY",
          text: body.text || "Hello {{1}}, check out luxury properties at {{2}}!"
        }
      ]
    };
    STORE.templates.push(newTemplate);
    saveStore();
    return NextResponse.json(newTemplate, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to create template" }, { status: 400 });
  }
}
