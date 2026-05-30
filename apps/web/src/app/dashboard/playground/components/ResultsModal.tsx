"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Zap,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Cpu,
  Terminal,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Braces,
} from "lucide-react";
import type { RunResult, LogEntry } from "../types";

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRunning: boolean;
  result: RunResult | null;
  logs: LogEntry[];
}

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

const STAT_CARDS = [
  {
    icon: Clock,
    label: "Latency",
    getValue: (r: RunResult) => r.latency,
    unit: "ms",
    format: (v: number) => v.toLocaleString(),
  },
  {
    icon: DollarSign,
    label: "Cost",
    getValue: (r: RunResult) => r.cost,
    unit: "",
    format: (v: number) => `$${v.toFixed(6)}`,
  },
  {
    icon: ArrowUpRight,
    label: "Input",
    getValue: (r: RunResult) => r.inputTokens,
    unit: "tok",
    format: (v: number) => v.toLocaleString(),
  },
  {
    icon: ArrowDownLeft,
    label: "Output",
    getValue: (r: RunResult) => r.outputTokens,
    unit: "tok",
    format: (v: number) => v.toLocaleString(),
  },
];

export function ResultsModal({
  isOpen,
  onClose,
  isRunning,
  result,
  logs,
}: ResultsModalProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [rawExpanded, setRawExpanded] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);

  // Only enable portal on client
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Mount/unmount with animation timing
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Double RAF: ensures first paint at opacity:0 before transitioning in
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      // Wait for exit transition (250ms) before unmounting
      const t = setTimeout(() => {
        setMounted(false);
        setRawExpanded(false);
      }, 260);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Prevent page refresh/navigation while running
  useEffect(() => {
    if (!isRunning) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "A request is in progress. Are you sure you want to leave?";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isRunning]);

  // Close on Escape — locked while running
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isRunning) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, isRunning, onClose]);

  if (!isBrowser || !mounted) return null;

  const backdropStyle: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transition: `opacity 200ms ${EASE_OUT}`,
  };

  const panelStyle: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible
      ? "scale(1) translateY(0)"
      : "scale(0.96) translateY(10px)",
    transition: `opacity 300ms ${EASE_OUT}, transform 300ms ${EASE_OUT}`,
  };

  const modal = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        boxSizing: "border-box",
        ...backdropStyle,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isRunning) onClose();
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
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Test Results"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "680px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow:
            "0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
          ...panelStyle,
        }}
        className="bg-surface border border-border"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-canvas/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-canvas">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-display font-semibold text-primary">
                Test Results
              </h3>
              <p className="text-[10px] text-muted">
                {isRunning ? "Running…" : result ? "Completed" : "Waiting…"}
              </p>
            </div>
          </div>
          <button
            onClick={isRunning ? undefined : onClose}
            disabled={isRunning}
            aria-label="Close modal"
            className={`p-1.5 rounded-md transition-colors ${
              isRunning
                ? "text-muted/30 cursor-not-allowed"
                : "hover:bg-surface text-muted hover:text-primary cursor-pointer"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarGutter: "stable" }}
        >
          {/* ── Stat Cards ── */}
          {result && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-4 border-b border-border">
              {STAT_CARDS.map((card, i) => {
                const Icon = card.icon;
                const value = card.getValue(result);
                return (
                  <div
                    key={card.label}
                    className="bg-canvas border border-border rounded-lg p-3 space-y-1"
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateY(0)" : "translateY(6px)",
                      transition: `opacity 350ms ${EASE_OUT} ${80 + i * 45}ms, transform 350ms ${EASE_OUT} ${80 + i * 45}ms`,
                    }}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-muted uppercase font-bold tracking-wider">
                      <Icon className="w-3 h-3" />
                      <span>{card.label}</span>
                    </div>
                    <p className="text-lg font-display font-semibold text-primary font-mono leading-tight">
                      {card.format(value)}
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
          )}

          {/* ── LLM Response Text ── */}
          {result?.content && (
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-1.5 text-[10px] text-muted uppercase font-bold tracking-wider mb-2">
                <Cpu className="w-3 h-3" />
                <span>LLM Response</span>
              </div>
              <div className="bg-canvas border border-border rounded-md p-3 text-primary text-sm whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                {result.content}
              </div>
            </div>
          )}

          {/* ── Raw API Response ── */}
          {result?.rawResponse && (
            <div className="px-6 py-4 border-b border-border">
              <button
                onClick={() => setRawExpanded((p) => !p)}
                className="flex items-center justify-between w-full group cursor-pointer"
                aria-expanded={rawExpanded}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-muted uppercase font-bold tracking-wider">
                  <Braces className="w-3 h-3" />
                  <span>API Response</span>
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
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {JSON.stringify(result.rawResponse, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Console Log ── */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-1.5 text-[10px] text-muted uppercase font-bold tracking-wider mb-2">
              <Terminal className="w-3 h-3" />
              <span>Console Log</span>
            </div>
            <div className="bg-black border border-zinc-800 rounded-lg p-3 font-mono text-[11px] text-zinc-400 overflow-y-auto select-text leading-relaxed min-h-[120px] max-h-[180px]">
              {logs.length === 0 ? (
                <div className="text-zinc-600 italic">
                  Waiting for test execution…
                </div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-zinc-600 shrink-0">
                        [{log.timestamp}]
                      </span>
                      <span
                        className={
                          log.type === "success"
                            ? "text-emerald-500"
                            : log.type === "error"
                              ? "text-red-500 font-bold"
                              : log.type === "warn"
                                ? "text-amber-500"
                                : "text-zinc-300"
                        }
                      >
                        {log.message}
                      </span>
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-canvas/50 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] text-muted">
            {result ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Tracked to dashboard</span>
              </>
            ) : isRunning ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Processing…</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3 h-3" />
                <span>Waiting</span>
              </>
            )}
          </div>
          <button
            onClick={isRunning ? undefined : onClose}
            disabled={isRunning}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              isRunning
                ? "bg-surface text-muted/40 cursor-not-allowed"
                : "bg-accent text-canvas hover:opacity-90 cursor-pointer"
            }`}
          >
            {isRunning ? "Running…" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
