"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  Zap,
  CreditCard,
  MessageSquare,
  Sparkles
} from "lucide-react";

const PLANS = [
  {
    id: "plan_starter",
    name: "Starter",
    price: "₹2,999",
    billing: "/ month",
    messages: "5,000 Messages",
    meta_rate: "₹0.78 / Meta Msg",
    platform_fee: "₹0.10 / Msg",
    badge: null,
    features: [
      "5,000 Campaign Volume",
      "Multi-Format Import (Excel, PDF, Word, Photos)",
      "Dynamic SHA-256 Duplicate Protection",
      "Standard WhatsApp Webhooks & Analytics"
    ]
  },
  {
    id: "plan_growth",
    name: "Growth",
    price: "₹5,999",
    billing: "/ month",
    messages: "10,000 Messages",
    meta_rate: "₹0.75 / Meta Msg",
    platform_fee: "₹0.08 / Msg",
    badge: "Most Popular",
    features: [
      "10,000 Campaign Volume",
      "OCR Photo Contact List Scanner",
      "Priority WhatsApp Delivery Speed",
      "Advanced Campaign Analytics & Reports",
      "Dedicated Onboarding Support"
    ]
  },
  {
    id: "plan_business",
    name: "Business",
    price: "₹12,999",
    billing: "/ month",
    messages: "25,000 Messages",
    meta_rate: "₹0.70 / Meta Msg",
    platform_fee: "₹0.05 / Msg",
    badge: "Best Value",
    features: [
      "25,000 Campaign Volume",
      "Multi-Project Lead Segmentation",
      "Unlimited OCR & Document Extraction",
      "1-Click Meta Embedded Onboarding",
      "Priority SLA Support"
    ]
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    price: "Custom",
    billing: "/ custom volume",
    messages: "100,000+ Messages",
    meta_rate: "Volume Discount",
    platform_fee: "Custom Rate",
    badge: null,
    features: [
      "Unlimited Campaign Volume",
      "Custom SLA & Dedicated Server Options",
      "White-label Branding Available",
      "24/7 Phone & WhatsApp Support"
    ]
  }
];

