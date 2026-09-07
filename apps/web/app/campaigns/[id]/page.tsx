"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { api } from "@/lib/api";
import { 
  ArrowLeft, 
  Pause, 
  Play, 
  XCircle, 
  Download, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Send, 
  Eye, 
  AlertTriangle,
  ShieldCheck
} from "lucide-react";

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<any>(null);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  async function loadData() {
    try {
      const [cData, rData] = await Promise.all([
        api.getCampaign(campaignId),
        api.getCampaignRecipients(campaignId, statusFilter, searchQuery)
      ]);
      setCampaign(cData);
      setRecipients(rData || []);
    } catch (err) {
      console.error("Failed to load campaign detail:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [campaignId, statusFilter, searchQuery]);

  useEffect(() => {
    if (!campaign || campaign.status !== "PROCESSING") return;

    const totalToProcess = campaign.total_contacts - (campaign.skipped_count || 0);
    if (totalToProcess <= 0) {
      setCampaign((prev: any) => ({ ...prev, status: "COMPLETED" }));
      return;
    }

    const timer = setInterval(() => {
      setCampaign((prev: any) => {
        if (!prev || prev.status !== "PROCESSING") return prev;

        const currentSent = prev.sent_count || 0;
        if (currentSent >= totalToProcess) {
          clearInterval(timer);
          return {
            ...prev,
            status: "COMPLETED",
            queued_count: 0,
            sent_count: totalToProcess,
            delivered_count: totalToProcess,
            read_count: Math.max(0, totalToProcess - 1)
          };
        }

        const nextSent = currentSent + 1;
        const nextQueued = Math.max(0, totalToProcess - nextSent);

        return {
          ...prev,
          sent_count: nextSent,
          delivered_count: nextSent,
          read_count: Math.max(0, nextSent - 1),
          queued_count: nextQueued
        };
      });
    }, 700);

    return () => clearInterval(timer);
  }, [campaign?.id, campaign?.status]);

  const handlePause = async () => {
    setActionLoading(true);
    await api.pauseCampaign(campaignId);
    await loadData();
    setActionLoading(false);
  };

  const handleResume = async () => {
    setActionLoading(true);
    await api.resumeCampaign(campaignId);
    await loadData();
    setActionLoading(false);
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel remaining queued messages?")) return;
    setActionLoading(true);
    await api.cancelCampaign(campaignId);
    await loadData();
    setActionLoading(false);
  };

  if (loading && !campaign) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-[#070a12]">
        <Navigation />
        <main className="flex-1 p-8 flex items-center justify-center text-slate-400">
          Loading campaign details...
        </main>
      </div>
    );
  }

  const progressPct = campaign.total_contacts > 0
    ? Math.round(((campaign.sent_count + campaign.skipped_count + campaign.failed_count) / campaign.total_contacts) * 100)
    : 0;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#070a12]">
      <Navigation />

      <main className="flex-1 p-4 sm:p-8 pb-24 md:pb-8 overflow-y-auto w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Link
              href="/campaigns"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-slate-100">{campaign.name}</h1>
                <span className={`status-pill ${
                  campaign.status === 'COMPLETED' ? 'status-read' :
                  campaign.status === 'PROCESSING' ? 'status-sent' : 'status-queued'
                }`}>
                  {campaign.status}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1">ID: <span className="font-mono">{campaign.id}</span></p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {campaign.status === "PROCESSING" && (
              <button
                onClick={handlePause}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold hover:bg-amber-500/20"
              >
                <Pause className="w-3.5 h-3.5" /> Pause
              </button>
            )}

            {campaign.status === "PAUSED" && (
              <button
                onClick={handleResume}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20"
              >
                <Play className="w-3.5 h-3.5" /> Resume
              </button>
            )}

            {(campaign.status === "PROCESSING" || campaign.status === "PAUSED") && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold hover:bg-rose-500/20"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel
              </button>
            )}

            <button
              onClick={() => {
                const csv = "Name,Phone,Status,SkipReason\n" + recipients.map(r => `"${r.name}","${r.phone_number}","${r.status}","${r.skip_reason||''}"`).join("\n");
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `campaign_${campaign.id}_report.csv`;
                a.click();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" /> Export Report
            </button>
          </div>
        </div>

        {/* Live Execution Progress Bar */}
        <div className="glass-card p-4 sm:p-6 rounded-2xl mb-6 sm:mb-8 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-200">Processing Progress</span>
              {campaign.status === "PROCESSING" && (
                <span className="flex items-center gap-1.5 text-[11px] text-brand-400 font-mono">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Live
                </span>
              )}
            </div>
            <span className="text-xs sm:text-sm font-mono font-bold text-slate-100">{progressPct}%</span>
          </div>

          <div className="h-3 rounded-full bg-slate-900 overflow-hidden mb-4 p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-600 via-emerald-400 to-teal-300 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 text-center pt-2 border-t border-slate-800/60">
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/60">
              <span className="text-[10px] text-slate-400">Total</span>
              <p className="text-base sm:text-lg font-bold text-slate-100 mt-0.5">{campaign.total_contacts.toLocaleString()}</p>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/10">
              <span className="text-[10px] text-blue-400">Queued</span>
              <p className="text-base sm:text-lg font-bold text-blue-300 mt-0.5">{campaign.queued_count.toLocaleString()}</p>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-500/10">
              <span className="text-[10px] text-indigo-400">Sent</span>
              <p className="text-base sm:text-lg font-bold text-indigo-300 mt-0.5">{campaign.sent_count.toLocaleString()}</p>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10">
              <span className="text-[10px] text-emerald-400">Delivered</span>
              <p className="text-base sm:text-lg font-bold text-emerald-300 mt-0.5">{campaign.delivered_count.toLocaleString()}</p>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10">
              <span className="text-[10px] text-amber-400">Skipped</span>
              <p className="text-base sm:text-lg font-bold text-amber-300 mt-0.5">{campaign.skipped_count.toLocaleString()}</p>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-rose-500/10">
              <span className="text-[10px] text-rose-400">Failed</span>
              <p className="text-base sm:text-lg font-bold text-rose-300 mt-0.5">{campaign.failed_count.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Recipients Table */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-800">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-6">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["ALL", "QUEUED", "SENT", "DELIVERED", "READ", "SKIPPED", "FAILED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-colors ${
                    statusFilter === st
                      ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-3 sm:px-4">Contact Name</th>
                  <th className="py-3 px-3 sm:px-4">Phone Number</th>
                  <th className="py-3 px-3 sm:px-4">Location</th>
                  <th className="py-3 px-3 sm:px-4">Status</th>
                  <th className="py-3 px-3 sm:px-4">WhatsApp Message ID</th>
                  <th className="py-3 px-3 sm:px-4">Details / Skip Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                {recipients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-500">
                      No recipients matching current filter
                    </td>
                  </tr>
                ) : (
                  recipients.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 sm:px-4 font-medium text-slate-200">{r.name}</td>
                      <td className="py-3 px-3 sm:px-4 font-mono text-slate-300 text-xs">{r.phone_number}</td>
                      <td className="py-3 px-3 sm:px-4 text-slate-400 text-xs">{r.location || "—"}</td>
                      <td className="py-3 px-3 sm:px-4">
                        <span className={`status-pill ${
                          r.status === 'DELIVERED' || r.status === 'READ' ? 'status-read' :
                          r.status === 'SENT' ? 'status-sent' :
                          r.status === 'SKIPPED' ? 'status-skipped' :
                          r.status === 'FAILED' ? 'status-failed' : 'status-queued'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 sm:px-4 font-mono text-[11px] text-slate-400">
                        {r.whatsapp_message_id || "—"}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-xs text-slate-400">
                        {r.skip_reason ? (
                          <span className="text-amber-400 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {r.skip_reason}
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
