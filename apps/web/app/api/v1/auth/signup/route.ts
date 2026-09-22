import { NextResponse } from "next/server";
import { STORE, loadStore, saveStore, OrganizationRecord, SAAS_PLANS } from "@/lib/db";

export async function POST(req: Request) {
  try {
    loadStore();
    const body = await req.json();

    if (!body.company_name || !body.owner_name || !body.email || !body.mobile_number) {
      return NextResponse.json({ detail: "Missing required signup fields" }, { status: 400 });
    }

    const name = body.company_name.trim();
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const orgId = "org_" + slug.replace(/-/g, "_") + "_" + Math.random().toString(36).substring(2, 6);

    const selectedPlanObj = SAAS_PLANS.find((p) => p.id === body.plan_id) || SAAS_PLANS[1];

    const newOrg: OrganizationRecord = {
      id: orgId,
      name: name,
      slug: slug,
      owner_name: body.owner_name.trim(),
      email: body.email.trim(),
      mobile_number: body.mobile_number.trim(),
      category: body.category || "Real Estate",
      website: body.website || "",
      address: body.address || "",
      status: "ACTIVE",
      created_at: new Date().toISOString(),
      plan: {
        id: selectedPlanObj.id,
        name: selectedPlanObj.name,
        price: selectedPlanObj.price,
        monthly_messages: selectedPlanObj.monthly_messages,
        rate_per_meta_msg: selectedPlanObj.rate_per_meta_msg,
        rate_per_platform_msg: selectedPlanObj.rate_per_platform_msg,
        status: "ACTIVE",
        next_renewal: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
      },
      wallet: {
        balance: selectedPlanObj.price,
        currency: "INR",
        total_credits: selectedPlanObj.monthly_messages,
        used_credits: 0
      },
      whatsapp_config: {
        mode: "DEMO",
        phone_number_id: "pn_" + Math.random().toString(36).substring(2, 8),
        business_account_id: "act_" + Math.random().toString(36).substring(2, 8),
        access_token: "",
        display_phone_number: body.mobile_number,
        verify_token: slug.replace(/-/g, "_") + "_verify",
        is_embedded_connected: false
      },
      billing_history: [
        {
          id: "bill_" + Math.random().toString(36).substring(2, 9),
          amount: selectedPlanObj.price,
          type: "PLAN_PAYMENT",
          description: `${selectedPlanObj.name} Plan Initial Signup (${selectedPlanObj.monthly_messages.toLocaleString()} Messages)`,
          date: new Date().toISOString(),
          reference: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`
        }
      ]
    };

    STORE.organizations.unshift(newOrg);
    saveStore();

    return NextResponse.json({
      message: "Business onboarding successful",
      organization: newOrg,
      next_step: "/onboarding/whatsapp"
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Signup failed" }, { status: 500 });
  }
}
