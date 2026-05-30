import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-canvas">
      {/* Apple-style clean, sparse geometric background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      <div className="max-w-xl animate-fade-in relative z-10">
        <span className="inline-flex items-center rounded-full bg-surface border border-border text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
          AI Cost Tracker — Phase 1
        </span>
        <h1 className="text-5xl md:text-6xl font-display font-semibold tracking-tight text-primary mb-4 leading-[1.1]">
          Financial visibility for{" "}
          <span className="italic block mt-1">
            AI products.
          </span>
        </h1>
        <p className="text-muted text-lg mb-8 max-w-md mx-auto leading-relaxed">
          Lightweight, fail-safe SDK and analytical dashboard to monitor model expenses, token consumption, and feature margins.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="button-spring px-6 py-3 bg-accent hover:opacity-90 text-canvas font-semibold rounded-md text-sm shadow-md"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="button-spring px-6 py-3 bg-surface hover:bg-elevated/40 text-secondary hover:text-primary font-semibold rounded-md text-sm border border-border"
          >
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}
