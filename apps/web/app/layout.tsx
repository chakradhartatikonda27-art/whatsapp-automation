import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "PropConnect - WhatsApp Bulk Campaign & Real Estate Data Platform",
  description: "Enterprise multi-tenant WhatsApp campaign SaaS for Real Estate with mobile-first responsiveness, duplicate prevention, and idempotency guarantees.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#070a12",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070a12] text-slate-100 min-h-screen antialiased selection:bg-brand-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
