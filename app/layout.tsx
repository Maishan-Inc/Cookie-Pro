import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { AppProviders } from "@/components/Providers";
import { getServerLocale } from "@/lib/i18n/server";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cookie-Pro | Consent & Minimal Telemetry",
  description:
    "Next.js + Supabase reference for consent, telemetry, and privacy-first analytics.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getServerLocale();
  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] antialiased transition-colors duration-200`}
      >
        <AppProviders locale={locale}>
          <div className="flex min-h-screen flex-col">
            <SiteHeader locale={locale} />
            <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
              {children}
            </main>
            <SiteFooter locale={locale} />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
