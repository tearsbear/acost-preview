"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyCodeBlockProps {
  title: string;
  code: string;
  className?: string;
}

export function CopyCodeBlock({
  title,
  code,
  className = "",
}: CopyCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center text-xs font-semibold text-muted uppercase">
        <span>{title}</span>
        <button
          onClick={handleCopy}
          className="button-spring inline-flex items-center gap-1.5 px-2 py-1 rounded bg-canvas border border-border text-muted hover:text-primary"
        >
          {copied ? (
            <Check className="w-3 h-3 text-accent" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-3 bg-canvas/60 border border-border rounded-md text-xs font-mono text-secondary overflow-x-auto leading-relaxed select-all">
        {code}
      </pre>
    </div>
  );
}
