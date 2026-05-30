"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CopyCodeBlock } from "@/components/CopyCodeBlock";
import { RunDetailDrawer } from "./components/RunDetailDrawer";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Activity,
  DollarSign,
  Cpu,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
  Zap,
  RefreshCw,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface DashboardData {
  summary: {
    requests: number;
    cost: number;
    avgLatency: number;
    inputTokens: number;
    outputTokens: number;
  };
  charts: Array<{
    date: string;
    cost: number;
    requests: number;
    tokens: number;
  }>;
  models: Array<{ model: string; requests: number; cost: number }>;
  events: Array<{
    id: string;
    feature: string;
    model: string;
    input_tokens: number;
    output_tokens: number;
    estimated_cost: number;
    latency: number;
    created_at: string;
    prompt: string | null;
    response_content: string | null;
    raw_response: Record<string, unknown> | null;
  }>;
}

interface AIInsightsData {
  summary: string;
  insights: Array<{ text: string; priority: "high" | "medium" | "low" }>;
  recommendations: string[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [insights, setInsights] = useState<AIInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [copiedSdk, setCopiedSdk] = useState(false);
  const [copiedInit, setCopiedInit] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [origin, setOrigin] = useState("https://your-acost-domain.com");
  const [selectedEvent, setSelectedEvent] = useState<
    DashboardData["events"][0] | null
  >(null);

  useEffect(() => {
    setMounted(true);
    setOrigin(window.location.origin);
    fetchDashboardData();
    fetchAIInsights();

    // Refresh dashboard stats every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard");
      const result = await response.json();
      if (result) {
        setData(result);
      }
    } catch (err) {
      console.error("Failed to load dashboard statistics", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIInsights = async () => {
    setLoadingInsights(true);
    try {
      const response = await fetch("/api/dashboard/insights");
      const result = await response.json();
      if (result && !result.error) {
        setInsights(result);
      }
    } catch (err) {
      console.error("Failed to load AI insights", err);
    } finally {
      setLoadingInsights(false);
    }
  };

  const copyText = (text: string, type: "sdk" | "init") => {
    navigator.clipboard.writeText(text);
    if (type === "sdk") {
      setCopiedSdk(true);
      setTimeout(() => setCopiedSdk(false), 2000);
    } else {
      setCopiedInit(true);
      setTimeout(() => setCopiedInit(false), 2000);
    }
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}k`;
    return tokens.toString();
  };

  const formatCost = (cost: number) => {
    if (cost === 0) return "$0.00";
    if (cost < 0.01) return `$${cost.toFixed(6)}`;
    return `$${cost.toFixed(2)}`;
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const hasEvents = data && data.summary.requests > 0;

  // Custom Fuser orange palette distributions
  const BAR_COLORS = [
    "var(--accent-color)",
    "var(--text-secondary)",
    "var(--text-muted)",
    "var(--border-color-strong)",
    "var(--border-color)",
  ];

  const baseUrlCode = `ACOST_BASE_URL=${origin}/api/external/consume
ACOST_API_KEY=acost_your_secret_key`;
  const requestCode = `await fetch(process.env.ACOST_BASE_URL!, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.ACOST_API_KEY!,
  },
  body: JSON.stringify({
    event: {
      userId: "user_98231",
      provider: "openai",
      model: "gpt-4o-mini",
      feature: "user-onboarding",
      prompt: "Create a short onboarding checklist for a new user.",
      inputTokens: 900,
      outputTokens: 240,
      estimatedCost: 0.00192,
      latency: 710,
    },
  }),
});`;

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-semibold tracking-tight text-primary mb-2">
            Cost Analytics
          </h1>
          <p className="text-muted text-sm leading-relaxed max-w-lg">
            Real-time financial visibility and pricing breakdowns of active AI
            workloads.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="button-spring px-4 py-2 bg-surface hover:bg-elevated/40 border border-border text-secondary hover:text-primary rounded-md text-xs font-semibold shadow-sm"
        >
          Refresh Feed
        </button>
      </div>

      {/* KPI CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Cost */}
        <div className="fuser-card relative overflow-hidden group">
          <div className="flex justify-between items-center text-muted mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Total Cost
            </span>
            <div className="p-2 bg-canvas border border-border text-primary rounded-md">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-display font-semibold text-primary tracking-tight">
            {data ? formatCost(data.summary.cost) : "$0.00"}
          </p>
          <p className="text-xs text-muted mt-2 font-medium">
            Accumulated expenses
          </p>
        </div>

        {/* Total Requests */}
        <div className="fuser-card relative overflow-hidden group">
          <div className="flex justify-between items-center text-muted mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Requests
            </span>
            <div className="p-2 bg-canvas border border-border text-primary rounded-md">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-display font-semibold text-primary tracking-tight">
            {data ? data.summary.requests.toLocaleString() : "0"}
          </p>
          <p className="text-xs text-muted mt-2 font-medium">
            Logged executions
          </p>
        </div>

        {/* Avg Latency */}
        <div className="fuser-card relative overflow-hidden group">
          <div className="flex justify-between items-center text-muted mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Avg Latency
            </span>
            <div className="p-2 bg-canvas border border-border text-primary rounded-md">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-display font-semibold text-primary tracking-tight">
            {data && data.summary.avgLatency
              ? `${data.summary.avgLatency}ms`
              : "0ms"}
          </p>
          <p className="text-xs text-muted mt-2 font-medium">
            Turnaround speed
          </p>
        </div>

        {/* Total Tokens */}
        <div className="fuser-card relative overflow-hidden group">
          <div className="flex justify-between items-center text-muted mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Total Tokens
            </span>
            <div className="p-2 bg-canvas border border-border text-primary rounded-md">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-display font-semibold text-primary tracking-tight">
            {data
              ? formatTokens(
                data.summary.inputTokens + data.summary.outputTokens,
              )
              : "0"}
          </p>
          <p className="text-xs text-muted mt-2 font-medium">
            {data
              ? `${formatTokens(data.summary.inputTokens)} in / ${formatTokens(
                data.summary.outputTokens,
              )} out`
              : "0 / 0"}
          </p>
        </div>
      </div>

      {/* PIPELINE EMPTY STATE: Instruction Setup */}
      {!hasEvents ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mt-6">
          <div className="fuser-card md:col-span-2 flex flex-col justify-center">
            <div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-6 text-accent">
              <Layers className="w-5 h-5 animate-pulse" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-primary mb-3">
              Telemetry pipeline awaiting data
            </h2>
            <p className="text-muted text-sm leading-relaxed mb-6 max-w-lg">
              Your telemetry endpoint is active. Connect your backend using the
              API base URL and workspace key to begin streaming provider, model,
              token, and cost data into this dashboard.
            </p>

            <div className="space-y-4">
              <CopyCodeBlock
                title="1. Store your base URL and API key"
                code={baseUrlCode}
              />
              <CopyCodeBlock
                title="2. Send telemetry from your backend"
                code={requestCode}
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/dashboard/onboarding"
                className="button-spring inline-flex items-center gap-2 px-4 py-2 bg-accent hover:opacity-90 text-canvas rounded-md text-sm font-semibold"
              >
                <span>Open Onboarding</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/docs"
                className="button-spring inline-flex items-center gap-2 px-4 py-2 bg-surface hover:bg-elevated/40 border border-border text-secondary hover:text-primary rounded-md text-sm font-semibold"
              >
                <span>Read API Docs</span>
              </Link>
            </div>
          </div>

          <div className="fuser-card md:col-span-1 bg-elevated/30 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted bg-canvas border border-border px-2 py-0.5 rounded-full tracking-widest">
                Developer Note
              </span>
              <h3 className="text-xl font-display font-semibold text-primary mt-4 mb-2">
                Integration Notes
              </h3>
              <p className="text-muted text-xs leading-relaxed mb-4">
                Send telemetry from your server after your AI request finishes.
                Keep it asynchronous or push it into a job queue so user-facing
                latency stays clean and predictable.
              </p>
            </div>

            <div className="border-t border-border pt-6 space-y-3.5">
              <div className="flex gap-3 text-xs">
                <span className="w-5 h-5 rounded-full bg-canvas border border-border text-primary font-semibold flex items-center justify-center shrink-0">
                  ✓
                </span>
                <span className="text-muted">
                  No SDK or proxy required
                </span>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="w-5 h-5 rounded-full bg-canvas border border-border text-primary font-semibold flex items-center justify-center shrink-0">
                  ✓
                </span>
                <span className="text-muted">
                  Supports single event or batch ingestion
                </span>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="w-5 h-5 rounded-full bg-canvas border border-border text-primary font-semibold flex items-center justify-center shrink-0">
                  ✓
                </span>
                <span className="text-muted">
                  Works across OpenAI, Anthropic, Gemini, and more
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // DASHBOARD WITH REAL STREAMING TELEMETRY DATA
        <div className="space-y-8">
          {/* AI INSIGHTS PANEL */}
          <div className="fuser-card bg-gradient-to-br from-surface to-elevated/20 border-accent/20">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-semibold text-primary">
                    AI Intelligence
                  </h2>
                  <p className="text-xs text-muted">
                    Automated cost analysis and profitability recommendations.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/insights"
                  className="text-[10px] font-bold uppercase tracking-wider text-muted hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  View Full Report
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <div className="w-px h-3 bg-border" />
                <button
                  onClick={fetchAIInsights}
                  disabled={loadingInsights}
                  className="text-[10px] font-bold uppercase tracking-wider text-muted hover:text-accent transition-colors disabled:opacity-50"
                >
                  {loadingInsights ? "Analyzing..." : "Regenerate"}
                </button>
              </div>
            </div>

            {loadingInsights && !insights ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-border/50 rounded w-3/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="h-24 bg-border/30 rounded-xl"></div>
                  <div className="h-24 bg-border/30 rounded-xl"></div>
                  <div className="h-24 bg-border/30 rounded-xl"></div>
                </div>
              </div>
            ) : insights ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insights.insights.slice(0, 3).map((insight, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-canvas/40 border border-border rounded-xl space-y-3 relative group hover:border-accent/30 transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <div
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${insight.priority === "high"
                          ? "bg-red-500/10 text-red-500 border-red-500/20"
                          : insight.priority === "medium"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          }`}
                      >
                        {insight.priority}
                      </div>
                      <span className="text-[10px] font-mono text-muted">
                        #0{idx + 1}
                      </span>
                    </div>
                    <p className="text-sm text-secondary leading-relaxed group-hover:text-primary transition-colors">
                      {insight.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-border rounded-xl">
                <p className="text-sm text-muted">
                  No insights generated yet. Click regenerate to analyze your
                  data.
                </p>
              </div>
            )}
          </div>

