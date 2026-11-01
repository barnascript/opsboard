import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "@opsboard/ui/src/styles.css";
import "./shell.css";
import { Clock } from "@/components/Clock";

// downloaded at build time and served from this origin, so CSP stays font-src 'self'
const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Opsboard",
  description: "Micro-frontend operations dashboard: Next.js shell with Module Federation remotes.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <header className="shell-header">
          <a href="/" className="shell-brand">
            <span className="shell-mark" aria-hidden="true" />
            Opsboard
          </a>
          <p className="shell-status ob-label">
            <span className="shell-live" aria-hidden="true" />
            <Clock />
            <span className="shell-version"><span className="shell-sep">·</span> Shell 0.1.0</span>
          </p>
          <nav aria-label="Primary">
            <a href="/" aria-current="page">
              Overview
            </a>
            <a href="https://github.com/barnascript/opsboard">Source</a>
          </nav>
        </header>
        <main id="main" className="shell-main">
          {children}
        </main>
        <footer className="shell-footer ob-label">
          <span>Next.js shell</span>
          <span>Module Federation</span>
          <span>
            Data:{" "}
            <a href="https://archive.ics.uci.edu/dataset/502/online+retail+ii">UCI Online Retail II</a>, D. Chen 2019, CC BY 4.0
          </span>
        </footer>
      </body>
    </html>
  );
}
