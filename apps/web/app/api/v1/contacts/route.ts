import { NextResponse } from "next/server";
import { STORE } from "@/lib/db";

// Pre-populate contacts if empty
if (STORE.contacts.length === 0) {
  STORE.contacts.push(
    {
      id: "c1",
      organization_id: "org_apex_realestate",
      name: "Ravi Kumar",
      phone_number: "+919876543210",
      location: "Gachibowli, Hyderabad",
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: "c2",
      organization_id: "org_apex_realestate",
      name: "Priya Sharma",
      phone_number: "+919876543211",
      location: "Jubilee Hills, Hyderabad",
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: "c3",
      organization_id: "org_apex_realestate",
      name: "Suresh Reddy",
      phone_number: "+919876543212",
      location: "Banjara Hills, Hyderabad",
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase();

  let result = STORE.contacts;
  if (search) {
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.phone_number.includes(search) ||
        (c.location && c.location.toLowerCase().includes(search))
    );
  }

  return NextResponse.json(result);
}