export default function BusinessSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [category, setCategory] = useState("Real Estate Developer");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("plan_growth");

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.signupBusiness({
        company_name: companyName,
        owner_name: ownerName,
        email: email,
        mobile_number: mobileNumber,
        category: category,
        website: website,
        address: address,
        plan_id: selectedPlan
      });

      if (typeof window !== "undefined" && res?.organization) {
        localStorage.setItem("active_org_id", res.organization.id);
        localStorage.setItem("active_org_name", res.organization.name);
      }

      setStep(3); // Go to Payment Confirmation
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const completePaymentAndOnboard = () => {
    router.push("/onboarding/whatsapp");
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header Navigation */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-brand-500/20">
            <Building2 className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-base tracking-tight">PropConnect</h1>
            <p className="text-[10px] text-brand-400 font-semibold">Multi-Business WhatsApp SaaS</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:inline">Already have an account?</span>
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto py-8 my-auto">
        {/* Progress Stepper */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${step >= 1 ? "bg-brand-500/10 text-brand-400 border border-brand-500/30" : "bg-slate-900 text-slate-500"}`}>
            <span className="w-5 h-5 rounded-full bg-brand-500 text-slate-950 flex items-center justify-center text-[11px]">1</span>
            <span>Business Info</span>
          </div>
          <div className="w-6 sm:w-12 h-0.5 bg-slate-800" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${step >= 2 ? "bg-brand-500/10 text-brand-400 border border-brand-500/30" : "bg-slate-900 text-slate-500"}`}>
            <span className="w-5 h-5 rounded-full bg-brand-500 text-slate-950 flex items-center justify-center text-[11px]">2</span>
            <span>Select Plan</span>
          </div>
          <div className="w-6 sm:w-12 h-0.5 bg-slate-800" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${step >= 3 ? "bg-brand-500/10 text-brand-400 border border-brand-500/30" : "bg-slate-900 text-slate-500"}`}>
            <span className="w-5 h-5 rounded-full bg-brand-500 text-slate-950 flex items-center justify-center text-[11px]">3</span>
            <span>Activate Account</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold">✕</button>
          </div>
        )}

        {/* STEP 1: Business Details */}
        {step === 1 && (
          <div className="glass-card p-6 sm:p-10 rounded-2xl border border-slate-800 space-y-6 animate-fadeIn">
            <div className="text-center max-w-lg mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Onboard Your Business</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Set up your multi-tenant WhatsApp campaign dashboard in 2 minutes
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if (companyName && ownerName && email && mobileNumber) setStep(2); else setError("Please fill all required fields"); }} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-brand-400" /> Company / Business Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sri Infra or Sai Real Estate"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-400" /> Business Owner Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Srikanth Verma"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-brand-400" /> Work Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-brand-400" /> WhatsApp Mobile Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Business Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="Real Estate Developer">Real Estate Developer</option>
                  <option value="Residential Property Agency">Residential Property Agency</option>
                  <option value="Commercial Plots & Villas">Commercial Plots & Villas</option>
                  <option value="Independent Property Broker">Independent Property Broker</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-brand-400" /> Company Website
                </label>
                <input
                  type="text"
                  placeholder="https://company.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-400" /> Business Address
                </label>
                <input
                  type="text"
                  placeholder="City, State, Country"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="sm:col-span-2 pt-4 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Continue to Choose Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: Plan Selection & Transparent Billing */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center max-w-lg mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Select Your SaaS Plan</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Choose the message volume needed for your property marketing campaigns
              </p>
            </div>

            {/* Meta Pricing Explanation Card */}
            <div className="glass-card p-4 rounded-xl border border-brand-500/20 bg-brand-950/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-200">Transparent 2-Tier Pricing Model</h4>
                  <p className="text-slate-400 mt-0.5">
                    Your package includes full platform features (contact extraction, OCR, duplicate protection, analytics). Meta WhatsApp usage charges apply per outbound marketing conversation.
                  </p>
                </div>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLANS.map((p) => {
                const isSelected = selectedPlan === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`glass-card p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? "border-brand-500 bg-brand-950/20 ring-1 ring-brand-500 shadow-xl"
                        : "border-slate-800 hover:border-slate-700 bg-slate-900/40"
                    }`}
                  >
                    {p.badge && (
                      <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-brand-500 text-slate-950 text-[10px] font-bold uppercase shadow-sm">
                        {p.badge}
                      </span>
                    )}

                    <div>
                      <h3 className="font-bold text-slate-100 text-base">{p.name}</h3>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-slate-100">{p.price}</span>
                        <span className="text-xs text-slate-400">{p.billing}</span>
                      </div>
                      <p className="text-xs font-semibold text-brand-400 mt-1">{p.messages}</p>

                      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-[11px] font-mono">
                        <div className="flex justify-between text-slate-400">
                          <span>Platform Fee:</span>
                          <span className="text-slate-200">{p.platform_fee}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Meta Rate:</span>
                          <span className="text-slate-200">{p.meta_rate}</span>
                        </div>
                      </div>

                      <ul className="mt-4 space-y-2 text-xs text-slate-300">
                        {p.features.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800">
                      <button
                        onClick={() => setSelectedPlan(p.id)}
                        className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all ${
                          isSelected
                            ? "bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        {isSelected ? "Selected Plan ✓" : "Choose Plan"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                onClick={handleSignupSubmit}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-all"
              >
                <span>{loading ? "Creating Account..." : "Confirm & Proceed to Payment"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Payment & Account Activation */}
        {step === 3 && (
          <div className="glass-card p-6 sm:p-10 rounded-2xl border border-slate-800 space-y-6 text-center max-w-lg mx-auto animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Account Created & Activated!</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Your company account for <span className="text-slate-100 font-bold">{companyName || "Sri Infra"}</span> is active with wallet credits ready.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2 text-left font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Active Organization:</span>
                <span className="text-brand-400 font-bold">{companyName || "Sri Infra"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Plan Selected:</span>
                <span className="text-slate-200">Growth Plan (10,000 Messages)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Wallet Credit Balance:</span>
                <span className="text-emerald-400 font-bold">₹5,999.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duplicate Message Policy:</span>
                <span className="text-emerald-300">₹0 / 0 Credits (100% Free)</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={completePaymentAndOnboard}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Connect WhatsApp Business Account →</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto py-4 border-t border-slate-800 text-center text-xs text-slate-500">
        PropConnect WhatsApp Bulk Campaign SaaS Platform © 2026. All rights reserved.
      </footer>
    </div>
  );
}