          {/* VISUAL CHARTS PANEL */}
          {mounted && data && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Cost over time area chart */}
              <div className="fuser-card md:col-span-2 min-h-[340px] flex flex-col justify-between">
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted mb-4">
                  Expense Trend
                </h2>
                <div className="flex-1 w-full min-h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.charts}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorCost"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--accent-color)"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--accent-color)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border-color-strong)"
                        opacity={0.15}
                      />
                      <XAxis
                        dataKey="date"
                        stroke="var(--text-muted)"
                        fontSize={10}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="var(--text-muted)"
                        fontSize={10}
                        tickLine={false}
                        tickFormatter={(val) => `$${val}`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--bg-surface)",
                          borderColor: "var(--border-color)",
                          borderRadius: "6px",
                        }}
                        labelStyle={{
                          color: "var(--text-primary)",
                          fontWeight: "600",
                          fontSize: "12px",
                          marginBottom: "4px",
                        }}
                        itemStyle={{
                          color: "var(--accent-color)",
                          fontSize: "12px",
                        }}
                        formatter={(val: any) => [
                          `$${Number(val).toFixed(4)}`,
                          "Cost",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="cost"
                        stroke="var(--accent-color)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCost)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Model cost pie chart */}
              <div className="fuser-card md:col-span-1 min-h-[340px] flex flex-col">
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted mb-6">
                  Model Distribution
                </h2>

                {data.models.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-muted text-xs">
                    No distribution metrics yet.
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="h-[180px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.models}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="cost"
                            nameKey="model"
                            stroke="none"
                          >
                            {data.models.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={BAR_COLORS[index % BAR_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: "var(--bg-surface)",
                              borderColor: "var(--border-color)",
                              borderRadius: "6px",
                            }}
                            itemStyle={{ fontSize: "12px" }}
                            formatter={(val: any, name: string) => [
                              `$${Number(val).toFixed(4)}`,
                              name,
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Custom List Legend */}
                    <div className="mt-4 space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                      {data.models
                        .sort((a, b) => b.cost - a.cost)
                        .map((entry, index) => {
                          const totalCost = data.models.reduce((sum, m) => sum + m.cost, 0);
                          const percentage = ((entry.cost / totalCost) * 100).toFixed(1);
                          return (
                            <div key={entry.model} className="flex items-center justify-between group">
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: BAR_COLORS[data.models.indexOf(entry) % BAR_COLORS.length] }}
                                />
                                <span className="text-[10px] font-semibold text-secondary truncate uppercase tracking-wider group-hover:text-primary transition-colors">
                                  {entry.model}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                <span className="text-[10px] font-mono text-muted">{percentage}%</span>
                                <span className="text-[10px] font-mono font-bold text-primary">${entry.cost.toFixed(4)}</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RECENT EVENTS TELEMETRY LOGGER */}
          <div className="fuser-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Recent Ingestions
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted text-[10px] font-bold uppercase tracking-wider">
                    <th className="pb-3.5 pl-2">Feature Tag</th>
                    <th className="pb-3.5">Model</th>
                    <th className="pb-3.5">Tokens (in + out)</th>
                    <th className="pb-3.5">Latency</th>
                    <th className="pb-3.5">Estimated Cost</th>
                    <th className="pb-3.5">Logged</th>
                    <th className="pb-3.5 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data?.events.slice(0, 5).map((event) => (
                    <tr
                      key={event.id}
                      className="text-secondary group hover:bg-elevated/20 cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <td className="py-4 pl-2 font-medium">
                        <span className="font-mono text-xs bg-accent-wash text-accent border border-accent/10 px-2 py-0.5 rounded-full">
                          {event.feature}
                        </span>
                      </td>
                      <td className="py-4 text-xs font-semibold text-primary">
                        {event.model}
                      </td>
                      <td className="py-4 text-xs text-muted">
                        {event.input_tokens + event.output_tokens}{" "}
                        <span className="text-[10px] text-muted/80">
                          ({event.input_tokens} + {event.output_tokens})
                        </span>
                      </td>
                      <td className="py-4 text-xs text-muted font-mono">
                        {event.latency}ms
                      </td>
                      <td className="py-4 text-xs text-primary font-mono font-semibold">
                        {formatCost(event.estimated_cost)}
                      </td>
                      <td className="py-4 text-xs text-muted">
                        {new Date(event.created_at).toLocaleTimeString()}
                      </td>
                      <td className="py-4 text-right pr-2">
                        <span className="inline-flex button-spring items-center gap-2 px-4 py-2 bg-surface group-hover:text-accent border border-border rounded-md  text-secondary group-hover:bg-accent/10 transition-colors">
                          View
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(data?.events.length ?? 0) > 5 && (
              <div className="mt-4 pt-4 border-t border-border flex justify-center">
                <Link
                  href="/dashboard/logs"
                  className="button-spring flex items-center gap-2 px-4 py-2 bg-surface hover:bg-elevated/40 border border-border text-secondary hover:text-primary rounded-md text-xs font-semibold"
                >
                  <span>View All Logs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      <RunDetailDrawer
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
