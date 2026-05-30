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
} from "lucide-react";

interface DashboardEvent {
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
}

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

  // Only enable portal on client
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Mount/unmount with animation timing — same double-RAF pattern as ResultsModal
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setRawExpanded(true);
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
      }, 260);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

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

  const hasPrompt = event.prompt !== null;
  const hasResponse = event.response_content !== null;
  const hasRaw = event.raw_response !== null;
  const hasAnyDetail = hasPrompt || hasResponse || hasRaw;

  const backdropStyle: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transition: `opacity 200ms ${EASE_OUT}`,
  };

  const drawerStyle: React.CSSProperties = {
    transform: visible ? "translateX(0)" : "translateX(100%)",
    transition: `transform 300ms ${EASE_OUT}`,
  };

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
              <div className="bg-canvas border border-border rounded-md p-3 text-primary text-sm whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {event.prompt}
              </div>
            </div>
          )}

          {/* ── Response ── */}
          {hasResponse && (
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-1.5 text-[10px] text-muted uppercase font-bold tracking-wider mb-2">
                <Cpu className="w-3 h-3" />
                <span>Response</span>
              </div>
              <div className="bg-canvas border border-border rounded-md p-3 text-primary text-sm whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {event.response_content}
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
