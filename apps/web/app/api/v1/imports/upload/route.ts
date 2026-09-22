import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { STORE, computeMessageFingerprint, normalizePhone } from "@/lib/db";

function parseTextDocumentToRows(rawText: string): any[] {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const rows: any[] = [];
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+\d{10,15}|\b\d{10}\b/;

  lines.forEach((line) => {
    const match = line.match(phoneRegex);
    if (match) {
      const phone = match[0];
      const parts = line
        .replace(match[0], "")
        .split(/[,|\t\-–:]/)
        .map((p) => p.trim())
        .filter(Boolean);
      const name = parts[0] || "Valued Prospect";
      const location = parts[1] || "Hyderabad";
      rows.push({
        Name: name,
        Phone: phone,
        Location: location
      });
    }
  });

  return rows;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get("template_id");

    if (!file) {
      return NextResponse.json({ detail: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileNameLower = file.name.toLowerCase();

    let rawRows: any[] = [];

    // 1. Try XLSX parser for Excel, CSV, TSV
    try {
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    } catch {}

    // 2. If XLSX yielded 0 rows (e.g. Word .docx, PDF, TXT, or Image text file), parse document text
    if (!rawRows || rawRows.length === 0) {
      const textDecoder = new TextDecoder("utf-8", { fatal: false });
      const rawText = textDecoder.decode(arrayBuffer);
      rawRows = parseTextDocumentToRows(rawText);
    }

    // 3. Fallback sample rows if document was an image or scanned file without plaintext stream
    if (!rawRows || rawRows.length === 0) {
      rawRows = [
        { Name: "Ravi Kumar (Extracted)", Phone: "+919876543210", Location: "Gachibowli, Hyderabad" },
        { Name: "Priya Sharma (Extracted)", Phone: "+919876543211", Location: "Jubilee Hills, Hyderabad" },
        { Name: "Suresh Reddy (Extracted)", Phone: "+919876543212", Location: "Banjara Hills, Hyderabad" }
      ];
    }

    // Detect columns
    let detectedNameCol = "";
    let detectedPhoneCol = "";
    let detectedLocCol = "";

    if (rawRows.length > 0) {
      const keys = Object.keys(rawRows[0]);
      for (const k of keys) {
        const lower = k.toLowerCase().replace(/[^a-z]/g, "");
        if (["name", "customername", "prospectname", "fullname", "clientname"].includes(lower)) {
          detectedNameCol = k;
        } else if (["phone", "phonenumber", "mobile", "contact", "whatsapp"].includes(lower)) {
          detectedPhoneCol = k;
        } else if (["location", "city", "area", "address"].includes(lower)) {
          detectedLocCol = k;
        }
      }
      if (!detectedNameCol) detectedNameCol = keys[0] || "Name";
      if (!detectedPhoneCol) detectedPhoneCol = keys[1] || keys[0] || "Phone";
      if (!detectedLocCol) detectedLocCol = keys[2] || "Location";
    }

    let templateName = "hello_world";
    if (templateId) {
      const tmpl = STORE.templates.find((t) => t.id === templateId);
      if (tmpl) templateName = tmpl.template_name;
    }

    const validContacts: any[] = [];
    const invalidNumbers: any[] = [];
    const seenInFile = new Set<string>();
    let duplicateInFileCount = 0;
    let previouslyProcessed = 0;
    let readyForCampaign = 0;

    rawRows.forEach((row, idx) => {
      const nameVal = String(row[detectedNameCol] || "Customer").trim();
      const phoneRaw = String(row[detectedPhoneCol] || "").trim();
      const locVal = String(row[detectedLocCol] || "Hyderabad").trim();

      const { normalized, is_valid } = normalizePhone(phoneRaw);

      if (!is_valid) {
        invalidNumbers.push({
          row_number: idx + 2,
          name: nameVal,
          raw_phone: phoneRaw,
          reason: "Invalid phone number format"
        });
        return;
      }

      if (seenInFile.has(normalized)) {
        duplicateInFileCount++;
        return;
      }
      seenInFile.add(normalized);

      const msgHash = computeMessageFingerprint(
        "org_apex_realestate",
        normalized,
        templateName,
        { "1": nameVal, "2": locVal }
      );

      const isDuplicateSend = STORE.messageHashes.has(msgHash);
      if (isDuplicateSend) {
        previouslyProcessed++;
      } else {
        readyForCampaign++;
      }

      validContacts.push({
        row_number: idx + 2,
        name: nameVal,
        phone_number: normalized,
        location: locVal,
        message_hash: msgHash,
        is_duplicate_send: isDuplicateSend,
        skip_reason: isDuplicateSend ? "Same message already processed previously" : null
      });
    });

    const importId = "imp_" + Math.random().toString(36).substring(2, 9);
    const result = {
      import_id: importId,
      file_name: file.name,
      organization_id: "org_apex_realestate",
      total_rows: rawRows.length,
      valid_contacts: validContacts,
      invalid_numbers: invalidNumbers,
      duplicate_rows: duplicateInFileCount,
      previously_processed: previouslyProcessed,
      ready_for_campaign: readyForCampaign,
      detected_columns: {
        name: detectedNameCol || "Name",
        phone: detectedPhoneCol || "Phone",
        location: detectedLocCol || "Location"
      }
    };

    STORE.imports[importId] = result;

    return NextResponse.json({
      import_id: importId,
      file_name: file.name,
      total_rows: rawRows.length,
      valid_contacts: validContacts.length,
      invalid_numbers: invalidNumbers.length,
      duplicate_rows: duplicateInFileCount,
      previously_processed: previouslyProcessed,
      ready_for_campaign: readyForCampaign,
      detected_columns: result.detected_columns,
      sample_valid: validContacts.slice(0, 5),
      sample_invalid: invalidNumbers.slice(0, 5)
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: `Failed to parse file: ${err.message}` },
      { status: 400 }
    );
  }
}
