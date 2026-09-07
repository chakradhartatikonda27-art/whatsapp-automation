"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { api } from "@/lib/api";
import { FileText, CheckCircle2, ShieldCheck, Tag } from "lucide-react";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await api.getTemplates();
        setTemplates(res || []);
      } catch (err) {
        console.error("Failed to load templates:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTemplates();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#070a12]">
      <Navigation />

      <main className="flex-1 p-4 sm:p-8 pb-24 md:pb-8 overflow-y-auto w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">WhatsApp Approved Templates</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Official Meta WhatsApp Graph API approved message templates</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading approved templates...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {templates.map((t) => (
              <div key={t.id} className="glass-card p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 text-brand-400 border border-slate-800">
                    {t.template_name}
                  </span>
                  <span className="status-pill status-read flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {t.status}
                  </span>
                </div>

                <h3 className="font-semibold text-slate-100 text-sm">{t.name}</h3>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                  {t.components?.[0]?.text || "No preview content"}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3 text-slate-500" /> {t.category}</span>
                  <span className="font-mono text-slate-500">Language: {t.language}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
