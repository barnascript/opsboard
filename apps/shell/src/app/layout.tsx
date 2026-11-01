import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@opsboard/ui/src/styles.css";
import "./shell.css";

export const metadata: Metadata = {
  title: "Opsboard",
  description: "Micro-frontend operations dashboard: Next.js shell with Module Federation remotes.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <header className="shell-header">
          <span className="shell-brand">Opsboard</span>
          <nav aria-label="Primary">
            <a href="/" aria-current="page">
              Overview
            </a>
          </nav>
        </header>
        <main id="main" className="shell-main">
          {children}
        </main>
      </body>
    </html>
  );
}
