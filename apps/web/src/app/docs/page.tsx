"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  BookOpen, 
  KeyRound, 
  Send, 
  ShieldCheck, 
  Code2, 
  Layers, 
  Activity, 
  Terminal, 
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { CopyCodeBlock } from "@/components/CopyCodeBlock";
import { SkillsGuideActions } from "@/components/SkillsGuideActions";
import { Navbar } from "@/components/Navbar";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function DocsPage() {
  const endpoint = process.env.NEXT_PUBLIC_ACOST_BASE_URL || "https://tracker.your-domain.com/v1/track";
  const [activeTab, setActiveTab] = useState<"curl" | "fetch" | "batch">("curl");
  const [user, setUser] = useState<User | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, [supabase]);

  const envCode = `ACOST_BASE_URL=${endpoint}
ACOST_API_KEY=acost_your_secret_key`;

  const curlCode = `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: acost_your_secret_key" \\
  -d '{
    "event": {
      "userId": "user_123",
      "provider": "openai",
      "model": "gpt-4o-mini",
      "feature": "chat-answer",
      "prompt": "Summarize this customer conversation in 3 bullet points.",
      "inputTokens": 1200,
      "outputTokens": 280,
      "estimatedCost": 0.00231,
      "latency": 842
    }
  }'`;

  const fetchCode = `const endpoint = process.env.ACOST_BASE_URL!;
const apiKey = process.env.ACOST_API_KEY!;

await fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
  },
  body: JSON.stringify({
    event: {
      userId: "user_123",
      provider: "openai",
      model: "gpt-4o-mini",
      feature: "chat-answer",
      prompt: "Summarize this customer conversation in 3 bullet points.",
      inputTokens: 1200,
      outputTokens: 280,
      estimatedCost: 0.00231,
      latency: 842,
      createdAt: new Date().toISOString(),
    },
  }),
});`;

  const batchCode = `await fetch(process.env.ACOST_BASE_URL!, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.ACOST_API_KEY!,
  },
  body: JSON.stringify({
    events: [
      {
        userId: "user_123",
        provider: "openai",
        model: "gpt-4o-mini",
        feature: "chat-answer",
        inputTokens: 900,
        outputTokens: 240,
        estimatedCost: 0.00192,
        latency: 710,
      },
      {
        userId: "user_456",
        provider: "anthropic",
        model: "claude-3-5-sonnet",
        feature: "summarizer",
        inputTokens: 1500,
        outputTokens: 420,
        estimatedCost: 0.0062,
        latency: 1240,
      }
    ],
  }),
});`;

  return (
    <main className="min-h-screen bg-canvas text-primary pb-20">
      <Navbar user={user} />
      <div className="max-w-6xl mx-auto px-6 py-32 space-y-16 animate-fade-in">
        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-12">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/5 border border-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest">
              <BookOpen className="w-3 h-3" />
              API Documentation
            </div>
            <h1 className="text-5xl font-display font-semibold tracking-tight leading-tight">
              Ingestion API <br /> Reference.
            </h1>
            <p className="text-secondary text-base leading-relaxed max-w-xl">
              acost provides a high-performance REST API to track AI costs from any backend environment. No SDK required—just a simple POST request.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <SkillsGuideActions />
            <Link
              href="/dashboard/keys"
              className="button-spring flex items-center justify-center gap-2 px-6 py-3 bg-accent text-canvas font-semibold rounded-lg text-sm shadow-lg shadow-accent/10"
            >
              Create API Key
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ─── Endpoint & Auth ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="fuser-card space-y-4 bg-surface-elevated/50 border-border">
            <div className="flex items-center gap-2 text-accent">
              <Send className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest">Target Endpoint</h3>
            </div>
            <div className="flex items-center gap-3 p-4 bg-canvas border border-border rounded-xl font-mono text-sm overflow-hidden">
              <span className="px-2 py-0.5 bg-accent text-canvas rounded text-[10px] font-bold shrink-0">POST</span>
              <code className="text-primary truncate">{endpoint}</code>
            </div>
            <p className="text-xs text-secondary leading-relaxed">
              Use this endpoint to send individual telemetry events or batches.
            </p>
          </div>

          <div className="fuser-card space-y-4 bg-surface-elevated/50 border-border">
            <div className="flex items-center gap-2 text-accent">
              <KeyRound className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest">Authentication</h3>
            </div>
            <div className="flex items-center gap-3 p-4 bg-canvas border border-border rounded-xl font-mono text-sm overflow-hidden">
              <code className="text-secondary italic truncate">x-api-key: acost_your_secret_key</code>
            </div>
            <p className="text-xs text-secondary leading-relaxed">
              Pass your secret API key in the request header. Generate keys in your dashboard settings.
            </p>
          </div>
        </div>

        {/* ─── Environment Setup ─── */}
        <section className="fuser-card bg-surface-elevated/50 border-border">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="max-w-xs space-y-4">
              <div className="flex items-center gap-2 text-accent">
                <Layers className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest">Configuration</h3>
              </div>
              <h2 className="text-2xl font-display font-semibold">Environment Variables</h2>
              <p className="text-xs text-secondary leading-relaxed">
                Store these keys in your secure backend configuration. Never expose your API key in client-side code.
              </p>
            </div>
            <div className="flex-1 w-full">
              <CopyCodeBlock 
                title=".env configuration" 
                code={envCode} 
                language="bash"
              />
            </div>
          </div>
        </section>

        {/* ─── Payload Schema ─── */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-display font-semibold tracking-tight">Request Schema</h2>
            <p className="text-secondary text-sm">Every event requires three core fields for basic tracking.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-canvas border-b border-border">
                      <th className="px-6 py-4 font-semibold text-primary">Field</th>
                      <th className="px-6 py-4 font-semibold text-primary">Type</th>
                      <th className="px-6 py-4 font-semibold text-primary">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {[
                      { f: "userId", t: "string", s: "Required", desc: "Unique identifier for your application user." },
                      { f: "provider", t: "string", s: "Required", desc: "AI provider (openai, anthropic, gemini, etc.)" },
                      { f: "model", t: "string", s: "Required", desc: "Exact model ID used (e.g. gpt-4o)." },
                      { f: "feature", t: "string", s: "Recommended", desc: "Grouping tag for your product features." },
                      { f: "inputTokens", t: "number", s: "Optional", desc: "Prompt token count." },
                      { f: "outputTokens", t: "number", s: "Optional", desc: "Completion token count." },
                      { f: "latency", t: "number", s: "Optional", desc: "Request duration in milliseconds." },
                      { f: "estimatedCost", t: "number", s: "Optional", desc: "Provider cost override." }
                    ].map(row => (
                      <tr key={row.f} className="group hover:bg-canvas/30 transition-colors">
                        <td className="px-6 py-4">
                          <code className="text-accent font-bold">{row.f}</code>
                          <p className="text-[11px] text-secondary mt-1">{row.desc}</p>
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-secondary">{row.t}</td>
                        <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.s === 'Required' 
                            ? 'bg-emerald-500/10 text-emerald-600' 
                            : row.s === 'Recommended'
                            ? 'bg-blue-500/10 text-blue-600'
                            : 'bg-canvas text-secondary'
                        }`}>
                          {row.s === 'Required' && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {row.s}
                        </span>
                      </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="fuser-card bg-surface-elevated border-border">
                <div className="flex items-center gap-2 mb-4 text-accent">
                  <Layers className="w-4 h-4" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">Payload Formats</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-primary mb-1">Single Event</h4>
                    <p className="text-xs text-secondary leading-relaxed">Pass a single object under the <code className="bg-canvas px-1 rounded font-bold text-accent">event</code> key.</p>
                  </div>
                  <div className="h-px bg-border" />
                  <div>
                    <h4 className="text-sm font-semibold text-primary mb-1">Batch (Up to 100)</h4>
                    <p className="text-xs text-secondary leading-relaxed">Pass an array of objects under the <code className="bg-canvas px-1 rounded font-bold text-accent">events</code> key.</p>
                  </div>
                </div>
              </div>

              <div className="fuser-card space-y-4 bg-surface-elevated border-border">
                <div className="flex items-center gap-2 text-accent">
                  <Activity className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">Responses</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-emerald-600 font-bold">200 OK</span>
                    <span className="text-secondary">Accepted</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-amber-600 font-bold">400 Bad Request</span>
                    <span className="text-secondary">Schema Error</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-red-600 font-bold">401 Unauthorized</span>
                    <span className="text-secondary">Invalid Key</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Implementation Examples ─── */}
        <section className="space-y-8 pt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-accent">
                <Terminal className="w-5 h-5" />
                <h2 className="text-3xl font-display font-semibold tracking-tight">Implementation Examples</h2>
              </div>
              <p className="text-secondary text-sm">Ready-to-use snippets for your backend environment.</p>
            </div>
            
            <div className="flex bg-surface border border-border p-1 rounded-xl shadow-sm">
              {[
                { id: "curl", label: "cURL" },
                { id: "fetch", label: "Fetch" },
                { id: "batch", label: "Batch" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeTab === tab.id 
                      ? "bg-accent text-canvas shadow-md" 
                      : "text-muted hover:text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="fuser-card bg-surface-elevated/50 border-border p-6 shadow-xl">
            <div className="mb-6">
              {activeTab === "curl" && (
                <CopyCodeBlock 
                  title="cURL Request" 
                  code={curlCode} 
                  language="bash"
                />
              )}
              {activeTab === "fetch" && (
                <CopyCodeBlock 
                  title="Backend fetch()" 
                  code={fetchCode} 
                  language="typescript"
                />
              )}
              {activeTab === "batch" && (
                <CopyCodeBlock 
                  title="Batch ingestion" 
                  code={batchCode} 
                  language="typescript"
                />
              )}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-canvas border border-border w-fit">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Secure SSL Ingestion Enabled</span>
            </div>
          </div>
        </section>

        <div className="flex justify-center pt-8">
          <Link href="/dashboard" className="group flex items-center gap-2 text-sm font-bold text-muted hover:text-accent transition-colors">
            Back to Dashboard
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </main>
  );
}
