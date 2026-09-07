import { NextResponse } from "next/server";
import { STORE } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const campaign = STORE.campaigns.find((c) => c.id === params.id);
  if (!campaign) {
    // Return first campaign or 404
    if (STORE.campaigns.length > 0) {
      return NextResponse.json(STORE.campaigns[0]);
    }
    return NextResponse.json({ detail: "Campaign not found" }, { status: 404 });
  }
  return NextResponse.json(campaign);
}
