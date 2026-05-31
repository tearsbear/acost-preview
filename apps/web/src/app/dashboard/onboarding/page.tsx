"use client";

import Link from "next/link";
import { ArrowRight, KeyRound, Route, Send, ShieldCheck, Sparkles, Code2, Zap } from "lucide-react";
import { CopyCodeBlock } from "@/components/CopyCodeBlock";
import { SkillsGuideActions } from "@/components/SkillsGuideActions";

export const dynamic = "force-dynamic";

export default function OnboardingPage() {
  const endpoint = process.env.NEXT_PUBLIC_ACOST_BASE_URL || "https://tracker.your-domain.com/v1/track";

  const envSnippet = `ACOST_BASE_URL=${endpoint}
ACOST_API_KEY=acost_your_secret_key`;

  const requestSnippet = `await fetch(process.env.ACOST_BASE_URL!, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.ACOST_API_KEY!,
  },
  body: JSON.stringify({
    event: {
      userId: "user_123",
      provider: "openai",
      model: "gpt-4o-mini",
      feature: "user-onboarding",
      prompt: "Create a short onboarding checklist for a new team member.",
      inputTokens: 1100,
      outputTokens: 260,
      estimatedCost: 0.0022,
      latency: 920,
      createdAt: new Date().toISOString(),
    },
  }),
});`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16 animate-fade-in">
      {/* ─── Hero Section ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/5 border border-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            Quick Start Guide
          </div>
          <h1 className="text-5xl font-display font-semibold tracking-tight text-primary leading-[1.1]">
            Connect your service <br /> in minutes.
          </h1>
          <p className="text-secondary text-base leading-relaxed max-w-xl">
            acost is built for seamless external integration. Follow these steps to start tracking your AI costs and usage metrics with zero friction.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <SkillsGuideActions />
          <Link
            href="/docs"
            className="button-spring flex items-center gap-2 px-6 py-3 bg-accent text-canvas font-semibold rounded-lg text-sm shadow-lg shadow-accent/10"
          >
            View Full API Docs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ─── Steps Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: KeyRound,
            step: "01",
            title: "Generate API Key",
            text: "Visit the API Keys page to create a unique credential for your workspace.",
            link: "/dashboard/keys",
            linkLabel: "Manage Keys"
          },
          {
            icon: Route,
            step: "02",
            title: "Set Base URL",
            text: "Point your telemetry to our dedicated tracker service for high-speed ingestion.",
            link: null,
            linkLabel: null
          },
          {
            icon: Zap,
            step: "03",
            title: "Push Telemetry",
            text: "Send usage data after every LLM call. Supports both single events and batches.",
            link: null,
            linkLabel: null
          }
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={item.step} className="fuser-card group hover:translate-y-[-4px] transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-canvas border border-border text-primary rounded-xl group-hover:border-accent/20 group-hover:bg-accent/5 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-2xl font-display font-bold text-muted/20 group-hover:text-accent/10 transition-colors">
                  {item.step}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">{item.title}</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">{item.text}</p>
              {item.link && (
                <Link href={item.link} className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1">
                  {item.linkLabel}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Code Implementation ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary text-canvas flex items-center justify-center font-display font-bold text-xs">
                1
              </div>
              <h2 className="text-2xl font-display font-semibold text-primary">Configure Environment</h2>
            </div>
            <p className="text-sm text-secondary leading-relaxed pl-11">
              Store your ingestion target and secret key in your server-side environment variables. 
              <span className="block mt-2 font-medium text-amber-600 dark:text-amber-400">
                ⚠️ Never expose your API key in client-side code.
              </span>
            </p>
            <div className="pl-11">
              <CopyCodeBlock title=".env" code={envSnippet} language="bash" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary text-canvas flex items-center justify-center font-display font-bold text-xs">
                2
              </div>
              <h2 className="text-2xl font-display font-semibold text-primary">Send First Event</h2>
            </div>
            <p className="text-sm text-secondary leading-relaxed pl-11">
              Trigger a non-blocking POST request after your AI provider returns usage data. 
              We recommend using a background task or fire-and-forget pattern.
            </p>
            <div className="pl-11">
              <CopyCodeBlock title="Node.js / TypeScript" code={requestSnippet} language="typescript" />
            </div>
          </div>
        </div>

        {/* ─── Technical Reference ─── */}
        <div className="fuser-card bg-surface-elevated/50 sticky top-8">
          <div className="flex items-center gap-2 mb-6">
            <Code2 className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Technical Specs</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-primary mb-3">Required Payload Fields</h4>
              <div className="grid grid-cols-2 gap-2">
                {["userId", "provider", "model"].map(f => (
                  <div key={f} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-canvas border border-border text-[11px] font-mono text-secondary">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    {f}
                  </div>
                ))}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-canvas border border-border text-[11px] font-mono text-muted/60">
                  <span className="w-3 h-3 flex items-center justify-center text-[10px]">—</span>
                  feature
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 space-y-2">
              <p className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-3 h-3" />
                Performance Tip
              </p>
              <p className="text-xs text-secondary leading-relaxed">
                Use the <code className="text-accent font-bold">void fetch(...)</code> pattern in Node.js to send telemetry without awaiting the response, ensuring zero impact on user latency.
              </p>
            </div>

            <div className="pt-4 border-t border-border">
              <Link href="/dashboard" className="w-full button-spring flex items-center justify-center gap-2 py-3 bg-surface border border-border hover:border-accent/20 rounded-lg text-sm font-semibold text-primary">
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
