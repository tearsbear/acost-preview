"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import {
  Copy,
  Check,
  Trash2,
  Key,
  Plus,
  Search,
  X,
  ShieldAlert,
  Activity,
  Clock,
  RefreshCw,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { KeysSkeleton } from "../components/KeysSkeleton";

export const dynamic = "force-dynamic";

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

/* ─── Types ─── */
interface ApiKey {
  id: string;
  name: string;
  display_prefix: string;
  created_at: string;
  last_used_at: string | null;
  workspace_id: string;
}

interface Workspace {
  id: string;
  name: string;
}

/* ─── Create Key Modal ─── */
function CreateKeyModal({
  isOpen,
  onClose,
  onCreated,
  workspaceId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (key: string) => void;
  workspaceId: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setKeyName("");
      setError("");
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        });
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 260);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim() || !workspaceId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName.trim(), workspaceId }),
      });
      const data = await res.json();
      if (data.apiKey) {
        onCreated(data.apiKey);
        onClose();
      } else {
        setError(data.error || "Failed to create key");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        ...backdropStyle,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
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
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create API Key"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 440,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow:
            "0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
          ...panelStyle,
        }}
        className="bg-surface border border-border"
      >
        {/* Accent top bar */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-accent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-canvas">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-display font-semibold text-primary">
                Create API Key
              </h3>
              <p className="text-[10px] text-muted">
                Generate a new credential for your workspace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-elevated/40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div>
            <label
              className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5"
              htmlFor="modal-key-name"
            >
              Key Label
            </label>
            <input
              ref={inputRef}
              id="modal-key-name"
              type="text"
              required
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g. Production API, Staging"
              className="w-full px-4 py-2.5 bg-canvas border border-border rounded-md text-primary placeholder-zinc-500 text-sm focus:outline-none focus:border-accent transition-colors"
            />
            {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
          </div>
          <p className="text-[10px] text-muted leading-relaxed">
            The full key is shown <strong>once</strong> after creation and
            cannot be retrieved again. Store it securely.
          </p>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-canvas border border-border rounded-md text-sm font-semibold text-muted hover:text-primary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !keyName.trim()}
              className="flex-1 button-spring py-2.5 bg-accent hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-canvas font-semibold rounded-md text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              {loading ? "Creating…" : "Generate Key"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

/* ─── Secret Display Modal ─── */
function SecretModal({
  apiKey,
  onClose,
}: {
  apiKey: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    setMounted(true);
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const copy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        ...backdropStyle,
      }}
    >
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
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Save your API key"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 440,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow:
            "0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
          ...panelStyle,
        }}
        className="bg-surface border border-border"
      >
        <div className="absolute top-0 inset-x-0 h-[2px] bg-accent" />
        <div className="px-6 pt-6 pb-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-display font-semibold text-primary">
                Save your secret key
              </h3>
              <p className="text-[10px] text-muted">
                This is shown once and cannot be retrieved again
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-canvas border border-border rounded-md">
            <code className="text-sm font-mono text-accent flex-1 truncate select-all">
              {apiKey}
            </code>
            <button
              onClick={copy}
              className="button-spring p-1.5 rounded-md bg-surface border border-border text-muted hover:text-primary transition-colors cursor-pointer shrink-0"
              aria-label="Copy key"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <p className="text-[10px] text-muted leading-relaxed">
            Store this key in your environment variables. It is hashed in our
            database and cannot be recovered.
          </p>

          <button
            onClick={onClose}
            className="w-full button-spring py-2.5 bg-accent hover:opacity-90 text-canvas font-semibold rounded-md text-sm"
          >
            Done — I've saved my key
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─── View Key Modal ─── */
function ViewKeyModal({
  apiKey,
  onClose,
}: {
  apiKey: ApiKey;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    setMounted(true);
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const copy = () => {
    navigator.clipboard.writeText(apiKey.display_prefix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        ...backdropStyle,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
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
      <div
        role="dialog"
        aria-modal="true"
        aria-label="View API Key"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 440,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow:
            "0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
          ...panelStyle,
        }}
        className="bg-surface border border-border"
      >
        <div className="absolute top-0 inset-x-0 h-[2px] bg-accent" />
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-display font-semibold text-primary">
                {apiKey.name}
              </h3>
              <p className="text-[10px] text-muted">API key details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-elevated/40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Prefix row */}
          <div>
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
              Key Prefix
            </p>
            <div className="flex items-center gap-2 p-3 bg-canvas border border-border rounded-md">
              <code className="text-sm font-mono text-primary flex-1 select-all">
                {apiKey.display_prefix}
              </code>
              <button
                onClick={copy}
                className="button-spring p-1.5 rounded-md bg-surface border border-border text-muted hover:text-primary transition-colors cursor-pointer shrink-0"
                aria-label="Copy prefix"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-canvas border border-border rounded-md p-3">
              <p className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">
                Created
              </p>
              <p className="text-xs font-semibold text-primary">
                {new Date(apiKey.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="bg-canvas border border-border rounded-md p-3">
              <p className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">
                Last Used
              </p>
              <p className="text-xs font-semibold text-primary">
                {apiKey.last_used_at
                  ? new Date(apiKey.last_used_at).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric", year: "numeric" },
                    )
                  : "Never"}
              </p>
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-start gap-2.5 p-3 bg-amber-500/5 border border-amber-500/20 rounded-md">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted leading-relaxed">
              The full key was shown once at creation and is stored as a secure
              hash. It cannot be recovered. If you've lost it, revoke this key
              and create a new one.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full button-spring py-2.5 bg-canvas border border-border hover:bg-elevated/40 text-primary font-semibold rounded-md text-sm transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─── Confirm Delete Modal ─── */
function ConfirmDeleteModal({
  apiKey,
  onConfirm,
  onCancel,
}: {
  apiKey: ApiKey;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    setMounted(true);
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

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

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        ...backdropStyle,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
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
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Revoke API Key"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 420,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow:
            "0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
          ...panelStyle,
        }}
        className="bg-surface border border-border"
      >
        <div className="absolute top-0 inset-x-0 h-[2px] bg-red-500" />
        <div className="px-6 pt-6 pb-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-display font-semibold text-primary">
                Revoke API Key
              </h3>
              <p className="text-[10px] text-muted">
                This action cannot be undone
              </p>
            </div>
          </div>

          <div className="p-3 bg-canvas border border-border rounded-md">
            <p className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">
              Key to revoke
            </p>
            <p className="text-sm font-semibold text-primary">{apiKey.name}</p>
            <p className="text-xs font-mono text-muted mt-0.5">
              {apiKey.display_prefix}
            </p>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            Any application currently using this key will{" "}
            <strong className="text-primary">
              immediately stop logging telemetry
            </strong>
            . You'll need to update your environment variables with a new key.
          </p>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 bg-canvas border border-border rounded-md text-sm font-semibold text-muted hover:text-primary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 button-spring py-2.5 bg-red-500 hover:opacity-90 text-white font-semibold rounded-md text-sm flex items-center justify-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Revoke Key
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─── Main Page ─── */
export default function ApiKeysPage() {
  const supabase = createSupabaseBrowserClient();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingKey, setViewingKey] = useState<ApiKey | null>(null);
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<ApiKey | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: wsData } = await supabase
        .from("workspaces")
        .select("id, name")
        .eq("owner_id", user.id);
      if (wsData) setWorkspaces(wsData);
      const res = await fetch("/api/keys");
      const data = await res.json();
      if (data.keys) setKeys(data.keys);
    } catch (err) {
      console.error("Failed to load keys", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreated = (apiKey: string) => {
    setGeneratedKey(apiKey);
    fetchInitialData();
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDeleteKey) return;
    const id = confirmDeleteKey.id;
    setConfirmDeleteKey(null);
    setDeletingId(id);
    try {
      const res = await fetch(`/api/keys?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      console.error("Failed to delete key", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = keys.filter(
    (k) =>
      !search ||
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.display_prefix.toLowerCase().includes(search.toLowerCase()),
  );

  const activeKeys = keys.length;
  const usedKeys = keys.filter((k) => k.last_used_at).length;
  const newestKey =
    keys.length > 0 ? new Date(keys[0].created_at).toLocaleDateString() : "—";

  if (loading) return <KeysSkeleton />;

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-display font-semibold tracking-tight text-primary mb-2">
            API Keys
          </h1>
          <p className="text-muted text-sm leading-relaxed max-w-xl">
            Manage credentials that authorize your backend to send telemetry to
            the acost API base URL.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/onboarding"
            className="button-spring flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-elevated/40 border border-border text-secondary hover:text-primary font-semibold rounded-md text-sm"
          >
            Open Onboarding
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={workspaces.length === 0}
            className="button-spring flex items-center gap-2 px-4 py-2.5 bg-accent hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-canvas font-semibold rounded-md text-sm shadow-md"
          >
            <Plus className="w-4 h-4" />
            Create API Key
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: Key,
            label: "Total Keys",
            value: activeKeys.toString(),
            sub: "active credentials",
          },
          {
            icon: Activity,
            label: "Keys In Use",
            value: usedKeys.toString(),
            sub: "have been used",
          },
          {
            icon: Clock,
            label: "Latest Created",
            value: newestKey,
            sub: "most recent key",
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

      {/* Search */}
      <div className="fuser-card">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or prefix…"
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
          <button
            onClick={fetchInitialData}
            className="button-spring flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-elevated/40 border border-border text-secondary hover:text-primary rounded-md text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="fuser-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted">
            {filtered.length} {filtered.length === 1 ? "key" : "keys"}
            {search && ` matching "${search}"`}
          </h2>
        </div>

        {keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-canvas border border-border flex items-center justify-center text-muted">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary mb-1">
                No API keys yet
              </p>
              <p className="text-xs text-muted max-w-xs leading-relaxed">
                Create your first key to start tracking LLM costs from your
                application through the external consume API endpoint.
              </p>
            </div>
            <Link
              href="/docs"
              className="text-xs text-accent hover:underline font-semibold"
            >
              Read API docs
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="button-spring flex items-center gap-2 px-4 py-2 bg-accent text-canvas text-xs font-semibold rounded-md"
            >
              <Plus className="w-3.5 h-3.5" />
              Create API Key
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <Search className="w-7 h-7 text-muted/30" />
            <p className="text-sm text-muted">No keys match your search.</p>
            <button
              onClick={() => setSearch("")}
              className="text-xs text-accent hover:underline font-semibold"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted text-[10px] font-bold uppercase tracking-wider">
                  <th className="pb-3.5 pl-2">Name</th>
                  <th className="pb-3.5">Prefix</th>
                  <th className="pb-3.5">Created</th>
                  <th className="pb-3.5">Last Used</th>
                  <th className="pb-3.5 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((key) => (
                  <tr
                    key={key.id}
                    className="text-secondary group hover:bg-elevated/20"
                  >
                    <td className="py-4 pl-2 font-semibold text-primary">
                      {key.name}
                    </td>
                    <td className="py-4 font-mono text-xs text-muted select-all">
                      {key.display_prefix}
                    </td>
                    <td className="py-4 text-xs text-muted">
                      {new Date(key.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 text-xs">
                      {key.last_used_at ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-wash text-accent border border-accent/10 text-[10px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          {new Date(key.last_used_at).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </span>
                      ) : (
                        <span className="text-muted/50 italic text-[11px]">
                          Never used
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right pr-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingKey(key)}
                          className="button-spring p-2 rounded-md text-muted hover:text-accent hover:bg-accent/5 border border-transparent transition-colors cursor-pointer"
                          title="View key details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteKey(key)}
                          disabled={deletingId === key.id}
                          className="button-spring p-2 rounded-md text-muted hover:text-red-500 hover:bg-red-500/5 border border-transparent disabled:opacity-40 transition-colors cursor-pointer"
                          title="Revoke key"
                        >
                          {deletingId === key.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateKeyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCreated}
        workspaceId={workspaces[0]?.id ?? ""}
      />

      {generatedKey && (
        <SecretModal
          apiKey={generatedKey}
          onClose={() => setGeneratedKey(null)}
        />
      )}

      {viewingKey && (
        <ViewKeyModal apiKey={viewingKey} onClose={() => setViewingKey(null)} />
      )}

      {confirmDeleteKey && (
        <ConfirmDeleteModal
          apiKey={confirmDeleteKey}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmDeleteKey(null)}
        />
      )}
    </div>
  );
}
