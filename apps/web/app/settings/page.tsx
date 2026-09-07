"use client";

import { Navigation } from "@/components/Navigation";
import { Building2, Users, ShieldCheck, Database, Key } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#070a12]">
      <Navigation />

      <main className="flex-1 p-4 sm:p-8 pb-24 md:pb-8 overflow-y-auto max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Organization Settings</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Multi-tenant security, member roles, and database isolation</p>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-400" /> Tenant Organization Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400">Organization Name</span>
                <p className="font-semibold text-slate-200">Apex Real Estate Solutions</p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400">Tenant Slug</span>
                <p className="font-mono text-slate-300">apex-realestate</p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400">Row-Level Security (RLS)</span>
                <p className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Enforced at Database Engine
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400">Idempotency Duplicate Policy</span>
                <p className="text-brand-400 font-semibold">Strict (SHA-256 Fingerprint)</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-400" /> Team Member Access
            </h3>

            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase">
                    <th className="py-2.5 px-3">Member Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr>
                    <td className="py-3 px-3 font-semibold text-slate-200">Vikram Sharma</td>
                    <td className="py-3 px-3 text-slate-300">admin@apexrealestate.com</td>
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20 font-medium">Owner</span></td>
                    <td className="py-3 px-3 text-emerald-400">Active</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
