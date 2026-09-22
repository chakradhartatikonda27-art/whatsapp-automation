"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { api } from "@/lib/api";
import { 
  Users, 
  Send, 
  CheckCircle2, 
  TrendingUp, 
  PlusCircle, 
  ArrowRight,
  ShieldCheck,
  Building2
} from "lucide-react";

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [waStatus, setWaStatus] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [cList, status] = await Promise.all([
          api.getCampaigns(),
          api.getWhatsAppStatus()
        ]);
        setCampaigns(cList || []);
        setWaStatus(status);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalContactsSent = campaigns.reduce((acc, c) => acc + (c.sent_count || 0), 0);
  const totalDelivered = campaigns.reduce((acc, c) => acc + (c.delivered_count || 0), 0);
  const deliveryRate = totalContactsSent > 0 ? Math.round((totalDelivered / totalContactsSent) * 100) : 100;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#070a12]">
      <Navigation />
      
      <main className="flex-1 p-4 sm:p-8 pb-24 md:pb-8 overflow-y-auto w-full max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-800/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Dashboard Overview</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Real estate WhatsApp campaign performance & analytics</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
              <span className={`w-2 h-2 rounded-full ${waStatus?.is_connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-400 font-medium hidden sm:inline">WhatsApp API:</span>
              <span className="text-emerald-400 font-semibold capitalize">{waStatus?.provider_mode || "Mock"} Mode</span>
            </div>

            <Link
              href="/campaigns/create"
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 active:scale-95 transition-all ml-auto sm:ml-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Campaign</span>
            </Link>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="glass-card p-4 sm:p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Campaigns</span>
              <div className="p-1.5 sm:p-2 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-100">{loading ? "..." : campaigns.length}</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-2 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Idempotent Protected
            </p>
          </div>

          <div className="glass-card p-4 sm:p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Sent</span>
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-100">{loading ? "..." : totalContactsSent.toLocaleString()}</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-2 truncate">Across bulk campaigns</p>
          </div>

          <div className="glass-card p-4 sm:p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Delivered</span>
              <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-100">{loading ? "..." : totalDelivered.toLocaleString()}</p>
            <p className="text-[10px] sm:text-xs text-emerald-400 mt-2 flex items-center gap-1 truncate">
              <TrendingUp className="w-3 h-3" />
              Meta Webhook Sync
            </p>
          </div>

          <div className="glass-card p-4 sm:p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Delivery Rate</span>
              <div className="p-1.5 sm:p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-100">{loading ? "..." : `${deliveryRate}%`}</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-2 truncate">Target: &gt;95%</p>
          </div>
        </div>

        {/* Recent Campaigns Table */}
        <div className="glass-card rounded-2xl border border-slate-800/80 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-100">Recent Campaigns</h2>
              <p className="text-xs text-slate-400 mt-0.5">Live status and delivery progress</p>
            </div>

            <Link href="/campaigns" className="text-xs font-medium text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="py-12 sm:py-16 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30 p-4">
              <Send className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">No campaigns launched yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Upload your real estate Excel prospect dataset and send your first bulk campaign.
              </p>
              <Link
                href="/campaigns/create"
                className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-slate-950 font-bold text-xs"
              >
                <PlusCircle className="w-4 h-4" />
                Launch Campaign
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left text-sm border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                    <th className="py-3 px-3 sm:px-4">Campaign Name</th>
                    <th className="py-3 px-3 sm:px-4">Status</th>
                    <th className="py-3 px-3 sm:px-4">Recipients</th>
                    <th className="py-3 px-3 sm:px-4">Sent</th>
                    <th className="py-3 px-3 sm:px-4">Delivered</th>
                    <th className="py-3 px-3 sm:px-4">Skipped</th>
                    <th className="py-3 px-3 sm:px-4">Progress</th>
                    <th className="py-3 px-3 sm:px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                  {campaigns.slice(0, 5).map((c) => {
                    const progress = c.total_contacts > 0 ? Math.round(((c.sent_count + c.skipped_count + c.failed_count) / c.total_contacts) * 100) : 0;
                    return (
                      <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 sm:px-4 font-medium text-slate-200">{c.name}</td>
                        <td className="py-3 px-3 sm:px-4">
                          <span className={`status-pill ${
                            c.status === 'COMPLETED' ? 'status-read' :
                            c.status === 'PROCESSING' ? 'status-sent' : 'status-queued'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-slate-300 font-mono text-xs">{c.total_contacts.toLocaleString()}</td>
                        <td className="py-3 px-3 sm:px-4 text-slate-300 font-mono text-xs">{c.sent_count.toLocaleString()}</td>
                        <td className="py-3 px-3 sm:px-4 text-emerald-400 font-mono text-xs">{c.delivered_count.toLocaleString()}</td>
                        <td className="py-3 px-3 sm:px-4 text-amber-400 font-mono text-xs">{c.skipped_count.toLocaleString()}</td>
                        <td className="py-3 px-3 sm:px-4 w-36">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-brand-600 to-emerald-400 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">{progress}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-right">
                          <Link
                            href={`/campaigns/${c.id}`}
                            className="text-xs font-semibold text-brand-400 hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* V2 Product Roadmap Showcase: Shared WhatsApp Inbox & Sales CRM */}
        <div className="glass-card p-6 rounded-2xl border border-indigo-500/20 bg-indigo-950/10 space-y-4 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-500/20">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider">
                Product Roadmap V2 Preview
              </span>
              <h3 className="text-base font-bold text-slate-100 mt-1">Shared WhatsApp Inbox & Sales CRM Pipeline</h3>
            </div>
            <span className="text-xs text-indigo-400 font-semibold">Coming in V2 Upgrade 🚀</span>
          </div>

          <p className="text-xs text-slate-400">
            Transform customer replies from WhatsApp campaigns into active sales opportunities with automated lead stages and team assignment.
          </p>

          {/* CRM Pipeline Visualizer */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs pt-2">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono">STAGE 1</span>
              <p className="font-bold text-slate-200">New Lead</p>
              <span className="text-[10px] text-brand-400 font-mono">14 Leads</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono">STAGE 2</span>
              <p className="font-bold text-blue-300">Interested</p>
              <span className="text-[10px] text-blue-400 font-mono">8 Leads</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono">STAGE 3</span>
              <p className="font-bold text-indigo-300">Site Visit</p>
              <span className="text-[10px] text-indigo-400 font-mono">5 Leads</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono">STAGE 4</span>
              <p className="font-bold text-purple-300">Negotiation</p>
              <span className="text-[10px] text-purple-400 font-mono">3 Leads</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-emerald-400 font-mono">STAGE 5</span>
              <p className="font-bold text-emerald-300">Booked ✓</p>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">2 Units</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
