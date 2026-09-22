import { NextResponse } from "next/server";
import { STORE, loadStore, saveStore, OrganizationRecord, SAAS_PLANS } from "@/lib/db";

export async function GET() {
  loadStore();

  const totalCampaigns = STORE.campaigns.length;
  const totalMessagesProcessed = STORE.campaigns.reduce((acc, c) => acc + (c.total_contacts || 0), 0);
  const totalDelivered = STORE.campaigns.reduce((acc, c) => acc + (c.delivered_count || 0), 0);
  const totalFailed = STORE.campaigns.reduce((acc, c) => acc + (c.failed_count || 0), 0);

  return NextResponse.json({
    organizations: STORE.organizations,
    stats: {
      total_businesses: STORE.organizations.length,
      active_businesses: STORE.organizations.filter((o) => o.status === "ACTIVE").length,
      connected_whatsapp_accounts: STORE.organizations.filter((o) => Boolean(o.whatsapp_config?.display_phone_number)).length,
      total_campaigns: totalCampaigns,
      total_messages_processed: totalMessagesProcessed,
      total_messages_delivered: totalDelivered,
      total_messages_failed: totalFailed
    }
  });
}

export async function POST(req: Request) {
  try {
    loadStore();
    const body = await req.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ detail: "Business name is required" }, { status: 400 });
    }

    const name = body.name.trim();
    const slug = body.slug || name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const orgId = "org_" + slug.replace(/-/g, "_");

    // Check if business already exists
    const existing = STORE.organizations.find((o) => o.id === orgId || o.slug === slug);
    if (existing) {
      return NextResponse.json({ detail: "A business with this name or slug already exists" }, { status: 400 });
    }

    const defaultPlan = SAAS_PLANS[1]; // Growth Plan

    const newOrg: OrganizationRecord = {
      id: orgId,
      name: name,
      slug: slug,
      status: "ACTIVE",
      created_at: new Date().toISOString(),
      plan: {
        id: defaultPlan.id,
        name: defaultPlan.name,
        price: defaultPlan.price,
        monthly_messages: defaultPlan.monthly_messages,
        rate_per_meta_msg: defaultPlan.rate_per_meta_msg,
        rate_per_platform_msg: defaultPlan.rate_per_platform_msg,
        status: "ACTIVE",
        next_renewal: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
      },
      wallet: {
        balance: defaultPlan.price,
        currency: "INR",
        total_credits: defaultPlan.monthly_messages,
        used_credits: 0
      },
      whatsapp_config: {
        mode: body.mode || "DEMO",
        phone_number_id: body.phone_number_id || "pn_" + Math.random().toString(36).substring(2, 8),
        business_account_id: body.business_account_id || "act_" + Math.random().toString(36).substring(2, 8),
        access_token: body.access_token || "",
        display_phone_number: body.display_phone_number || "+91 98765 " + Math.floor(10000 + Math.random() * 90000),
        verify_token: slug.replace(/-/g, "_") + "_verify_secret"
      },
      billing_history: [
        {
          id: "bill_" + Math.random().toString(36).substring(2, 9),
          amount: defaultPlan.price,
          type: "PLAN_PAYMENT",
          description: `${defaultPlan.name} Plan Initial Onboarding (${defaultPlan.monthly_messages.toLocaleString()} Messages)`,
          date: new Date().toISOString(),
          reference: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`
        }
      ]
    };

    STORE.organizations.unshift(newOrg);
    saveStore();

    return NextResponse.json(newOrg, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to onboard business" }, { status: 400 });
  }
}
