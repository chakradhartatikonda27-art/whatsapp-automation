import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ detail: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      media_id: "med_" + Math.random().toString(36).substring(2, 9),
      filename: file.name,
      media_url: dataUrl,
      size: file.size,
      mime_type: mimeType
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Media upload failed" }, { status: 500 });
  }
}
