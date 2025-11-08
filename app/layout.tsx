import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-white`}
      >
        <div className="min-h-screen">
          <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-lg font-semibold">
                Cookie-Pro
              </Link>
              <nav className="flex items-center gap-4 text-sm font-medium">
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/install">Install</Link>
                <a href="/AGENTS.md" target="_blank" rel="noreferrer">
                  Spec
                </a>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-12">{children}</main>
        </div>
      </body>
    </html>
  );
}
