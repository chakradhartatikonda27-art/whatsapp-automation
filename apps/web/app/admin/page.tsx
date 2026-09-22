"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { api } from "@/lib/api";
import { 
  Building2, 
  Plus, 
  Users, 
  Phone, 
  CheckCircle2, 
  Server, 
  Zap, 
  ShieldCheck, 
  Search,
  ExternalLink,
  Layers,
  ArrowRight
} from "lucide-react";

export default function PlatformAdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Business Form
  const [name, setName] = useState("");
  const [displayPhone, setDisplayPhone] = useState("");
  const [mode, setMode] = useState<"DEMO" | "LIVE">("DEMO");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [accessToken, setAccessToken] = useState("");

  async function loadData() {
    try {
      const res = await api.getAdminOrganizations();
      setData(res);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleOnboardBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await api.onboardBusiness({
        name,
        display_phone_number: displayPhone,
        mode,
        phone_number_id: phoneNumberId,
        access_token: accessToken
      });
      setShowAddModal(false);
      setName("");
      setDisplayPhone("");
      setPhoneNumberId("");
      setAccessToken("");
      await loadData();
    } catch (err: any) {
      alert("Failed to onboard business: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const switchTenant = (orgId: string, orgName: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("active_org_id", orgId);
      localStorage.setItem("active_org_name", orgName);
      window.location.href = "/dashboard";
    }
  };

  const orgs = (data?.organizations || []).filter((o: any) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#070a12]">
      <Navigation />

      <main className="flex-1 p-4 sm:p-8 pb-24 md:pb-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Platform Admin Dashboard</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-[10px] font-bold uppercase">
                Global Overview
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Onboard businesses, manage multi-tenant WhatsApp accounts, and monitor platform metrics
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Onboard New Business
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading global platform metrics...</div>
        ) : (
          <div className="space-y-6">
            {/* Global Admin Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
              <div className="glass-card p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-brand-400" /> Total Businesses
                </span>
                <p className="text-2xl font-bold text-slate-100 mt-1">{data?.stats?.total_businesses || 0}</p>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/10">
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Businesses
                </span>
                <p className="text-2xl font-bold text-emerald-300 mt-1">{data?.stats?.active_businesses || 0}</p>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-blue-500/20 bg-blue-950/10">
                <span className="text-xs text-blue-400 font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Connected WhatsApps
                </span>
                <p className="text-2xl font-bold text-blue-300 mt-1">{data?.stats?.connected_whatsapp_accounts || 0}</p>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-indigo-500/20 bg-indigo-950/10">
                <span className="text-xs text-indigo-400 font-medium flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Total Campaigns
                </span>
                <p className="text-2xl font-bold text-indigo-300 mt-1">{data?.stats?.total_campaigns || 0}</p>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-purple-500/20 bg-purple-950/10">
                <span className="text-xs text-purple-400 font-medium flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Messages Processed
                </span>
                <p className="text-2xl font-bold text-purple-300 mt-1">{(data?.stats?.total_messages_processed || 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Business Roster Table */}
            <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-100">Onboarded Real Estate Companies</h2>
                  <p className="text-xs text-slate-400">Complete multi-tenant isolation across databases, WhatsApp numbers, and campaigns</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search business name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] bg-slate-950">
                      <th className="py-3 px-4 font-semibold">Business Name</th>
                      <th className="py-3 px-4 font-semibold">Tenant Slug</th>
                      <th className="py-3 px-4 font-semibold">WhatsApp Number</th>
                      <th className="py-3 px-4 font-semibold">Integration Mode</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {orgs.map((org: any) => (
                      <tr key={org.id} className="hover:bg-slate-900/40">
                        <td className="py-3.5 px-4 font-sans font-bold text-slate-100 text-sm flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-brand-400" /> {org.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">{org.slug}</td>
                        <td className="py-3.5 px-4 text-slate-200">{org.whatsapp_config?.display_phone_number || "—"}</td>
                        <td className="py-3.5 px-4 font-sans">
                          {org.whatsapp_config?.mode === "LIVE" ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1 w-max">
                              <Server className="w-3 h-3" /> LIVE META API
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-brand-500/10 text-brand-400 border border-brand-500/20 font-semibold flex items-center gap-1 w-max">
                              <Zap className="w-3 h-3" /> DEMO SANDBOX
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-sans">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                            ACTIVE ✓
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-sans text-right">
                          <button
                            onClick={() => switchTenant(org.id, org.name)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-400 text-xs font-semibold border border-slate-700 transition-colors"
                          >
                            Access Dashboard <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Onboard New Business */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card p-6 rounded-2xl border border-slate-800 max-w-lg w-full space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-brand-400" /> Onboard New Real Estate Business
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-200 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleOnboardBusiness} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Business / Company Name <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunshine Infra or Prime Properties"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">WhatsApp Display Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 55555"
                    value={displayPhone}
                    onChange={(e) => setDisplayPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">WhatsApp Integration Mode</label>
                  <select
                    value={mode}
                    onChange={(e: any) => setMode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="DEMO">Demo Sandbox Mode (Simulated Dispatches)</option>
                    <option value="LIVE">Live Meta WhatsApp Cloud API</option>
                  </select>
                </div>

                {mode === "LIVE" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-medium">Meta Phone Number ID</label>
                      <input
                        type="text"
                        placeholder="e.g. 1092837465"
                        value={phoneNumberId}
                        onChange={(e) => setPhoneNumberId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-medium">Meta System User Token</label>
                      <input
                        type="password"
                        placeholder="EAAG..."
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-brand-500 text-slate-950 font-bold shadow-md shadow-brand-500/20"
                  >
                    {submitting ? "Onboarding..." : "Onboard Business"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
