"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ensureAuthenticated } from "@/lib/api";
import { 
  LayoutDashboard, 
  Send, 
  Users, 
  FileText, 
  MessageSquare, 
  Settings, 
  PlusCircle,
  Building2,
  LogOut,
  Menu,
  X
} from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    ensureAuthenticated();
  }, []);

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/campaigns", label: "Campaigns", icon: Send },
    { href: "/contacts", label: "Contacts", icon: Users },
    { href: "/templates", label: "Templates", icon: FileText },
    { href: "/whatsapp", label: "WhatsApp Status", icon: MessageSquare },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const mobileTabs = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/campaigns", label: "Campaigns", icon: Send },
    { href: "/campaigns/create", label: "Create", icon: PlusCircle, isPrimary: true },
    { href: "/contacts", label: "Contacts", icon: Users },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* MOBILE TOP APP BAR (< md) */}
      <header className="md:hidden sticky top-0 z-40 w-full glass-card border-b border-slate-800 px-4 py-3 flex items-center justify-between bg-[#070a12]/90 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-brand-500/20">
            <Building2 className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-sm tracking-tight leading-none">PropConnect</h1>
            <p className="text-[10px] text-brand-400 font-medium mt-0.5">Apex Real Estate</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/campaigns/create"
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-brand-500 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER MENU (< md) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-slate-950/95 backdrop-blur-xl pt-20 px-6 pb-24 overflow-y-auto space-y-6">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-200">Apex Real Estate Solutions</p>
              <p className="text-[11px] text-slate-400">admin@apexrealestate.com</p>
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
              className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">Navigation</p>
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-brand-500/10 text-brand-400 border border-brand-500/20 font-semibold"
                      : "text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-brand-400" : "text-slate-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION TAB BAR (< md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-card bg-[#070a12]/95 border-t border-slate-800 px-2 py-1 flex items-center justify-around pb-safe shadow-2xl">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (tab.href !== "/dashboard" && pathname.startsWith(tab.href));

          if (tab.isPrimary) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-600 via-brand-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-brand-500/40 border-2 border-slate-950 active:scale-95 transition-all">
                  <PlusCircle className="w-6 h-6 text-slate-950" />
                </div>
                <span className="text-[10px] font-bold text-brand-400 mt-1">Create</span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive ? "text-brand-400 font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-brand-400" : "text-slate-400"}`} />
              <span className="text-[10px] mt-1">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* DESKTOP SIDEBAR NAVIGATION (>= md) */}
      <aside className="hidden md:flex w-64 glass-card border-r border-slate-800 flex-col justify-between h-screen sticky top-0 p-4 shrink-0">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-800/80">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-brand-500/20">
              <Building2 className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-100 text-sm tracking-tight">PropConnect</h1>
              <p className="text-xs text-slate-400">WhatsApp SaaS</p>
            </div>
          </div>

          {/* Create Campaign CTA */}
          <div className="mb-6 px-1">
            <Link
              href="/campaigns/create"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-slate-950 font-semibold text-sm shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              Create Campaign
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-brand-400" : "text-slate-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Account Info */}
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
          <div className="truncate">
            <p className="text-xs font-medium text-slate-200 truncate">Apex Real Estate</p>
            <p className="text-[11px] text-slate-400 truncate">admin@apexrealestate.com</p>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="text-slate-400 hover:text-rose-400 p-1"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
