"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, KeyRound, Route, Send, ShieldCheck } from "lucide-react";
import { CopyCodeBlock } from "@/components/CopyCodeBlock";
import { SkillsGuideActions } from "@/components/SkillsGuideActions";

export const dynamic = "force-dynamic";

export default function OnboardingPage() {
  const [origin, setOrigin] = useState("https://your-acost-domain.com");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const endpoint = useMemo(() => `${origin}/api/external/consume`, [origin]);

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
      inputTokens: 1100,
      outputTokens: 260,
      estimatedCost: 0.0022,
      latency: 920,
      createdAt: new Date().toISOString(),
    },
  }),
});`;

  const asyncSnippet = `void fetch(process.env.ACOST_BASE_URL!, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.ACOST_API_KEY!,
  },
  body: JSON.stringify({
    event: {
      userId: appUser.id,
      provider: llm.provider,
      model: llm.model,
      feature: "chat",
      inputTokens: usage.input,
      outputTokens: usage.output,
      estimatedCost: usage.cost,
      latency: usage.latency,
    },
  }),
}).catch((error) => {
  console.warn("Telemetry ingestion failed", error);
});`;

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface border border-border text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4">
            <Route className="w-3.5 h-3.5 text-accent" />
            Onboarding
          </span>
          <h1 className="text-4xl font-display font-semibold tracking-tight text-primary mb-2">
            Connect your app with the API base URL
          </h1>
          <p className="text-muted text-sm leading-relaxed">
            Use your API key and base URL to send telemetry directly from your
            backend. This onboarding flow replaces the previous SDK-based setup
            and is optimized for external app integration.
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-3">
          <SkillsGuideActions />
          <div className="flex gap-3">
            <Link
              href="/dashboard/keys"
              className="button-spring px-4 py-2.5 bg-surface hover:bg-elevated/40 border border-border text-secondary hover:text-primary rounded-md text-sm font-semibold"
            >
              Manage API Keys
            </Link>
            <Link
              href="/docs"
              className="button-spring px-4 py-2.5 bg-accent hover:opacity-90 text-canvas rounded-md text-sm font-semibold"
            >
              Open API Docs
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            icon: KeyRound,
            label: "Step 1",
            title: "Create a key",
            text: "Generate a workspace API key in the API Keys page.",
          },
          {
            icon: Route,
            label: "Step 2",
            title: "Set your base URL",
            text: "Store the external consume endpoint in your backend env vars.",
          },
          {
            icon: Send,
            label: "Step 3",
            title: "Send telemetry",
            text: "POST one event or a batch after each AI response.",
          },
          {
            icon: ShieldCheck,
            label: "Step 4",
            title: "Keep it async",
            text: "Send telemetry without blocking the user-facing request path.",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="fuser-card">
              <div className="flex justify-between items-center text-muted mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {item.label}
                </span>
                <div className="p-1.5 bg-canvas border border-border text-primary rounded-md">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-sm font-semibold text-primary mb-1">
                {item.title}
              </p>
              <p className="text-xs text-muted leading-relaxed">{item.text}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="fuser-card space-y-4">
          <div>
            <h2 className="text-2xl font-display font-semibold text-primary mb-2">
              1. Store environment variables
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Keep your ingestion target and secret key in server-side
              environment variables. Do not expose the key in the browser.
            </p>
          </div>
          <CopyCodeBlock title="Backend env" code={envSnippet} />
        </div>

        <div className="fuser-card space-y-4">
          <div>
            <h2 className="text-2xl font-display font-semibold text-primary mb-2">
              2. Send one event
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Send telemetry after you receive token usage, cost, and latency
              from your AI provider response.
            </p>
          </div>
          <CopyCodeBlock title="Single event request" code={requestSnippet} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="fuser-card space-y-4">
          <div>
            <h2 className="text-2xl font-display font-semibold text-primary mb-2">
              3. Keep telemetry non-blocking
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              If you want the safest UX, send telemetry in a fire-and-forget
              call or queue job so customer responses are never delayed.
            </p>
          </div>
          <CopyCodeBlock title="Async ingestion pattern" code={asyncSnippet} />
        </div>

        <div className="fuser-card space-y-4">
          <div>
            <h2 className="text-2xl font-display font-semibold text-primary mb-2">
              Required payload fields
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Every telemetry event must include these fields for external app
              ingestion to be accepted.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {["userId", "provider", "model", "feature"].map((field) => (
              <div
                key={field}
                className="px-3 py-2 rounded-md border border-border bg-canvas text-xs font-mono text-secondary"
              >
                {field}
              </div>
            ))}
          </div>
          <div className="rounded-md border border-border bg-canvas p-4 text-xs text-muted leading-relaxed">
            `userId`, `provider`, and `model` are required. `feature` is highly
            recommended for better analytics grouping.
          </div>
          <Link
            href="/docs"
            className="button-spring inline-flex items-center gap-2 px-4 py-2 bg-surface hover:bg-elevated/40 border border-border text-secondary hover:text-primary rounded-md text-sm font-semibold"
          >
            <span>Read full API docs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
