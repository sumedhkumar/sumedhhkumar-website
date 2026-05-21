"use client";

import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-card-border py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="font-bold text-lg">
            <span className="gradient-text">Sumedh Kumar</span>
          </span>
          <p className="text-xs text-muted mt-1">
            AI Builder &middot; Trading Automation &middot; Implementation
            Partner
          </p>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://www.instagram.com/sumedhhkumar.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Instagram"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </a>
          <a
            href="https://www.youtube.com/@Sumedhhkumar/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="YouTube"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
          </a>
          <a
            href="https://www.linkedin.com/in/sumedhkumar-bhalerao/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="LinkedIn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
          <a
            href="mailto:hello@sumedhkumar.com"
            className="text-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Email"
          >
            <Mail size={18} />
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-card-border text-center">
        <p className="text-xs text-muted/50">
          &copy; {new Date().getFullYear()} Sumedh Kumar. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
