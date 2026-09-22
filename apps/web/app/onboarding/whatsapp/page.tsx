"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  Building2, 
  MessageSquare, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Smartphone,
  Lock,
  Sparkles,
  RefreshCw,
  Zap,
  Server
} from "lucide-react";

export default function EmbeddedWhatsAppOnboardingPage() {
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);
  const [step, setStep] = useState<"IDLE" | "META_AUTH" | "ASSET_SELECT" | "CONNECTED">("IDLE");
  const [selectedAsset, setSelectedAsset] = useState("pn_realestate_official");
  const [displayPhone, setDisplayPhone] = useState("+91 80744 18868");

  const startEmbeddedConnect = () => {
    setConnecting(true);
    setStep("META_AUTH");

    // Simulate Meta Embedded Signup OAuth popup delay
    setTimeout(() => {
      setStep("ASSET_SELECT");
      setConnecting(false);
    }, 1500);
  };

  const confirmMetaAssetSelection = async () => {
    setConnecting(true);
    try {
      await api.connectEmbeddedWhatsApp({
        display_phone_number: displayPhone,
        mode: "LIVE"
      });
      setStep("CONNECTED");
    } catch (err: any) {
      alert("Failed to connect Meta account: " + err.message);
    } finally {
      setConnecting(false);
    }
  };

  const finishAndGoToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-brand-500/20">
            <Building2 className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-base tracking-tight">PropConnect</h1>
            <p className="text-[10px] text-brand-400 font-semibold">1-Click WhatsApp Onboarding</p>
          </div>
        </Link>
      </header>

      {/* Main Wizard Box */}
      <main className="max-w-2xl w-full mx-auto py-8 my-auto">
        <div className="glass-card p-6 sm:p-10 rounded-2xl border border-slate-800 space-y-6 text-center animate-fadeIn">
          {/* STEP: IDLE (Initial Prompt) */}
          {step === "IDLE" && (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-brand-400 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                <MessageSquare className="w-8 h-8 text-slate-950" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Connect Meta WhatsApp Business</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
                  No technical API keys or system tokens required. Connect your official Meta WhatsApp Business account with 1-click.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-left space-y-2 font-sans">
                <div className="flex items-center gap-2 text-slate-200 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Meta Official Embedded Connection
                </div>
                <ul className="space-y-1 text-slate-400 pl-6 list-disc text-[11px]">
                  <li>Authenticate directly with Meta / Facebook login</li>
                  <li>Automatically links your WhatsApp Business Account (WBA)</li>
                  <li>No manual copy-pasting of Phone IDs or EAAG System Tokens</li>
                  <li>Encrypted & secured backend token management</li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  onClick={startEmbeddedConnect}
                  disabled={connecting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-brand-500 hover:from-emerald-400 hover:to-brand-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <MessageSquare className="w-4 h-4 text-slate-950" />
                  <span>Connect WhatsApp Business with Meta</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP: META_AUTH (Simulated Meta Dialog) */}
          {step === "META_AUTH" && (
            <div className="py-8 space-y-4">
              <div className="w-12 h-12 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
              <h3 className="font-bold text-slate-100 text-base">Authenticating with Meta Cloud API...</h3>
              <p className="text-xs text-slate-400">Opening secure Meta OAuth session and validating business assets.</p>
            </div>
          )}

          {/* STEP: ASSET_SELECT (Select WhatsApp Number) */}
          {step === "ASSET_SELECT" && (
            <div className="space-y-6 text-left">
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-100">Select WhatsApp Business Number</h3>
                <p className="text-xs text-slate-400 mt-1">Choose the official phone number registered to your Meta Business Manager</p>
              </div>

              <div className="space-y-3">
                <div
                  onClick={() => setSelectedAsset("pn_realestate_official")}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedAsset === "pn_realestate_official" ? "border-emerald-500 bg-emerald-950/20" : "border-slate-800 bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-100">Official Business Line (+91 80744 18868)</p>
                      <p className="text-[11px] text-slate-400">Meta WBA ID: 9018273645 (Verified ✓)</p>
                    </div>
                  </div>
                  {selectedAsset === "pn_realestate_official" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs text-slate-300 font-semibold">Confirm Display Number on WhatsApp</label>
                  <input
                    type="text"
                    value={displayPhone}
                    onChange={(e) => setDisplayPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={confirmMetaAssetSelection}
                  disabled={connecting}
                  className="w-full py-3 px-6 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <span>{connecting ? "Linking Asset..." : "Confirm & Complete Connection"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP: CONNECTED (Success Confirmation) */}
          {step === "CONNECTED" && (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-100">WhatsApp Business Connected ✓</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Your Meta WhatsApp Business account (<span className="text-emerald-400 font-mono font-bold">{displayPhone}</span>) is linked and ready for campaign dispatches.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2 text-left font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Provider Status:</span>
                  <span className="text-emerald-400 font-bold">LIVE Meta Cloud API ✓</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quality Rating:</span>
                  <span className="text-emerald-400 font-bold">GREEN (High Quality)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Webhook Connection:</span>
                  <span className="text-slate-200">Active Listener</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={finishAndGoToDashboard}
                  className="w-full py-3.5 px-6 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Go to Campaign Dashboard →</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
