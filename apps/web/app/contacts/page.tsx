"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { api } from "@/lib/api";
import { Search, Users, MapPin, Phone, History, X } from "lucide-react";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
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
    loadContacts();
  }, [searchQuery]);

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

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#070a12]">
      <Navigation />

      <main className="flex-1 p-4 sm:p-8 pb-24 md:pb-8 overflow-y-auto w-full max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Contact Directory</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Real estate prospect database and campaign history</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, phone, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Contacts Table */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-800">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-3 sm:px-4">Contact Name</th>
                  <th className="py-3 px-3 sm:px-4">Phone Number</th>
                  <th className="py-3 px-3 sm:px-4">Location</th>
                  <th className="py-3 px-3 sm:px-4">Added Date</th>
                  <th className="py-3 px-3 sm:px-4 text-right">Campaign History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                {loading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-xs text-slate-400">Loading directory contacts...</td></tr>
                ) : contacts.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-xs text-slate-500">No contacts found</td></tr>
                ) : (
                  contacts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 sm:px-4 font-medium text-slate-200">{c.name}</td>
                      <td className="py-3 px-3 sm:px-4 font-mono text-slate-300 text-xs">{c.phone_number}</td>
                      <td className="py-3 px-3 sm:px-4 text-slate-400 text-xs">{c.location || "—"}</td>
                      <td className="py-3 px-3 sm:px-4 text-slate-400 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-3 sm:px-4 text-right">
                        <button
                          onClick={() => handleOpenHistory(c)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-400 text-xs font-medium border border-slate-700"
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
            <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">{selectedContact.name}</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedContact.phone_number}</p>
                </div>
                <button onClick={() => setSelectedContact(null)} className="p-1 text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Past Campaign Activity</h3>

              {loadingHistory ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading campaign activity...</div>
              ) : history.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">No past campaign activity found for this contact.</div>
              ) : (
                <div className="space-y-3">
                  {history.map((h, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-200">{h.campaign_name}</span>
                        <span className={`status-pill ${
                          h.status === 'DELIVERED' || h.status === 'READ' ? 'status-read' :
                          h.status === 'SKIPPED' ? 'status-skipped' : 'status-sent'
                        }`}>
                          {h.status}
                        </span>
                      </div>
                      {h.skip_reason && (
                        <p className="text-[11px] text-amber-400 mt-1">Reason: {h.skip_reason}</p>
                      )}
                      <p className="text-[10px] text-slate-500">{new Date(h.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
