"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { api } from "@/lib/api";
import { 
  Search, 
  Users, 
  MapPin, 
  Phone, 
  History, 
  X, 
  Download, 
  Tag, 
  UserX, 
  CheckCircle2, 
  AlertTriangle,
  Filter
} from "lucide-react";

const TAG_OPTIONS = ["All", "Buyer", "Investor", "Plot", "Apartment", "Villa", "Interested", "Follow-up"];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");

  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  async function loadContacts() {
    try {
      const res = await api.getContacts(searchQuery);
      setContacts(res || []);
    } catch (err) {
      console.error("Failed to load contacts:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContacts();
  }, [searchQuery]);

  const handleToggleOptOut = async (c: any) => {
    try {
      await api.toggleOptOut(c.id);
      await loadContacts();
    } catch (err: any) {
      alert("Failed to update opt-out status: " + err.message);
    }
  };

  const handleOpenHistory = async (c: any) => {
    setSelectedContact(c);
    setLoadingHistory(true);
    try {
      const hList = await api.getContactHistory(c.id);
      setHistory(hList || []);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredContacts.length === 0) return;
    const headers = "Name,Phone,Location,Tags,Status,Created Date\n";
    const rows = filteredContacts.map((c) =>
      `"${c.name}","${c.phone_number}","${c.location || ""}","${(c.tags || []).join(";")}","${c.opt_out ? "OPTED_OUT" : "ACTIVE"}","${c.created_at}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `contacts_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cities = Array.from(new Set(contacts.map((c) => c.location).filter(Boolean)));

  const filteredContacts = contacts.filter((c) => {
    const matchesTag = selectedTag === "All" || (c.tags && c.tags.includes(selectedTag));
    const matchesCity = selectedCity === "All" || c.location === selectedCity;
    return matchesTag && matchesCity;
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#070a12]">
      <Navigation />

      <main className="flex-1 p-4 sm:p-8 pb-24 md:pb-8 overflow-y-auto w-full max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Contact Database & Segmentation</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Multi-tenant customer directory with lead tags, city segmentation, & opt-out protection
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4 text-brand-400" /> Export CSV
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, phone, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                <Filter className="w-3.5 h-3.5" /> City:
              </span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="All">All Cities ({cities.length})</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tag Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-800/80 pb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1 shrink-0">
              <Tag className="w-3 h-3" /> Lead Tag:
            </span>
            {TAG_OPTIONS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  selectedTag === tag
                    ? "bg-brand-500/20 text-brand-400 border border-brand-500/40"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts Table */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-800">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-sm border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400 tracking-wider bg-slate-950">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">City / Location</th>
                  <th className="py-3 px-4">Lead Tags</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {loading ? (
                  <tr><td colSpan={6} className="py-8 text-center text-xs text-slate-400">Loading directory contacts...</td></tr>
                ) : filteredContacts.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-xs text-slate-500">No contacts match the selected filters</td></tr>
                ) : (
                  filteredContacts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-900/40">
                      <td className="py-3.5 px-4 font-bold text-slate-100 text-sm">{c.name}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-200 text-xs">{c.phone_number}</td>
                      <td className="py-3.5 px-4 text-slate-400 text-xs">{c.location || "—"}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(c.tags && c.tags.length > 0 ? c.tags : ["Prospect"]).map((t: string) => (
                            <span key={t} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-brand-300 border border-slate-700">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {c.opt_out ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold flex items-center gap-1 w-max">
                            <UserX className="w-3 h-3" /> OPTED OUT
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" /> ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleOptOut(c)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                            c.opt_out
                              ? "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                          }`}
                          title={c.opt_out ? "Restore Active Consent" : "Opt-Out Customer"}
                        >
                          {c.opt_out ? "Restore" : "Opt-Out"}
                        </button>
                        <button
                          onClick={() => handleOpenHistory(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-400 text-xs font-semibold border border-slate-700"
                        >
                          <History className="w-3.5 h-3.5" /> History
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Campaign History Drawer */}
        {selectedContact && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end">
            <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">{selectedContact.name}</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedContact.phone_number}</p>
                </div>
                <button onClick={() => setSelectedContact(null)} className="p-1 text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Consent Status:</span>
                  <span className={selectedContact.opt_out ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                    {selectedContact.opt_out ? "OPTED OUT (Excluded from Campaign Blasts)" : "ACTIVE CONSENT ✓"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-slate-200">{selectedContact.location || "Rajahmundry"}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">WhatsApp Communication History</h3>

                {loadingHistory ? (
                  <div className="py-8 text-center text-xs text-slate-400">Loading campaign activity...</div>
                ) : history.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">No past campaign activity found for this contact.</div>
                ) : (
                  <div className="space-y-3">
                    {history.map((h, i) => (
                      <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-200">{h.campaign_name || "Campaign Blast"}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            h.status === 'DELIVERED' || h.status === 'READ' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            h.status === 'SKIPPED' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-brand-500/10 text-brand-400'
                          }`}>
                            {h.status}
                          </span>
                        </div>
                        {h.skip_reason && (
                          <p className="text-[11px] text-amber-400 mt-1">Reason: {h.skip_reason}</p>
                        )}
                        <p className="text-[10px] text-slate-500">{new Date(h.sent_at || Date.now()).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
