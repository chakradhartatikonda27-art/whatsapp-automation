import { NextResponse } from "next/server";
import { STORE } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = STORE.imports[params.id];
  if (!session) {
    return NextResponse.json({ detail: "Import session not found" }, { status: 404 });
  }

  return NextResponse.json({
    import_id: session.import_id,
    file_name: session.file_name,
    total_rows: session.total_rows,
    valid_contacts: session.valid_contacts.length,
    invalid_numbers: session.invalid_numbers.length,
    duplicate_rows: session.duplicate_rows,
    previously_processed: session.previously_processed,
    ready_for_campaign: session.ready_for_campaign,
    detected_columns: session.detected_columns,
    sample_valid: session.valid_contacts.slice(0, 10),
    sample_invalid: session.invalid_numbers.slice(0, 10)
  });
}
