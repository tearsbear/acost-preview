"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-canvas relative overflow-hidden">
      {/* Apple-style clean, sparse geometric background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="w-full max-w-md fuser-card relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-3 text-3xl font-display font-bold tracking-tight text-primary hover:opacity-90">
            acost<span className="text-accent">.</span>
          </Link>
          <h2 className="text-2xl font-display font-semibold tracking-tight text-primary mt-1">Welcome back</h2>
          <p className="text-muted text-sm mt-1">Sign in to your cost dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-4 py-3 bg-canvas border border-border rounded-md text-primary placeholder-zinc-500 text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider" htmlFor="password">
                Password
              </label>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 bg-canvas border border-border rounded-md text-primary placeholder-zinc-500 text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full button-spring py-3 bg-accent hover:opacity-90 disabled:bg-zinc-800 text-canvas font-semibold rounded-md text-sm shadow-md flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {process.env.NEXT_PUBLIC_ALLOW_REGISTER === "true" && (
          <p className="text-center text-sm text-muted mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-accent hover:underline font-semibold">
              Sign up for free
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
