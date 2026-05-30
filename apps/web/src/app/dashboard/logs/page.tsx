"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Search,
  Filter,
  X,
  Eye,
  DollarSign,
  Activity,
  Clock,
  Cpu,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ScrollText,
  SlidersHorizontal,
} from "lucide-react";
import { RunDetailDrawer } from "../components/RunDetailDrawer";
import { LogsSkeleton } from "../components/LogsSkeleton";

/* ─── Types ─── */
interface LogEvent {
  id: string;
  feature: string;
  model: string;
  provider: string;
  input_tokens: number;
  output_tokens: number;
  estimated_cost: number;
  latency: number;
  user_id: string | null;
  created_at: string;
  prompt: string | null;
  response_content: string | null;
  raw_response: Record<string, unknown> | null;
}

interface LogsResponse {
  events: LogEvent[];
  total: number;
  page: number;
  limit: number;
  stats: {
    totalRequests: number;
    totalCost: number;
    avgLatency: number;
    totalTokens: number;
  };
  filterOptions: {
    models: string[];
    providers: string[];
    features: string[];
  };
}

/* ─── Helpers ─── */
const formatCost = (cost: number) => {
  if (cost === 0) return "$0.00";
  if (cost < 0.01) return `$${cost.toFixed(6)}`;
  return `$${cost.toFixed(4)}`;
};

const formatTokens = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
};

const LIMIT = 25;

