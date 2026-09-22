"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { api } from "@/lib/api";
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Plus, 
  FileText, 
  History, 
  UserCheck, 
  Key,
  Lock
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"team" | "audit" | "details">("team");
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Member Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"Owner" | "Admin" | "Campaign Manager" | "Sales User" | "Viewer">("Campaign Manager");
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    try {
      const [uList, logs] = await Promise.all([
        api.getTeamUsers(),
        api.getAuditLogs()
      ]);
      setUsers(uList || []);
      setAuditLogs(logs || []);
    } catch (err) {
      console.error("Failed to load settings data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    try {
      await api.addTeamUser({ name, email, role });
      setShowAddModal(false);
      setName("");
      setEmail("");
      await loadData();
    } catch (err: any) {
      alert("Failed to add user: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#070a12]">
      <Navigation />

      <main className="flex-1 p-4 sm:p-8 pb-24 md:pb-8 overflow-y-auto max-w-5xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Organization Settings & RBAC</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Multi-tenant security, RBAC team roles, & security audit logs</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("team")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "team" ? "bg-brand-500 text-slate-950 font-bold shadow-md shadow-brand-500/20" : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              Team Members
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "audit" ? "bg-brand-500 text-slate-950 font-bold shadow-md shadow-brand-500/20" : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              Audit Logs
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "details" ? "bg-brand-500 text-slate-950 font-bold shadow-md shadow-brand-500/20" : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              Security Details
            </button>
          </div>
        </div>

        {/* TAB 1: TEAM MEMBERS & RBAC */}
        {activeTab === "team" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-400" /> Multi-User Team Access & RBAC Roles
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Assign custom permissions (Owner, Admin, Campaign Manager, Sales User, Viewer)</p>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20"
                >
                  <Plus className="w-4 h-4" /> Add Team Member
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-950 font-mono">
                      <th className="py-3 px-4 font-semibold">User Name</th>
                      <th className="py-3 px-4 font-semibold">Email Address</th>
                      <th className="py-3 px-4 font-semibold">Assigned Role</th>
                      <th className="py-3 px-4 font-semibold">Added Date</th>
                      <th className="py-3 px-4 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {users.map((u: any) => (
                      <tr key={u.id} className="hover:bg-slate-900/40">
                        <td className="py-3.5 px-4 font-bold text-slate-100 text-sm flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-brand-400" /> {u.name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">{u.email}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'Owner' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' :
                            u.role === 'Admin' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                            'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono">{new Date(u.created_at || Date.now()).toLocaleDateString()}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                            Active ✓
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AUDIT LOGS */}
        {activeTab === "audit" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <History className="w-4 h-4 text-brand-400" /> Tenant Security & Action Audit Logs
              </h3>
              <p className="text-xs text-slate-400">Complete audit trail of user actions, campaign dispatches, and WhatsApp configuration updates</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-950 font-mono">
                      <th className="py-3 px-4 font-semibold">Timestamp</th>
                      <th className="py-3 px-4 font-semibold">User</th>
                      <th className="py-3 px-4 font-semibold">Action</th>
                      <th className="py-3 px-4 font-semibold">Action Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {auditLogs.length === 0 ? (
                      <tr><td colSpan={4} className="py-6 text-center text-slate-500">No audit log entries recorded yet</td></tr>
                    ) : (
                      auditLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-slate-900/40">
                          <td className="py-3.5 px-4 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="py-3.5 px-4 font-sans font-bold text-slate-200">{log.user_name}</td>
                          <td className="py-3.5 px-4 font-sans">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-brand-500/10 text-brand-400 border border-brand-500/20 font-semibold">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 font-sans">{log.details}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DETAILS */}
        {activeTab === "details" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-400" /> Multi-Tenant Security Engine
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400">Row-Level Security (RLS)</span>
                  <p className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Strictly Enforced via Header Scoping
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400">Outbound Message Idempotency</span>
                  <p className="text-brand-400 font-bold">SHA-256 (Org + Phone + Content + Media)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Team User */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card p-6 rounded-2xl border border-slate-800 max-w-md w-full space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-400" /> Add Team Member
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200 text-xs font-bold">✕</button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Full Name <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Email Address <span className="text-rose-400">*</span></label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Assigned RBAC Role</label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="Admin">Admin (Full Management)</option>
                    <option value="Campaign Manager">Campaign Manager (Contacts & Campaigns)</option>
                    <option value="Sales User">Sales User (Customer Communication)</option>
                    <option value="Viewer">Viewer (Read-Only Reports)</option>
                  </select>
                </div>

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
                    {submitting ? "Adding..." : "Add Member"}
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
