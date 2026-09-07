import { NextResponse } from "next/server";
import { STORE } from "@/lib/db";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const campaign = STORE.campaigns.find((c) => c.id === params.id);
  if (campaign) campaign.status = "PAUSED";
  return NextResponse.json({ status: "PAUSED", message: "Campaign paused successfully" });
}
