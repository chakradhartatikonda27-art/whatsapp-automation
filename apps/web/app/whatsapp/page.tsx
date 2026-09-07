"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { api } from "@/lib/api";
import { 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2, 
  Key, 
  Phone, 
  Building2, 
  Zap, 
  Server, 
  Save, 
  Lock, 
  ExternalLink,
  Info,
  Copy,
  Check
} from "lucide-react";

export default function WhatsAppStatusPage() {
  const [waStatus, setWaStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form State
  const [mode, setMode] = useState<"DEMO" | "LIVE">("DEMO");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [displayPhone, setDisplayPhone] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [verifyToken, setVerifyToken] = useState("apex_realestate_verify_secret");
  const [toastMsg, setToastMsg] = useState("");

  const webhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/v1/webhooks/whatsapp`
    : "https://whatsapp-realestate-platform.vercel.app/api/v1/webhooks/whatsapp";

  async function loadStatus() {
    try {
      const statusRes = await api.getWhatsAppStatus();
      setWaStatus(statusRes);
      setMode(statusRes.mode || "DEMO");
      setPhoneNumberId(statusRes.phone_number_id || "");
      setBusinessAccountId(statusRes.business_account_id || "");
      setDisplayPhone(statusRes.display_phone_number || "");
      setVerifyToken(statusRes.verify_token || "apex_realestate_verify_secret");
    } catch (err) {
      console.error("Failed to load WhatsApp status:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  const handleSaveConfig = async (newMode?: "DEMO" | "LIVE") => {
    setSaving(true);
    const targetMode = newMode || mode;
    try {
      const res = await api.updateWhatsAppConfig({
        mode: targetMode,
        phone_number_id: phoneNumberId,
        business_account_id: businessAccountId,
        display_phone_number: displayPhone,
        access_token: accessToken,
        verify_token: verifyToken
      });
      setMode(targetMode);
      setToastMsg(targetMode === "LIVE" ? "Live Meta WhatsApp API Mode Activated!" : "Switched to Demo Sandbox Mode");
      setTimeout(() => setToastMsg(""), 4000);
      await loadStatus();
    } catch (err: any) {
      alert("Failed to update configuration: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#070a12]">
      <Navigation />

      <main className="flex-1 p-4 sm:p-8 pb-24 md:pb-8 overflow-y-auto max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-brand-400" /> WhatsApp Integration Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Switch seamlessly between simulated Demo Sandbox and official Meta Cloud API
            </p>
          </div>

          {/* Mode Switcher Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => {
                setMode("DEMO");
                handleSaveConfig("DEMO");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === "DEMO"
                  ? "bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Demo Sandbox
            </button>
            <button
              onClick={() => {
                setMode("LIVE");
                handleSaveConfig("LIVE");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === "LIVE"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Server className="w-3.5 h-3.5" /> Live Meta API
            </button>
          </div>
        </div>

        {toastMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {toastMsg}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading WhatsApp configuration...</div>
        ) : (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`glass-card p-5 rounded-2xl border transition-all ${
              mode === "LIVE"
                ? "border-emerald-500/30 bg-emerald-950/10"
                : "border-brand-500/30 bg-brand-950/10"
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${
                    mode === "LIVE"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-brand-500/10 text-brand-400 border-brand-500/20"
                  }`}>
                    {mode === "LIVE" ? <Server className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-100">
                        {mode === "LIVE" ? "Live Meta WhatsApp Cloud API" : "Simulated Demo Sandbox"}
                      </h2>
                      <span className={`status-pill ${mode === "LIVE" ? "status-read" : "status-sent"}`}>
                        {mode === "LIVE" ? (waStatus?.has_access_token ? "LIVE CONNECTED" : "AWAITING API TOKEN") : "ACTIVE DEMO"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {mode === "LIVE"
                        ? "Outbound messages are sent directly to real WhatsApp users via Meta Graph API v19.0."
                        : "Dispatches simulated campaigns instantly with simulated wamid IDs and SHA-256 duplicate protection."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mode 1: DEMO SANDBOX INFO */}
            {mode === "DEMO" && (
              <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
                  <Info className="w-4 h-4 text-brand-400" /> Demo Sandbox Mode Overview
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In Demo Sandbox mode, you can test prospect Excel uploads, custom messaging, image attachments, variable interpolation, and 100% duplicate protection risk-free without linking a Meta developer account.
                </p>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Simulated Phone Number:</span>
                    <span className="font-mono text-brand-400 font-semibold">{waStatus?.display_phone_number}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Test Recipient Coverage:</span>
                    <span className="text-slate-400">All International E.164 Phone Numbers</span>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setMode("LIVE")}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    Switch to Live Meta Cloud API Setup →
                  </button>
                </div>
              </div>
            )}

            {/* Mode 2: LIVE META API CREDENTIALS FORM */}
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-400" /> Meta WhatsApp Cloud API Credentials
                </h3>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-500" /> AES Encrypted Storage
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Phone Number ID */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium flex items-center gap-1">
                    Phone Number ID <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 102938475610293"
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500">Found in Meta Developer Portal &gt; WhatsApp &gt; API Setup</p>
                </div>

                {/* Business Account ID */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">WhatsApp Business Account ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 987654321098765"
                    value={businessAccountId}
                    onChange={(e) => setBusinessAccountId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500">Your Meta WABA ID</p>
                </div>

                {/* Display Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Display Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={displayPhone}
                    onChange={(e) => setDisplayPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Webhook Verification Token */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Webhook Verification Secret Token</label>
                  <input
                    type="text"
                    placeholder="apex_realestate_verify_secret"
                    value={verifyToken}
                    onChange={(e) => setVerifyToken(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Access Token */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-slate-300 font-medium flex items-center justify-between">
                    <span>Meta Permanent Access Token (System User Bearer Token) <span className="text-rose-400">*</span></span>
                    {waStatus?.has_access_token && (
                      <span className="text-emerald-400 text-[10px] flex items-center gap-1 font-normal">
                        <CheckCircle2 className="w-3 h-3" /> Token Configured
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    placeholder="EAAG..."
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500">
                    Create a System User in Meta Business Manager and grant permissions: <code className="text-brand-400">whatsapp_business_messaging</code> & <code className="text-brand-400">whatsapp_business_management</code>.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleSaveConfig("LIVE")}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving Credentials..." : "Save Credentials & Activate Live Mode"}
                </button>
              </div>
            </div>

            {/* Webhook Endpoint Info */}
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Meta Real-Time Webhook Callback URL
              </h3>
              <p className="text-xs text-slate-400">
                Paste this Webhook Callback URL into Meta Developer Dashboard &gt; WhatsApp &gt; Configuration to receive real-time delivery status (`DELIVERED`, `READ`, `FAILED`):
              </p>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 overflow-hidden">
                <code className="text-xs font-mono text-emerald-400 truncate">{webhookUrl}</code>
                <button
                  onClick={copyWebhookUrl}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy Webhook URL"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
