"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Lock, Key, ShieldCheck, Server } from "lucide-react";

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

export function SecurityModal({ isOpen, onClose }: SecurityModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);

  // Portal check
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Mount/unmount transition
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      const t = setTimeout(() => {
        setMounted(false);
      }, 260);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

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
        if (e.target === e.currentTarget) onClose();
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
        aria-label="Secure Transit Architecture"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "480px",
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-canvas/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-display font-semibold text-primary">
                Secure Transit Architecture
              </h3>
              <p className="text-[10px] text-muted">
                Dynamic Envelope Encryption Flow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-md hover:bg-surface transition-colors text-muted hover:text-primary cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-sm leading-relaxed text-zinc-300"
          style={{ scrollbarGutter: "stable" }}
        >
          <p className="text-xs text-muted">
            To guarantee zero exposure of your private credentials, your API keys are protected using a stateless envelope encryption workflow powered by browser-native Web Crypto. All cryptographic operations happen entirely within <strong>your own Acost server</strong> — no third parties are ever involved.
          </p>

          {/* Steps */}
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-6 h-6 rounded-full bg-canvas border border-border flex items-center justify-center text-[10px] font-bold text-accent">
                  1
                </div>
                <div className="w-0.5 flex-1 bg-border my-1" />
              </div>
              <div className="space-y-1 pb-2">
                <h4 className="text-xs font-bold text-primary flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-zinc-500" />
                  Dynamic Key Handshake
                </h4>
                <p className="text-[11px] text-muted leading-relaxed">
                  When you hit Run, the browser calls <strong className="text-primary">/api/playground/crypto/key</strong> on <strong className="text-primary">your own Acost server</strong>. The server generates a brand-new, random 256-bit session key (<code>rawKey</code>) using <code>crypto.randomBytes(32)</code> — unique to this single test run and never stored anywhere. It also returns a <code>keyToken</code>: that same key, encrypted using your server&apos;s private master secret so only your server can ever decrypt it.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-6 h-6 rounded-full bg-canvas border border-border flex items-center justify-center text-[10px] font-bold text-accent">
                  2
                </div>
                <div className="w-0.5 flex-1 bg-border my-1" />
              </div>
              <div className="space-y-1 pb-2">
                <h4 className="text-xs font-bold text-primary flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Client-Side Obfuscation
                </h4>
                <p className="text-[11px] text-muted leading-relaxed">
                  Your browser encrypts your API key locally with `rawKey` using
                  browser-native <strong>AES-GCM</strong>. Your raw API key is
                  never sent over the network in plain text.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-6 h-6 rounded-full bg-canvas border border-border flex items-center justify-center text-[10px] font-bold text-accent">
                  3
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-primary flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-zinc-500" />
                  Safe RAM Proxy Processing
                </h4>
                <p className="text-[11px] text-muted leading-relaxed">
                  The proxy decrypts the dynamic `keyToken` using its private
                  master secret, recovers `rawKey`, decrypts your API key in RAM
                  to call the provider, and immediately discards all keys.
                </p>
              </div>
            </div>
          </div>

          {/* Demonstrative payload structure */}
          <div className="space-y-2 pt-2 border-t border-border">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">
              Outgoing Network Payload Structure
            </span>
            <div className="bg-black border border-zinc-800 rounded-lg p-3 font-mono text-[10px] text-zinc-400 select-all">
              <pre
                className="whitespace-pre-wrap leading-relaxed"
                style={{ margin: 0 }}
              >
                {`{
  "model": "anthropic/claude-3-5-sonnet",
  "encryptedApiKey": "g+o5V3mnK1zybtd...", // Obfuscated
  "iv": "Xqp/RRiqe...", // Random salt
  "keyToken": "YrYHVIYbo7WxNi..." // Server key wrapper
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-canvas/30 border-t border-border flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-accent text-canvas text-xs font-semibold rounded-md hover:opacity-90 transition-all cursor-pointer"
          >
            Got it, thank you!
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
