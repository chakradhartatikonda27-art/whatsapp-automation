import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { STORE, computeMessageFingerprint, normalizePhone } from "@/lib/db";

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
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

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