/* ─── Component ─── */
export default function LogsPage() {
  const [data, setData] = useState<LogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<LogEvent | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterModel, setFilterModel] = useState("");
  const [filterProvider, setFilterProvider] = useState("");
  const [filterFeature, setFilterFeature] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterHasLogs, setFilterHasLogs] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildParams = useCallback(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("limit", String(LIMIT));
    if (search) p.set("search", search);
    if (filterModel) p.set("model", filterModel);
    if (filterProvider) p.set("provider", filterProvider);
    if (filterFeature) p.set("feature", filterFeature);
    if (filterDateFrom) p.set("dateFrom", filterDateFrom);
    if (filterDateTo) p.set("dateTo", filterDateTo);
    if (filterHasLogs) p.set("hasLogs", "true");
    return p.toString();
  }, [
    page,
    search,
    filterModel,
    filterProvider,
    filterFeature,
    filterDateFrom,
    filterDateTo,
    filterHasLogs,
  ]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/logs?${buildParams()}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [buildParams]);

  // Debounce search input, immediate for other filters
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchLogs();
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  useEffect(() => {
    setPage(1);
    fetchLogs();
  }, [
    filterModel,
    filterProvider,
    filterFeature,
    filterDateFrom,
    filterDateTo,
    filterHasLogs,
  ]);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const clearFilters = () => {
    setSearch("");
    setFilterModel("");
    setFilterProvider("");
    setFilterFeature("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterHasLogs(false);
    setPage(1);
  };

  const hasActiveFilters =
    search ||
    filterModel ||
    filterProvider ||
    filterFeature ||
    filterDateFrom ||
    filterDateTo ||
    filterHasLogs;

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;

  // Show skeleton only on the very first load — subsequent filter/page changes
  // use the inline table loading state so the search bar stays interactive.
  if (isInitialLoad && loading) {
    return <LogsSkeleton />;
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-display font-semibold tracking-tight text-primary mb-2">
            Logs
          </h1>
          <p className="text-muted text-sm leading-relaxed max-w-lg">
            Full history of every tracked LLM call. Search, filter, and inspect
            run details.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="button-spring flex items-center gap-2 px-4 py-2 bg-surface hover:bg-elevated/40 border border-border text-secondary hover:text-primary rounded-md text-xs font-semibold shadow-sm disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: Activity,
            label: "Matching Requests",
            value: data?.stats.totalRequests.toLocaleString() ?? "—",
            sub: `of ${data?.total.toLocaleString() ?? "—"} total`,
          },
          {
            icon: DollarSign,
            label: "Total Cost",
            value: data ? formatCost(data.stats.totalCost) : "—",
            sub: "accumulated",
          },
          {
            icon: Clock,
            label: "Avg Latency",
            value: data ? `${data.stats.avgLatency}ms` : "—",
            sub: "per request",
          },
          {
            icon: Cpu,
            label: "Total Tokens",
            value: data ? formatTokens(data.stats.totalTokens) : "—",
            sub: "in + out",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="fuser-card">
              <div className="flex justify-between items-center text-muted mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {card.label}
                </span>
                <div className="p-1.5 bg-canvas border border-border text-primary rounded-md">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-display font-semibold text-primary tracking-tight">
                {card.value}
              </p>
              <p className="text-[10px] text-muted mt-1 font-medium">
                {card.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search + Filter Bar */}
      <div className="fuser-card space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search feature, model, provider, user ID…"
              className="w-full pl-9 pr-4 py-2.5 bg-canvas border border-border rounded-md text-primary placeholder-zinc-500 text-sm focus:outline-none focus:border-accent transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Toggle filters */}
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-md text-xs font-semibold transition-colors ${
              showFilters || (hasActiveFilters && !search)
                ? "bg-accent/10 border-accent/30 text-accent"
                : "bg-canvas border-border text-muted hover:text-primary"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {hasActiveFilters && (
              <span className="w-4 h-4 rounded-full bg-accent text-canvas text-[9px] font-bold flex items-center justify-center">
                {
                  [
                    filterModel,
                    filterProvider,
                    filterFeature,
                    filterDateFrom,
                    filterDateTo,
                    filterHasLogs,
                  ].filter(Boolean).length
                }
              </span>
            )}
          </button>

          {/* Has run logs toggle */}
          <button
            onClick={() => setFilterHasLogs((p) => !p)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-md text-xs font-semibold transition-colors ${
              filterHasLogs
                ? "bg-accent/10 border-accent/30 text-accent"
                : "bg-canvas border-border text-muted hover:text-primary"
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            Has Run Details
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-muted hover:text-red-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear all
            </button>
          )}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-border">
            {/* Model */}
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
                Model
              </label>
              <select
                value={filterModel}
                onChange={(e) => setFilterModel(e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-border rounded-md text-primary text-xs focus:outline-none focus:border-accent transition-colors cursor-pointer"
              >
                <option value="">All models</option>
                {data?.filterOptions.models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Provider */}
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
                Provider
              </label>
              <select
                value={filterProvider}
                onChange={(e) => setFilterProvider(e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-border rounded-md text-primary text-xs focus:outline-none focus:border-accent transition-colors cursor-pointer"
              >
                <option value="">All providers</option>
                {data?.filterOptions.providers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Feature */}
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
                Feature Tag
              </label>
              <select
                value={filterFeature}
                onChange={(e) => setFilterFeature(e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-border rounded-md text-primary text-xs focus:outline-none focus:border-accent transition-colors cursor-pointer"
              >
                <option value="">All features</option>
                {data?.filterOptions.features.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
                From Date
              </label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-border rounded-md text-primary text-xs focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
                To Date
              </label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-border rounded-md text-primary text-xs focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="fuser-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted">
            {loading
              ? "Loading…"
              : `${data?.total.toLocaleString() ?? 0} events`}
          </h2>
          {data && data.total > 0 && (
            <span className="text-[10px] text-muted">
              Page {page} of {totalPages}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-muted text-sm">
            <RefreshCw className="w-4 h-4 animate-spin text-accent" />
            <span>Loading logs…</span>
          </div>
        ) : !data?.events.length ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <Filter className="w-8 h-8 text-muted/30" />
            <p className="text-sm text-muted">No events match your filters.</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-accent hover:underline font-semibold"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted text-[10px] font-bold uppercase tracking-wider">
                  <th className="pb-3.5 pl-2">Feature</th>
                  <th className="pb-3.5">Model</th>
                  <th className="pb-3.5">Provider</th>
                  <th className="pb-3.5">Tokens</th>
                  <th className="pb-3.5">Latency</th>
                  <th className="pb-3.5">Cost</th>
                  <th className="pb-3.5">User</th>
                  <th className="pb-3.5">Logged</th>
                  <th className="pb-3.5 text-right pr-2">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data.events.map((event) => (
                  <tr
                    key={event.id}
                    className="text-secondary group hover:bg-elevated/20 cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <td className="py-3.5 pl-2">
                      <span className="font-mono text-xs bg-accent-wash text-accent border border-accent/10 px-2 py-0.5 rounded-full">
                        {event.feature}
                      </span>
                    </td>
                    <td className="py-3.5 text-xs font-semibold text-primary max-w-[140px] truncate">
                      {event.model}
                    </td>
                    <td className="py-3.5 text-xs text-muted capitalize">
                      {event.provider}
                    </td>
                    <td className="py-3.5 text-xs text-muted font-mono">
                      {formatTokens(event.input_tokens + event.output_tokens)}
                      <span className="text-[10px] text-muted/70 ml-1">
                        ({event.input_tokens}+{event.output_tokens})
                      </span>
                    </td>
                    <td className="py-3.5 text-xs text-muted font-mono">
                      {event.latency}ms
                    </td>
                    <td className="py-3.5 text-xs text-primary font-mono font-semibold">
                      {formatCost(event.estimated_cost)}
                    </td>
                    <td className="py-3.5 text-xs text-muted font-mono max-w-[100px] truncate">
                      {event.user_id ?? (
                        <span className="text-muted/40 italic">—</span>
                      )}
                    </td>
                    <td className="py-3.5 text-xs text-muted whitespace-nowrap">
                      {new Date(event.created_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-md text-muted group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <span className="text-xs text-muted">
              Showing {(page - 1) * LIMIT + 1}–
              {Math.min(page * LIMIT, data?.total ?? 0)} of{" "}
              {data?.total.toLocaleString()} events
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-canvas border border-border rounded-md text-xs font-semibold text-muted hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Prev
              </button>
              <span className="text-xs text-muted px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-canvas border border-border rounded-md text-xs font-semibold text-muted hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <RunDetailDrawer
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
