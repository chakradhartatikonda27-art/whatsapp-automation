import { NextResponse } from "next/server";
import { STORE } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const contact = STORE.contacts.find((c) => c.id === params.id);
  const phone = contact ? contact.phone_number : null;

  const history = STORE.recipients.filter((r) => r.contact_id === params.id || (phone && r.phone_number === phone));

  return NextResponse.json(history);
}
