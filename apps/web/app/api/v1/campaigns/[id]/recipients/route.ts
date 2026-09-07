import { NextResponse } from "next/server";
import { STORE } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status");
  const search = searchParams.get("search")?.toLowerCase();

  let recipients = STORE.recipients.filter((r) => r.campaign_id === params.id);

  // If no recipients specifically match this campaign ID (e.g. serverless cold start),
  // adapt existing stored recipients to match this campaign ID
  if (recipients.length === 0) {
    recipients = STORE.recipients.map((r) => ({
      ...r,
      campaign_id: params.id
    }));
  }

  // Filter by status (ignore "ALL")
  if (statusFilter && statusFilter.toUpperCase() !== "ALL") {
    recipients = recipients.filter((r) => r.status.toUpperCase() === statusFilter.toUpperCase());
  }

  // Filter by search query
  if (search) {
    recipients = recipients.filter(
      (r) =>
        r.name.toLowerCase().includes(search) ||
        r.phone_number.includes(search) ||
        (r.location && r.location.toLowerCase().includes(search))
    );
  }

  return NextResponse.json(recipients);
}
