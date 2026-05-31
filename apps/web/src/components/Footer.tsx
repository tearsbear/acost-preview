"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-12 border-t border-border bg-surface">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left: Logo */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-accent flex items-center justify-center text-canvas font-bold text-xs">
              a
            </div>
            <span className="font-display font-bold text-base tracking-tight text-primary">
              acost<span className="text-accent">.</span>
            </span>
          </Link>
        </div>

        {/* Center: Menu */}
        <div className="flex gap-8 text-xs font-medium text-muted">
          <Link href="/providers" className="hover:text-primary transition-colors">Supported Providers</Link>
          <Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link>
          <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
        </div>

        {/* Right: Copyright */}
        <div className="flex-1 flex justify-end">
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
            © {new Date().getFullYear()} acost intelligence
          </p>
        </div>
      </div>
    </footer>
  );
}
