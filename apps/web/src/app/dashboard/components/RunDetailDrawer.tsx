"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  MessageSquare,
  Cpu,
  Braces,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Info,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { type Event as DashboardEvent } from "./EventsTable";

interface RunDetailDrawerProps {
  event: DashboardEvent | null; // null = closed
  onClose: () => void;
}

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

export function RunDetailDrawer({ event, onClose }: RunDetailDrawerProps) {
  const isOpen = event !== null;

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [rawExpanded, setRawExpanded] = useState(true);
  const [isBrowser, setIsBrowser] = useState(false);

  // Recommendation state
  const [recommendation, setRecommendation] = useState<string | null>(
    event?.ai_recommendation || null,
  );
  const [loadingRecommend, setLoadingRecommend] = useState(false);
  const [syncingRecommendation, setSyncingRecommendation] = useState(false);

  // Only enable portal on client
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const syncRecommendation = async (id: string) => {
    try {
      setSyncingRecommendation(true);
      const res = await fetch(`/api/logs/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.ai_recommendation) {
          setRecommendation(data.ai_recommendation);
        }
      }
    } catch (err) {
      console.error("Failed to sync recommendation", err);
    } finally {
      setSyncingRecommendation(false);
    }
  };

  // Mount/unmount with animation timing — same double-RAF pattern as ResultsModal
  useEffect(() => {
    if (isOpen && event) {
      setMounted(true);
      setRawExpanded(true);
      
      // Initialize with prop value
      setRecommendation(event.ai_recommendation || null);
      
      // If no recommendation in prop, check server for latest
      if (!event.ai_recommendation) {
        syncRecommendation(event.id);
      }

      document.body.style.overflow = "hidden";
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      document.body.style.overflow = "";
      const t = setTimeout(() => {
        setMounted(false);
        setRawExpanded(true);
        setRecommendation(null);
      }, 260);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const generateRecommendation = async () => {
    if (!event) return;
    setLoadingRecommend(true);
    try {
      const response = await fetch("/api/logs/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId: event.id }),
      });
      const data = await response.json();
      if (data.recommendation) {
        setRecommendation(data.recommendation);
      }
    } catch (err) {
      console.error("Failed to generate recommendation", err);
    } finally {
      setLoadingRecommend(false);
    }
  };

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isBrowser || !mounted || !event) return null;

  const backdropStyle: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transition: `opacity 200ms ${EASE_OUT}`,
  };

  const drawerStyle: React.CSSProperties = {
    transform: visible ? "translateX(0)" : "translateX(100%)",
    transition: `transform 300ms ${EASE_OUT}`,
  };

  // Helper to format text with basic markdown (bold)
  const formatText = (text: string | null) => {
    if (!text) return null;
    
    // Split by bold patterns
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="text-primary not-italic font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const getDisplayResponse = () => {
    if (event.response_content && event.response_content.trim().length > 0) {
      return event.response_content;
    }
    
    // Fallback to raw_response parsing (for reasoning models like DeepSeek or o1)
    if (event.raw_response && typeof event.raw_response === 'object') {
      const choices = (event.raw_response as any).choices;
      if (Array.isArray(choices) && choices.length > 0) {
        const message = choices[0].message;
        if (message) {
          // Priority: content -> reasoning_content
          return message.content || message.reasoning_content || null;
        }
      }
    }
    
    return null;
  };

  if (!isBrowser || !mounted || !event) return null;

  const displayResponse = getDisplayResponse();

  const hasPrompt = event.prompt !== null;
  const hasResponse = displayResponse !== null;
  const hasRaw = event.raw_response !== null;
  const hasAnyDetail = hasPrompt || hasResponse || hasRaw;

  const drawer = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        ...backdropStyle,
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Run Details"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "480px",
          maxWidth: "100vw",
          display: "flex",
          flexDirection: "column",
          boxShadow:
            "-8px 0 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
          ...drawerStyle,
        }}
        className="bg-surface border-l border-border"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-canvas/50 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <h3 className="text-sm font-display font-semibold text-primary uppercase truncate">
                {event.feature}
              </h3>
              <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-bold tracking-wider rounded bg-accent/10 text-accent border border-accent/20">
                {event.model}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 rounded-md transition-colors hover:bg-surface text-muted hover:text-primary cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

          {/* Scrollable body */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarGutter: "stable" }}
        >
          {/* AI Recommendation Section */}
          <div className="px-6 py-6 border-b border-border bg-gradient-to-br from-accent/5 to-transparent">
            {syncingRecommendation ? (
              <div className="flex items-center justify-center py-4 gap-2 text-muted">
                <RefreshCw className="w-4 h-4 animate-spin text-accent" />
                <span className="text-xs font-semibold">Checking for recommendation...</span>
              </div>
            ) : !recommendation ? (
              <button
                onClick={generateRecommendation}
                disabled={loadingRecommend}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-accent/20 bg-accent/5 hover:bg-accent/10 transition-all group disabled:opacity-50"
              >
                {loadingRecommend ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-accent" />
                    <span className="text-sm font-semibold text-accent">Analyzing logs...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold text-accent">Generate AI Recommendation</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                      AI Audit Recommendation
                    </h4>
                  </div>
                  <button
                    onClick={generateRecommendation}
                    disabled={loadingRecommend}
                    className="text-[10px] font-bold text-muted hover:text-accent transition-colors disabled:no-underline"
                  >
                    {loadingRecommend ? "Updating..." : "Refresh Audit"}
                  </button>
                </div>
                <div className="p-5 bg-canvas/60 border border-accent/20 rounded-2xl shadow-sm relative overflow-hidden group">
                  <p className="text-sm text-secondary leading-relaxed font-medium italic relative z-10">
                    &quot;{formatText(recommendation)}&quot;
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-2 gap-3 px-6 py-4 border-b border-border">
            {[
              {
                icon: Clock,
                label: "Latency",
                value: `${event.latency.toLocaleString()}`,
                unit: "ms",
              },
              {
                icon: DollarSign,
                label: "Cost",
                value: `$${event.estimated_cost.toFixed(6)}`,
                unit: "",
              },
              {
                icon: ArrowUpRight,
                label: "Input",
                value: event.input_tokens.toLocaleString(),
                unit: "tok",
              },
              {
                icon: ArrowDownLeft,
                label: "Output",
                value: event.output_tokens.toLocaleString(),
                unit: "tok",
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="bg-canvas border border-border rounded-lg p-3 space-y-1"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(6px)",
                    transition: `opacity 350ms ${EASE_OUT} ${
                      80 + i * 45
                    }ms, transform 350ms ${EASE_OUT} ${80 + i * 45}ms`,
                  }}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-muted uppercase font-bold tracking-wider">
                    <Icon className="w-3 h-3" />
                    <span>{card.label}</span>
                  </div>
                  <p className="text-lg font-display font-semibold text-primary font-mono leading-tight">
                    {card.value}
                    {card.unit && (
                      <span className="text-xs text-muted ml-0.5 font-sans">
                        {card.unit}
                      </span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ── Empty state ── */}
          {!hasAnyDetail && (
            <div className="px-6 py-10 flex flex-col items-center gap-3 text-center">
              <Info className="w-8 h-8 text-muted/40" />
              <p className="text-sm text-muted">
                No run details available for this event.
              </p>
            </div>
          )}

          {/* ── Prompt ── */}
          {hasPrompt && (
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-1.5 text-[10px] text-muted uppercase font-bold tracking-wider mb-2">
                <MessageSquare className="w-3 h-3" />
                <span>Prompt</span>
              </div>
              <div className="bg-canvas border border-border rounded-md p-3 text-primary text-sm whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                {event.prompt}
              </div>
            </div>
          )}

          {/* ── Response ── */}
          {displayResponse && (
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-1.5 text-[10px] text-muted uppercase font-bold tracking-wider mb-2">
                <Cpu className="w-3 h-3" />
                <span>Response</span>
              </div>
              <div className="bg-canvas border border-border rounded-md p-3 text-primary text-sm whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                {formatText(displayResponse)}
              </div>
            </div>
          )}

          {/* ── Raw Response ── */}
          {hasRaw && (
            <div className="px-6 py-4 border-b border-border">
              <button
                onClick={() => setRawExpanded((p) => !p)}
                className="flex items-center justify-between w-full group cursor-pointer"
                aria-expanded={rawExpanded}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-muted uppercase font-bold tracking-wider">
                  <Braces className="w-3 h-3" />
                  <span>Raw Response</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted group-hover:text-primary transition-colors">
                  <span>{rawExpanded ? "Collapse" : "Expand"}</span>
                  {rawExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </div>
              </button>

              <div
                style={{
                  display: "grid",
                  gridTemplateRows: rawExpanded ? "1fr" : "0fr",
                  transition: `grid-template-rows 280ms ${EASE_OUT}`,
                  marginTop: rawExpanded ? "10px" : "0",
                }}
              >
                <div style={{ overflow: "hidden" }}>
                  <div className="bg-black border border-zinc-800 rounded-md p-3 font-mono text-[11px] text-zinc-300 max-h-64 overflow-y-auto leading-relaxed select-text">
                    <pre
                      style={{
                        margin: 0,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {JSON.stringify(event.raw_response, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(drawer, document.body);
}
