import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Cpu,
  KeyRound,
  Route,
  ShieldCheck,
} from "lucide-react";

export default function Home() {
  const featureCards = [
    {
      icon: Activity,
      title: "Track every AI request",
      description:
        "Capture provider, model, tokens, cost, latency, and feature-level usage from your backend.",
    },
    {
      icon: BarChart3,
      title: "See cost analytics clearly",
      description:
        "Understand total spend, request volume, model distribution, and recent telemetry in one dashboard.",
    },
    {
      icon: KeyRound,
      title: "Use simple API keys",
      description:
        "Generate workspace keys and connect external apps without proxying or changing your architecture.",
    },
    {
      icon: ShieldCheck,
      title: "Keep production safe",
      description:
        "Send telemetry asynchronously so your user-facing requests stay fast even if ingestion fails.",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Create a workspace key",
      description:
        "Generate an API key for your app and keep it in server-side environment variables.",
    },
    {
      step: "02",
      title: "Connect your backend",
      description:
        "Send telemetry to the API base URL after each AI response using your existing provider client.",
    },
    {
      step: "03",
      title: "Monitor real usage",
      description:
        "Open the dashboard to see costs, tokens, latency, logs, and model activity in real time.",
    },
  ];

  return (
    <main className="min-h-screen relative overflow-hidden bg-canvas">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 md:py-16">
        <section className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-10 items-center min-h-[75vh]">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-surface border border-border text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
              <Cpu className="w-3.5 h-3.5 text-accent" />
              AI Cost Tracker
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-semibold tracking-tight text-primary mb-5 leading-[1.05]">
              Financial visibility for
              <span className="italic block mt-2">AI products.</span>
            </h1>
            <p className="text-muted text-lg md:text-xl max-w-xl leading-relaxed mb-8">
              acost helps teams track AI usage, monitor model costs, and
              understand feature-level economics with API-first telemetry and a
              clean analytics dashboard.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <Link
                href="/signup"
                className="button-spring inline-flex items-center gap-2 px-6 py-3 bg-accent hover:opacity-90 text-canvas font-semibold rounded-md text-sm shadow-md"
              >
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/docs"
                className="button-spring px-6 py-3 bg-surface hover:bg-elevated/40 text-secondary hover:text-primary font-semibold rounded-md text-sm border border-border"
              >
                API Docs
              </Link>
              <Link
                href="/login"
                className="button-spring px-6 py-3 bg-surface hover:bg-elevated/40 text-secondary hover:text-primary font-semibold rounded-md text-sm border border-border"
              >
                Sign In
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                "Track provider and model usage",
                "Measure tokens, cost, and latency",
                "Integrate with a simple API base URL",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-secondary shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="fuser-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                    Live Overview
                  </p>
                  <h2 className="text-2xl font-display font-semibold text-primary">
                    AI cost intelligence dashboard
                  </h2>
                </div>
                <div className="rounded-lg border border-border bg-canvas p-2 text-primary">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  { label: "Requests", value: "18,492" },
                  { label: "Total Cost", value: "$482.19" },
                  { label: "Avg Latency", value: "842ms" },
                  { label: "Tracked Models", value: "7" },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-xl border border-border bg-canvas px-4 py-4"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                      {card.label}
                    </p>
                    <p className="text-2xl font-display font-semibold text-primary">
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-border bg-canvas p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-3">
                  Recent Insight
                </p>
                <p className="text-sm text-secondary leading-relaxed">
                  `chat-answer` is your highest-cost feature this week, driven by
                  `gpt-4o` usage and long prompts. Move short requests to a
                  cheaper model to improve margins.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/dashboard/onboarding"
                className="fuser-card block button-spring hover:bg-elevated/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <Route className="w-5 h-5 text-primary" />
                  <ArrowRight className="w-4 h-4 text-muted" />
                </div>
                <h3 className="text-lg font-display font-semibold text-primary mb-1">
                  Onboarding
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  Learn how to connect your codebase using the external consume
                  API.
                </p>
              </Link>
              <Link
                href="/docs"
                className="fuser-card block button-spring hover:bg-elevated/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <ArrowRight className="w-4 h-4 text-muted" />
                </div>
                <h3 className="text-lg font-display font-semibold text-primary mb-1">
                  API Docs
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  Copy ready-to-use examples, request payloads, and integration
                  guides.
                </p>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-8 md:py-12 space-y-6 animate-fade-in delay-100">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
              Why acost
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-primary mb-3">
              Built for product teams that need real AI cost clarity
            </h2>
            <p className="text-muted text-base leading-relaxed">
              Most provider dashboards only show total spend. acost connects AI
              requests to features, users, models, and usage patterns so teams
              can understand where margins are gained or lost.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="fuser-card">
                  <div className="w-10 h-10 rounded-lg bg-canvas border border-border flex items-center justify-center text-primary mb-4">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="py-8 md:py-12 animate-fade-in delay-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="fuser-card">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
                Product Showcase
              </p>
              <h2 className="text-3xl font-display font-semibold text-primary mb-4">
                What the platform helps you answer
              </h2>
              <div className="space-y-3 text-sm">
                {[
                  "Which features generate the most AI cost?",
                  "Which models are overused for simple requests?",
                  "Which users or tenants create margin pressure?",
                  "How much latency and token usage does each feature create?",
                ].map((question) => (
                  <div
                    key={question}
                    className="rounded-xl border border-border bg-canvas px-4 py-3 text-secondary"
                  >
                    {question}
                  </div>
                ))}
              </div>
            </div>

            <div className="fuser-card">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
                Integration Flow
              </p>
              <h2 className="text-3xl font-display font-semibold text-primary mb-4">
                Start in minutes
              </h2>
              <div className="space-y-4">
                {steps.map((item) => (
                  <div
                    key={item.step}
                    className="rounded-xl border border-border bg-canvas px-4 py-4"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                      Step {item.step}
                    </div>
                    <h3 className="text-lg font-display font-semibold text-primary mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 md:py-12 animate-fade-in delay-300">
          <div className="fuser-card flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
                Ready To Integrate
              </p>
              <h2 className="text-3xl font-display font-semibold text-primary mb-2">
                Connect your AI product and start tracking real usage
              </h2>
              <p className="text-sm text-muted leading-relaxed">
                Use the onboarding flow, copy integration snippets from the docs,
                and send telemetry from your backend with your workspace API key.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/onboarding"
                className="button-spring inline-flex items-center gap-2 px-5 py-3 bg-accent hover:opacity-90 text-canvas font-semibold rounded-md text-sm"
              >
                <span>Open Onboarding</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/docs"
                className="button-spring px-5 py-3 bg-surface hover:bg-elevated/40 border border-border text-secondary hover:text-primary font-semibold rounded-md text-sm"
              >
                Read API Docs
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
