"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { api } from "@/lib/api";
import { 
  CreditCard, 
  Wallet, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ArrowUpRight, 
  RefreshCw,
  Building2,
  Send,
  Layers
} from "lucide-react";

export default function BillingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState(2500);
  const [submitting, setSubmitting] = useState(false);

  async function loadBilling() {
    try {
      const res = await api.getBillingDetails();
      setData(res);
    } catch (err) {
      console.error("Failed to load billing:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBilling();
  }, []);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (topupAmount <= 0) return;
    setSubmitting(true);
    try {
      await api.topupWallet(topupAmount);
      setShowTopupModal(false);
      await loadBilling();
    } catch (err: any) {
      alert("Top-up failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const wallet = data?.wallet || { balance: 5200, currency: "INR", total_credits: 10000, used_credits: 8450 };
  const plan = data?.plan || { name: "Growth", price: 5999, monthly_messages: 10000, next_renewal: "2026-10-15" };
  const stats = data?.usage_stats || { messages_processed: 8450, messages_delivered: 7920, messages_failed: 180, skipped_duplicates_saved: 350 };
  const history = data?.billing_history || [];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#070a12]">
      <Navigation />

      <main className="flex-1 p-4 sm:p-8 pb-24 md:pb-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Billing & Customer Wallet</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase">
                Active Balance
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage SaaS platform subscription, WhatsApp campaign credits, and wallet top-ups
            </p>
          </div>

          <button
            onClick={() => setShowTopupModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Top Up Wallet Balance
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading billing & usage stats...</div>
        ) : (
          <div className="space-y-6">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Wallet Card */}
              <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-400" /> Customer Wallet Balance
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    INR (₹)
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-3xl font-extrabold text-slate-100">₹{wallet.balance.toLocaleString()}.00</p>
                  <p className="text-xs text-slate-400 mt-1">Available for WhatsApp dispatches & campaign top-ups</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Message Credits:</span>
                  <span className="text-emerald-400 font-bold font-mono">{(wallet.total_credits - wallet.used_credits).toLocaleString()} remaining</span>
                </div>
              </div>

              {/* Plan Card */}
              <div className="glass-card p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-brand-400" /> Active Platform Plan
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    {plan.name} Plan
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-slate-100">₹{plan.price.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ month</span></p>
                  <p className="text-xs text-slate-400 mt-1">Monthly Quota: <span className="text-slate-200 font-semibold">{plan.monthly_messages?.toLocaleString() || "10,000"} Messages</span></p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Next Renewal:</span>
                  <span className="text-slate-200 font-semibold">{plan.next_renewal || "2026-10-15"}</span>
                </div>
              </div>

              {/* Duplicate Savings Card */}
              <div className="glass-card p-5 rounded-2xl border border-indigo-500/20 bg-indigo-950/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Duplicate Protection Savings
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    ₹0 / 0 Credits
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-indigo-300">{stats.skipped_duplicates_saved.toLocaleString()} Skipped</p>
                  <p className="text-xs text-slate-400 mt-1">Duplicate contacts automatically prevented from double billing</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span className="text-emerald-400 font-semibold">✓ Zero credits consumed</span> for skipped duplicate messages.
                </div>
              </div>
            </div>

            {/* Usage Meters */}
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand-400" /> WhatsApp Campaign Usage Meters
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Messages Processed</span>
                  <p className="text-xl font-bold text-slate-100 mt-1">{stats.messages_processed.toLocaleString()}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                  <span className="text-[11px] text-emerald-400 font-medium">Delivered</span>
                  <p className="text-xl font-bold text-emerald-300 mt-1">{stats.messages_delivered.toLocaleString()}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20">
                  <span className="text-[11px] text-rose-400 font-medium">Failed</span>
                  <p className="text-xl font-bold text-rose-300 mt-1">{stats.messages_failed.toLocaleString()}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
                  <span className="text-[11px] text-indigo-400 font-medium">Skipped (Saved)</span>
                  <p className="text-xl font-bold text-indigo-300 mt-1">{stats.skipped_duplicates_saved.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Billing & Transaction History */}
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-brand-400" /> Transaction & Billing History
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-950 font-mono">
                      <th className="py-2.5 px-3 font-semibold">Date</th>
                      <th className="py-2.5 px-3 font-semibold">Description</th>
                      <th className="py-2.5 px-3 font-semibold">Type</th>
                      <th className="py-2.5 px-3 font-semibold">Reference</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-500 text-xs">No transactions recorded yet</td>
                      </tr>
                    ) : (
                      history.map((h: any) => (
                        <tr key={h.id} className="hover:bg-slate-900/40">
                          <td className="py-3 px-3 text-slate-400">{new Date(h.date).toLocaleDateString()}</td>
                          <td className="py-3 px-3 text-slate-200 font-sans font-medium">{h.description}</td>
                          <td className="py-3 px-3 font-sans">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              h.type === "TOPUP" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                            }`}>
                              {h.type}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-400">{h.reference || "REF-000"}</td>
                          <td className="py-3 px-3 text-right font-bold text-emerald-400">+₹{h.amount.toLocaleString()}.00</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Top Up Wallet */}
        {showTopupModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card p-6 rounded-2xl border border-slate-800 max-w-md w-full space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-400" /> Top Up Customer Wallet
                </h3>
                <button onClick={() => setShowTopupModal(false)} className="text-slate-400 hover:text-slate-200 text-xs font-bold">✕</button>
              </div>

              <form onSubmit={handleTopUp} className="space-y-4 text-xs">
                <div className="space-y-2">
                  <label className="text-slate-300 font-semibold">Select Recharge Amount</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1000, 2500, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTopupAmount(amt)}
                        className={`py-2 px-3 rounded-xl font-bold border text-xs transition-all ${
                          topupAmount === amt ? "bg-brand-500/10 text-brand-400 border-brand-500/30" : "bg-slate-900 border-slate-800 text-slate-300"
                        }`}
                      >
                        ₹{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Custom Amount (₹)</label>
                  <input
                    type="number"
                    min={100}
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Recharge Credit:</span>
                    <span className="text-slate-200 font-bold">₹{topupAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bonus Message Credits:</span>
                    <span className="text-emerald-400 font-bold">+{Math.round(topupAmount * 1.5).toLocaleString()} Msgs</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTopupModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold shadow-md shadow-brand-500/20"
                  >
                    {submitting ? "Processing..." : "Complete Payment"}
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
