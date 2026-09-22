import { NextResponse } from "next/server";
import { STORE, loadStore, saveStore, SAAS_PLANS } from "@/lib/db";

export async function GET(req: Request) {
  loadStore();
  const orgId = req.headers.get("x-organization-id") || "org_sri_infra";
  const org = STORE.organizations.find((o) => o.id === orgId) || STORE.organizations[0];

  const tenantCampaigns = STORE.campaigns.filter((c) => c.organization_id === orgId);
  const totalProcessed = tenantCampaigns.reduce((acc, c) => acc + (c.total_contacts || 0), 0);
  const totalDelivered = tenantCampaigns.reduce((acc, c) => acc + (c.delivered_count || 0), 0);
  const totalFailed = tenantCampaigns.reduce((acc, c) => acc + (c.failed_count || 0), 0);
  const totalSkippedDuplicates = tenantCampaigns.reduce((acc, c) => acc + (c.skipped_count || 0), 0);

  return NextResponse.json({
    organization_id: org.id,
    organization_name: org.name,
    plan: org.plan || SAAS_PLANS[1],
    wallet: org.wallet || { balance: 5000, currency: "INR", total_credits: 10000, used_credits: 1200 },
    billing_history: org.billing_history || [],
    usage_stats: {
      messages_processed: totalProcessed,
      messages_delivered: totalDelivered,
      messages_failed: totalFailed,
      skipped_duplicates_saved: totalSkippedDuplicates,
      credits_remaining: Math.max(0, (org.wallet?.total_credits || 10000) - (org.wallet?.used_credits || 0))
    },
    available_plans: SAAS_PLANS
  });
}

export async function POST(req: Request) {
  try {
    loadStore();
    const orgId = req.headers.get("x-organization-id") || "org_sri_infra";
    const body = await req.json();

    const org = STORE.organizations.find((o) => o.id === orgId);
    if (!org) {
      return NextResponse.json({ detail: "Organization not found" }, { status: 404 });
    }

    const amount = Number(body.amount) || 1000;
    if (amount <= 0) {
      return NextResponse.json({ detail: "Invalid top-up amount" }, { status: 400 });
    }

    if (!org.wallet) {
      org.wallet = { balance: 0, currency: "INR", total_credits: 10000, used_credits: 0 };
    }

    org.wallet.balance += amount;
    org.wallet.total_credits += Math.round(amount * 1.5); // Add bonus message credits for wallet topups

    const newRecord = {
      id: "bill_" + Math.random().toString(36).substring(2, 9),
      amount: amount,
      type: "TOPUP" as const,
      description: `Wallet Balance Top-Up (₹${amount.toLocaleString()})`,
      date: new Date().toISOString(),
      reference: `PAY-2026-${Math.floor(1000 + Math.random() * 9000)}`
    };

    if (!org.billing_history) org.billing_history = [];
    org.billing_history.unshift(newRecord);

    saveStore();

    return NextResponse.json({
      message: `Successfully added ₹${amount.toLocaleString()} to wallet balance`,
      wallet: org.wallet,
      new_record: newRecord
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to top-up wallet" }, { status: 400 });
  }
}
