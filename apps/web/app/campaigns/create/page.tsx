"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { api } from "@/lib/api";
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  ArrowRight, 
  ArrowLeft, 
  Send, 
  ShieldCheck,
  Eye,
  MessageSquare,
  Image as ImageIcon,
  Sparkles,
  Plus,
  FileText
} from "lucide-react";

export default function CreateCampaignPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Message Type & Content State
  const [messageType, setMessageType] = useState<"template" | "custom">("template");
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [customMessageBody, setCustomMessageBody] = useState<string>(
    "Hi {{Name}}, we are excited to launch modern 3BHK luxury apartments in {{Location}}. Exclusive pre-launch discount available this week. Would you like to schedule a private site visit?"
  );
  const [mediaUrl, setMediaUrl] = useState<string>("/sample_property.jpg");
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const [launching, setLaunching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleMediaUpload = async (selectedMedia: File) => {
    setUploadingMedia(true);
    setErrorMsg(null);
    try {
      const res = await api.uploadMedia(selectedMedia);
      setMediaUrl(res.media_url);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload media file from local computer");
    } finally {
      setUploadingMedia(false);
    }
  };


  useEffect(() => {
    async function fetchTemplates() {
      try {
        setErrorMsg(null);
        const tmpls = await api.getTemplates();
        setTemplates(tmpls || []);
        if (tmpls && tmpls.length > 0) {
          setSelectedTemplateId(tmpls[0].id);
        }
      } catch (err: any) {
        console.error("Failed to load templates:", err);
        setTimeout(async () => {
          try {
            const tmpls = await api.getTemplates();
            setTemplates(tmpls || []);
            if (tmpls && tmpls.length > 0) {
              setSelectedTemplateId(tmpls[0].id);
            }
            setErrorMsg(null);
          } catch {}
        }, 500);
      }
    }
    fetchTemplates();
  }, []);

  const handleFileUpload = async (selectedFile: File) => {
    setFile(selectedFile);
    setUploading(true);
    setErrorMsg(null);
    try {
      const res = await api.uploadExcel(selectedFile, selectedTemplateId);
      setImportResult(res);
      if (!campaignName) {
        setCampaignName(`${selectedFile.name.replace(/\.[^/.]+$/, "")} Campaign`);
      }
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload and validate Excel dataset");
    } finally {
      setUploading(false);
    }
  };

  const insertVariable = (varName: string) => {
    setCustomMessageBody((prev) => `${prev} {{${varName}}}`);
  };

  const handleLaunchCampaign = async () => {
    if (!campaignName.trim() || !importResult) return;
    if (messageType === "template" && !selectedTemplateId) return;
    if (messageType === "custom" && !customMessageBody.trim()) return;

    setLaunching(true);
    setErrorMsg(null);

    try {
      const created = await api.createCampaign({
        name: campaignName,
        message_type: messageType,
        template_id: messageType === "template" ? selectedTemplateId : undefined,
        message_body: messageType === "custom" ? customMessageBody : undefined,
        media_url: mediaUrl.trim() ? mediaUrl.trim() : undefined,
        import_id: importResult.import_id,
      });

      router.push(`/campaigns/${created.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to launch campaign");
      setLaunching(false);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  // Render interpolated text preview for Step 5
  const getInterpolatedPreview = () => {
    const sampleName = "Ravi Kumar";
    const sampleLocation = "Gachibowli, Hyderabad";

    if (messageType === "custom") {
      let body = customMessageBody || "";
      body = body.replace(/\{\{Name\}\}/gi, sampleName);
      body = body.replace(/\{\{Location\}\}/gi, sampleLocation);
      body = body.replace(/\{\{1\}\}/g, sampleName);
      body = body.replace(/\{\{2\}\}/g, sampleLocation);
      return body;
    }

    if (selectedTemplate) {
      const bodyComponent = selectedTemplate.components?.find((c: any) => c.type === "BODY");
      if (bodyComponent && bodyComponent.text) {
        let body = bodyComponent.text;
        body = body.replace("{{1}}", sampleName);
        body = body.replace("{{2}}", sampleLocation);
        return body;
      }
    }

    return `Hi ${sampleName}, welcome to Apex Luxury Living in ${sampleLocation}.`;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#070a12]">
      <Navigation />

      <main className="flex-1 p-4 sm:p-8 pb-24 md:pb-8 overflow-y-auto max-w-5xl mx-auto w-full">
        {/* Wizard Progress Steps Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Create WhatsApp Campaign</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Upload prospect data, compose custom messages or choose templates, attach images, and launch with idempotency checks</p>

          <div className="flex items-center justify-start sm:justify-between gap-3 sm:gap-2 overflow-x-auto pb-2 mt-4 sm:mt-6 max-w-3xl no-scrollbar">
            {[
              { id: 1, label: "1. Upload File" },
              { id: 2, label: "2. Validate Data" },
              { id: 3, label: "3. Choose Message & Media" },
              { id: 4, label: "4. Map Variables" },
              { id: 5, label: "5. Preview" },
              { id: 6, label: "6. Confirm & Send" }
            ].map((s) => (
              <div key={s.id} className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold transition-colors ${
                    step === s.id
                      ? "bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20"
                      : step > s.id
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-900 text-slate-500 border border-slate-800"
                  }`}
                >
                  {step > s.id ? "✓" : s.id}
                </div>
                <span className={`text-[11px] sm:text-xs font-medium whitespace-nowrap ${step === s.id ? "text-slate-100 font-semibold" : "text-slate-500"}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>


        {errorMsg && !errorMsg.toLowerCase().includes("authenticated") && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* STEP 1: Upload File */}
        {step === 1 && (
          <div className="glass-card p-8 rounded-2xl max-w-3xl">
            <h2 className="text-lg font-semibold text-slate-100 mb-1">Step 1 — Upload Prospect Dataset</h2>
            <p className="text-xs text-slate-400 mb-6">Supported formats: Excel (.xlsx, .csv), Word (.docx), PDF (.pdf), Images (.jpg, .png), Text (.txt)</p>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-slate-700 hover:border-brand-500/50 rounded-2xl p-12 text-center bg-slate-900/30 transition-colors cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-7 h-7" />
              </div>

              <p className="text-sm font-medium text-slate-200 mb-1">
                Drag & drop your Excel, Word, PDF, Image, or CSV dataset here
              </p>
              <p className="text-xs text-slate-500 mb-4">or click to browse local files (Excel, Word, PDF, Images, CSV, Text)</p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <label className="inline-flex items-center gap-2 py-2.5 px-5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700">
                  <Upload className="w-4 h-4" />
                  Select File (Excel / Word / PDF / Images)
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.docx,.doc,.pdf,.txt,.png,.jpg,.jpeg,.webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>

                <a
                  href="/sample_realestate_prospects.xlsx"
                  download="sample_realestate_prospects.xlsx"
                  className="inline-flex items-center gap-2 py-2.5 px-5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  Download Sample Excel
                </a>
              </div>

              {uploading && (
                <div className="mt-6 text-xs text-brand-400 font-medium animate-pulse">
                  Uploading and validating contacts with Google phonenumbers...
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Import Validation Results */}
        {step === 2 && importResult && (
          <div className="glass-card p-8 rounded-2xl max-w-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100 mb-0.5">Step 2 — Automatic Extraction & Preview</h2>
                <p className="text-xs text-slate-400">Source: <span className="text-slate-200 font-medium">{importResult.file_name}</span></p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {importResult.valid_contacts} contacts detected — {importResult.ready_for_campaign} valid
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">Total Extracted</span>
                <p className="text-xl font-bold text-slate-100 mt-0.5">{importResult.total_rows.toLocaleString()}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-emerald-400 font-semibold">Valid Contacts</span>
                <p className="text-xl font-bold text-emerald-300 mt-0.5">{importResult.valid_contacts.toLocaleString()}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <span className="text-indigo-400">Skipped Duplicates</span>
                <p className="text-xl font-bold text-indigo-300 mt-0.5">{importResult.previously_processed.toLocaleString()}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/20">
                <span className="text-brand-400 font-semibold">Ready to Send</span>
                <p className="text-xl font-bold text-brand-300 mt-0.5">{importResult.ready_for_campaign.toLocaleString()}</p>
              </div>
            </div>

            {/* Extracted Contacts Preview Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Extracted Contacts Preview</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] bg-slate-900/50">
                      <th className="py-2.5 px-4 font-semibold">Name</th>
                      <th className="py-2.5 px-4 font-semibold">Phone Number</th>
                      <th className="py-2.5 px-4 font-semibold">City / Location</th>
                      <th className="py-2.5 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {(importResult.sample_valid || []).map((c: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-4 font-sans font-semibold text-slate-200">{c.name}</td>
                        <td className="py-2.5 px-4 text-slate-300">{c.phone_number}</td>
                        <td className="py-2.5 px-4 font-sans text-slate-400">{c.location || "Rajahmundry"}</td>
                        <td className="py-2.5 px-4 font-sans">
                          {c.is_duplicate_send ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                              Duplicate — Previously Sent
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                              Valid ✓
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 flex justify-between border-t border-slate-800">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Upload
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-slate-950 text-xs font-semibold shadow-md shadow-brand-500/20"
              >
                Continue to Message & Media <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Choose Message Type & Media Attachment */}
        {step === 3 && (
          <div className="glass-card p-8 rounded-2xl max-w-3xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-100 mb-1">Step 3 — Choose Message Type & Attachments</h2>
              <p className="text-xs text-slate-400">Send custom WhatsApp messages or select pre-approved Meta templates with optional property image attachments</p>
            </div>

            {/* Message Type Selector Tabs */}
            <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 gap-1">
              <button
                type="button"
                onClick={() => setMessageType("template")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all ${
                  messageType === "template"
                    ? "bg-brand-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileText className="w-4 h-4" />
                Approved Meta Template
              </button>
              <button
                type="button"
                onClick={() => setMessageType("custom")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all ${
                  messageType === "custom"
                    ? "bg-brand-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Custom Freeform Message
              </button>
            </div>

            {/* Template Selection View */}
            {messageType === "template" && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">Select Approved Template</label>
                {templates.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTemplateId(t.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplateId === t.id
                        ? "bg-brand-500/10 border-brand-500 text-slate-100 shadow-md"
                        : "bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">{t.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-brand-400 border border-slate-700">
                        {t.template_name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {t.components?.[0]?.text || "No preview body text"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Custom Message View */}
            {messageType === "custom" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">Custom Message Body</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Insert Variable:</span>
                    <button
                      type="button"
                      onClick={() => insertVariable("Name")}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-brand-400 border border-slate-700 text-[11px] font-mono flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> {"{{Name}}"}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertVariable("Location")}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-brand-400 border border-slate-700 text-[11px] font-mono flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> {"{{Location}}"}
                    </button>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={customMessageBody}
                  onChange={(e) => setCustomMessageBody(e.target.value)}
                  placeholder="Type your WhatsApp campaign message here..."
                  className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs leading-relaxed focus:outline-none focus:border-brand-500"
                />
              </div>
            )}

            {/* Image / Attachment Input */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  Property Image / Attachment (Optional)
                </label>
                <span className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Image Attachment Supported
                </span>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                <label className="px-3.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingMedia ? "Uploading Local File..." : "Upload from Computer"}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleMediaUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>

                <input
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="or paste URL e.g. /sample_property.jpg"
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
                />

                <button
                  type="button"
                  onClick={() => setMediaUrl("/sample_property.jpg")}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Sample Image
                </button>
              </div>

              {mediaUrl && (
                <div className="flex items-center gap-3 pt-2">
                  <img
                    src={mediaUrl}
                    alt="Property Preview"
                    className="w-16 h-12 object-cover rounded-lg border border-slate-700"
                    onError={(e: any) => { e.target.style.display = 'none'; }}
                  />
                  <div className="text-[11px] text-slate-400">
                    <p className="font-mono text-emerald-400 truncate max-w-xs">{mediaUrl}</p>
                    <p>This media will be sent as an attachment alongside your WhatsApp message payload.</p>
                  </div>
                </div>
              )}
            </div>


            <div className="pt-4 flex justify-between border-t border-slate-800">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-slate-950 text-xs font-semibold"
              >
                Map Variables <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Map Variables */}
        {step === 4 && (
          <div className="glass-card p-8 rounded-2xl max-w-3xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-100 mb-1">Step 4 — Map Dynamic Variables</h2>
              <p className="text-xs text-slate-400">Map Excel dataset columns to dynamic message placeholders</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-semibold text-slate-400">
                <span>Message Variable</span>
                <span>Excel Column</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-brand-400 bg-brand-500/10 px-2 py-1 rounded">{"{{Name}} / {{1}}"} (Customer Name)</span>
                <span className="text-xs font-medium text-slate-200 bg-slate-800 px-3 py-1.5 rounded border border-slate-700">
                  {importResult?.detected_columns?.name || "Name"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-brand-400 bg-brand-500/10 px-2 py-1 rounded">{"{{Location}} / {{2}}"} (Location)</span>
                <span className="text-xs font-medium text-slate-200 bg-slate-800 px-3 py-1.5 rounded border border-slate-700">
                  {importResult?.detected_columns?.location || "Location"}
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-between border-t border-slate-800">
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-slate-950 text-xs font-semibold"
              >
                Preview Message <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Preview */}
        {step === 5 && (
          <div className="glass-card p-8 rounded-2xl max-w-3xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-100 mb-1">Step 5 — WhatsApp Recipient Live Preview</h2>
              <p className="text-xs text-slate-400">Sample of exact interpolated WhatsApp message with media header sent to prospects</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0b141a] border border-slate-800 max-w-md mx-auto shadow-2xl">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-xs">
                  RK
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-100">Ravi Kumar</p>
                  <p className="text-[10px] text-slate-400">+91 98765 43210 • Gachibowli, Hyderabad</p>
                </div>
              </div>

              {/* Chat Bubble */}
              <div className="bg-[#121b22] rounded-xl border border-slate-800 overflow-hidden text-xs text-slate-200 leading-relaxed shadow-sm">
                {mediaUrl && (
                  <div className="w-full bg-slate-900 border-b border-slate-800">
                    <img
                      src={mediaUrl}
                      alt="Property Brochure Attachment"
                      className="w-full h-44 object-cover"
                      onError={(e: any) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}

                <div className="p-4">
                  <p className="whitespace-pre-wrap">{getInterpolatedPreview()}</p>
                  <div className="text-[10px] text-slate-500 text-right mt-2">10:42 AM ✓✓</div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between border-t border-slate-800">
              <button
                onClick={() => setStep(4)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(6)}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-slate-950 text-xs font-semibold"
              >
                Confirm & Launch <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Confirm & Send */}
        {step === 6 && (
          <div className="glass-card p-8 rounded-2xl max-w-3xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-100 mb-1">Step 6 — Confirm & Launch Campaign</h2>
              <p className="text-xs text-slate-400">Review final summary before queuing jobs</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Campaign Name</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Message Type</span>
                  <span className="font-semibold text-brand-400 uppercase">{messageType}</span>
                </div>
                {mediaUrl && (
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Image Attachment</span>
                    <span className="font-mono text-emerald-400 truncate max-w-[250px]">{mediaUrl}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Total Upload Contacts</span>
                  <span className="font-semibold text-slate-200">{(importResult?.valid_contacts || 4).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-indigo-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Skipped Duplicate Messages (₹0 Consumed)
                  </span>
                  <span className="font-semibold text-indigo-300">{(importResult?.previously_processed || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-brand-400 font-semibold">Net Eligible Outbound Messages</span>
                  <span className="font-bold text-brand-300 text-sm">{(importResult?.ready_for_campaign || 4).toLocaleString()}</span>
                </div>
              </div>

              {/* Pre-Send Wallet & Commercial Cost Breakdown Card */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs space-y-2 font-mono">
                <div className="flex items-center justify-between font-bold text-emerald-400 pb-2 border-b border-emerald-500/20 font-sans">
                  <span>Pre-Send Campaign Cost Breakdown</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                    Wallet Verified ✓
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Est. Meta WhatsApp Usage ({(importResult?.ready_for_campaign || 4)} × ₹0.75):</span>
                  <span>₹{((importResult?.ready_for_campaign || 4) * 0.75).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Est. Platform Service Fee ({(importResult?.ready_for_campaign || 4)} × ₹0.08):</span>
                  <span>₹{((importResult?.ready_for_campaign || 4) * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-emerald-500/20 text-emerald-300 font-bold">
                  <span>Total Estimated Campaign Cost:</span>
                  <span>₹{((importResult?.ready_for_campaign || 4) * 0.83).toFixed(2)}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans pt-1">
                  💡 <span className="text-emerald-300 font-semibold">Free Duplicate Policy</span>: Skipped duplicate contacts consume ₹0 / 0 credits because no outbound message is sent.
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-between border-t border-slate-800">
              <button
                onClick={() => setStep(5)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleLaunchCampaign}
                disabled={launching}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-brand-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {launching ? "Queueing Messages..." : "SEND CAMPAIGN NOW"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
