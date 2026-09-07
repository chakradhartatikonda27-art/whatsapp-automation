import { NextResponse } from "next/server";
import { STORE } from "@/lib/db";

export async function GET() {
  return NextResponse.json(STORE.templates);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newTemplate = {
      id: "tpl_" + Math.random().toString(36).substring(2, 9),
      organization_id: "org_apex_realestate",
      name: body.name || "Custom Real Estate Template",
      template_name: body.template_name || "custom_template",
      language: body.language || "en_US",
      category: body.category || "MARKETING",
      status: "APPROVED",
      components: body.components || [
        {
          type: "BODY",
          text: body.text || "Hello {{1}}, check out luxury properties at {{2}}!"
        }
      ]
    };
    STORE.templates.push(newTemplate);
    return NextResponse.json(newTemplate, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to create template" }, { status: 400 });
  }
}
