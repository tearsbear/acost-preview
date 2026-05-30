import Link from "next/link";
import { ArrowRight, BookOpen, KeyRound, Send, ShieldCheck } from "lucide-react";
import { CopyCodeBlock } from "@/components/CopyCodeBlock";
import { SkillsGuideActions } from "@/components/SkillsGuideActions";

export default function DocsPage() {
  const endpoint = "https://your-acost-domain.com/api/external/consume";

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
      },
    ],
  }),
});`;

  return (
    <main className="min-h-screen bg-canvas text-primary">
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-surface border border-border text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider mb-5">
              <BookOpen className="w-3.5 h-3.5 text-accent" />
              API Docs
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight mb-3">
              Integrate acost with a base URL and API key.
            </h1>
            <p className="text-muted text-sm md:text-base leading-relaxed max-w-2xl">
              Send telemetry directly from your backend to the acost ingestion
              API. No SDK is required. Post one event or a batch of events and
              the dashboard will track cost, tokens, latency, provider, and
              model usage.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-3">
            <SkillsGuideActions />
            <div className="flex gap-3">
            <Link
              href="/signup"
              className="button-spring px-5 py-3 bg-accent hover:opacity-90 text-canvas font-semibold rounded-md text-sm shadow-md"
            >
              Create Account
            </Link>
            <Link
              href="/dashboard/onboarding"
              className="button-spring px-5 py-3 bg-surface hover:bg-elevated/40 text-secondary hover:text-primary font-semibold rounded-md text-sm border border-border"
            >
              Open Onboarding
            </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              icon: Send,
              title: "Endpoint",
              text: "POST /api/external/consume",
            },
            {
              icon: KeyRound,
              title: "Auth",
              text: "Header x-api-key: acost_...",
            },
            {
              icon: ShieldCheck,
              title: "Required Fields",
              text: "userId, provider, model",
            },
            {
              icon: BookOpen,
              title: "Payload Shapes",
              text: "event or events[]",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="fuser-card">
                <div className="flex justify-between items-center text-muted mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {item.title}
                  </span>
                  <div className="p-1.5 bg-canvas border border-border text-primary rounded-md">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-primary leading-relaxed">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="fuser-card space-y-5">
            <div>
              <h2 className="text-2xl font-display font-semibold mb-2">
                Quick Start
              </h2>
              <p className="text-sm text-muted leading-relaxed">
                Create an API key, store your base URL and secret in environment
                variables, then send telemetry from your backend after each AI
                request completes.
              </p>
            </div>
            <CopyCodeBlock title="Environment Variables" code={envCode} />
            <CopyCodeBlock title="cURL Example" code={curlCode} />
          </div>

          <div className="fuser-card space-y-5">
            <div>
              <h2 className="text-2xl font-display font-semibold mb-2">
                Request Contract
              </h2>
              <p className="text-sm text-muted leading-relaxed">
                Every event must include `userId`, `provider`, and `model`.
                `feature` is recommended and defaults to `external-app` if you
                omit it.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "userId or user",
                "provider",
                "model",
                "feature",
                "inputTokens",
                "outputTokens",
                "estimatedCost",
                "latency",
                "createdAt",
                "prompt",
                "responseContent",
                "rawResponse",
              ].map((field) => (
                <div
                  key={field}
                  className="px-3 py-2 rounded-md border border-border bg-canvas text-xs font-mono text-secondary"
                >
                  {field}
                </div>
              ))}
            </div>
            <div className="p-4 rounded-md border border-border bg-canvas text-xs text-muted leading-relaxed">
              Use `event` for one request or `events` for a batch. Batches accept
              up to `100` events per request.
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="fuser-card">
            <CopyCodeBlock title="Backend fetch()" code={fetchCode} />
          </div>
          <div className="fuser-card">
            <CopyCodeBlock title="Batch ingestion" code={batchCode} />
          </div>
        </section>

        <section className="fuser-card space-y-4">
          <h2 className="text-2xl font-display font-semibold">Responses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-md border border-border bg-canvas p-4">
              <p className="font-semibold text-primary mb-1">`200 OK`</p>
              <p className="text-muted leading-relaxed">
                Event or batch is accepted and written to telemetry storage.
              </p>
            </div>
            <div className="rounded-md border border-border bg-canvas p-4">
              <p className="font-semibold text-primary mb-1">`400 Bad Request`</p>
              <p className="text-muted leading-relaxed">
                Payload is invalid or one of the required fields is missing.
              </p>
            </div>
            <div className="rounded-md border border-border bg-canvas p-4">
              <p className="font-semibold text-primary mb-1">`401 Unauthorized`</p>
              <p className="text-muted leading-relaxed">
                API key is missing or invalid for the selected workspace.
              </p>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/onboarding"
            className="button-spring inline-flex items-center gap-2 px-4 py-2 bg-accent hover:opacity-90 text-canvas font-semibold rounded-md text-sm"
          >
            <span>Continue to Onboarding</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="button-spring inline-flex items-center gap-2 px-4 py-2 bg-surface hover:bg-elevated/40 border border-border text-secondary hover:text-primary font-semibold rounded-md text-sm"
          >
            <span>Open Dashboard</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
