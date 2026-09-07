"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { api } from "@/lib/api";
import { Send, PlusCircle, Search, ArrowRight, RefreshCw, ShieldCheck } from "lucide-react";

export default function CampaignsListPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const res = await api.getCampaigns();
        setCampaigns(res || []);
      } catch (err) {
        console.error("Failed to load campaigns:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCampaigns();

    const interval = setInterval(loadCampaigns, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#070a12]">
      <Navigation />

      <main className="flex-1 p-4 sm:p-8 pb-24 md:pb-8 overflow-y-auto w-full max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">WhatsApp Campaigns</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage bulk messaging campaigns and track execution progress</p>
          </div>

          <Link
            href="/campaigns/create"
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 transition-all ml-auto sm:ml-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Campaign</span>
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "PROCESSING", "COMPLETED", "PAUSED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaign name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-800">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading campaigns...</div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="py-12 sm:py-16 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30 p-4">
              <Send className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">No campaigns found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                No campaigns match the selected search or filter status.
              </p>
              <Link
                href="/campaigns/create"
                className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-brand-600 text-slate-950 font-bold text-xs"
              >
                <PlusCircle className="w-4 h-4" /> Launch New Campaign
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left text-sm border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                    <th className="py-3 px-3 sm:px-4">Campaign Name</th>
                    <th className="py-3 px-3 sm:px-4">Status</th>
                    <th className="py-3 px-3 sm:px-4">Total Contacts</th>
                    <th className="py-3 px-3 sm:px-4">Sent</th>
                    <th className="py-3 px-3 sm:px-4">Delivered</th>
                    <th className="py-3 px-3 sm:px-4">Skipped</th>
                    <th className="py-3 px-3 sm:px-4">Progress</th>
                    <th className="py-3 px-3 sm:px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                  {filteredCampaigns.map((c) => {
                    const progress = c.total_contacts > 0
                      ? Math.round(((c.sent_count + c.skipped_count + c.failed_count) / c.total_contacts) * 100)
                      : 0;

                    return (
                      <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 sm:px-4 font-medium text-slate-200">
                          {c.name}
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">{new Date(c.created_at).toLocaleString()}</p>
                        </td>
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
                            className="text-xs font-semibold text-brand-400 hover:underline inline-flex items-center gap-1"
                          >
                            Details <ArrowRight className="w-3.5 h-3.5" />
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
      </main>
    </div>
  );
}
