"use client";

import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  HelpCircle,
  MessageSquare
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

export default function PricingPage() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#070a12]">
      <Navigation />

      <main className="flex-1 p-4 sm:p-8 pb-24 md:pb-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            Transparent Commercial SaaS Pricing
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Separate Platform Fee from Meta WhatsApp Usage. Zero double billing on skipped duplicate contacts.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-slate-700 bg-slate-900/40 relative flex flex-col justify-between"
            >
              {p.badge && (
                <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-brand-500 text-slate-950 text-[10px] font-bold uppercase shadow-sm">
                  {p.badge}
                </span>
              )}

              <div>
                <h3 className="font-bold text-slate-100 text-lg">{p.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-100">{p.price}</span>
                  <span className="text-xs text-slate-400">{p.billing}</span>
                </div>
                <p className="text-xs font-semibold text-brand-400 mt-1">{p.messages}</p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1 text-[11px] font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Platform Fee:</span>
                    <span className="text-slate-200">{p.platform_fee}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Meta Rate:</span>
                    <span className="text-slate-200">{p.meta_rate}</span>
                  </div>
                </div>

                <ul className="mt-5 space-y-2 text-xs text-slate-300">
                  {p.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800">
                <Link
                  href="/signup"
                  className="w-full py-2.5 px-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Commercial FAQ / Meta Explanation */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4 max-w-4xl mx-auto">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-400" /> Commercial SaaS Billing FAQ
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-slate-200">How does Meta WhatsApp billing work?</h4>
              <p className="text-slate-400">
                Meta charges per 24-hour conversation window based on category (Marketing, Utility, Authentication). Your SaaS package clearly separates platform usage from Meta conversation fees.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-slate-200">Are skipped duplicate contacts charged?</h4>
              <p className="text-slate-400">
                No! Skipped duplicate messages consume ₹0 and 0 message credits because zero outbound dispatches occur. Duplicate prevention saves your budget automatically.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
