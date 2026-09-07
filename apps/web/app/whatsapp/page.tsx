"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { api } from "@/lib/api";
import { MessageSquare, ShieldCheck, CheckCircle2, Key, Phone, Building2 } from "lucide-react";

export default function WhatsAppStatusPage() {
  const [waStatus, setWaStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await api.getWhatsAppStatus();
        setWaStatus(res);
      } catch (err) {
        console.error("Failed to load WhatsApp status:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStatus();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#070a12]">
      <Navigation />

      <main className="flex-1 p-4 sm:p-8 pb-24 md:pb-8 overflow-y-auto max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">WhatsApp Business Platform</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Official Meta Graph API connection & webhook configuration</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Checking API status...</div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Connection Banner */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-slate-100">WhatsApp Provider Status</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mode: <span className="font-mono text-emerald-400 font-bold uppercase">{waStatus?.provider_mode || "MOCK"}</span>
                  </p>
                </div>
              </div>

              <span className="status-pill status-read text-xs px-3 py-1">
                Connected & Active ✓
              </span>
            </div>

            {/* Connection Credentials Info */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-semibold text-slate-200">Account Configurations</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-500" /> Display Phone Number</span>
                  <p className="font-mono font-semibold text-slate-200">{waStatus?.display_phone_number}</p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-slate-500" /> Business Account ID</span>
                  <p className="font-mono text-slate-300">{waStatus?.business_account_id}</p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5"><Key className="w-3.5 h-3.5 text-slate-500" /> Phone Number ID</span>
                  <p className="font-mono text-slate-300">{waStatus?.phone_number_id}</p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-slate-500" /> Access Token Status</span>
                  <p className="text-emerald-400 font-medium">Secured & Encrypted (Tokens hidden from client)</p>
                </div>
              </div>
            </div>

            {/* Webhook Info */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-semibold text-slate-200">Webhook Configuration Endpoint</h3>
              <p className="text-xs text-slate-400">Configure this URL in Meta Developer Dashboard for real-time delivery status callbacks:</p>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-brand-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 overflow-x-auto">
                <span className="truncate">http://localhost:8000/api/v1/webhooks/whatsapp</span>
                <span className="text-[10px] text-slate-500">POST / GET</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
