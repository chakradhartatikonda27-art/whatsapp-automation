import { NextResponse } from "next/server";
import { STORE } from "@/lib/db";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const campaign = STORE.campaigns.find((c) => c.id === params.id);
  if (campaign) campaign.status = "CANCELLED";
  return NextResponse.json({ status: "CANCELLED", message: "Campaign cancelled successfully" });
}
