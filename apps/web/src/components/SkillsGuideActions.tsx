"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";

export function SkillsGuideActions() {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const loadGuide = async () => {
    const response = await fetch("/api/docs/skills");
    if (!response.ok) {
      throw new Error("Failed to load skills guide");
    }

    return response.text();
  };

  const handleCopy = async () => {
    const content = await loadGuide();
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const content = await loadGuide();
      const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "skills.md";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleCopy}
        className="button-spring inline-flex items-center gap-2 px-4 py-2 bg-surface hover:bg-elevated/40 border border-border text-secondary hover:text-primary rounded-md text-sm font-semibold"
      >
        {copied ? (
          <Check className="w-4 h-4 text-accent" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
        <span>{copied ? "Copied skills.md" : "Copy skills.md"}</span>
      </button>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="button-spring inline-flex items-center gap-2 px-4 py-2 bg-surface hover:bg-elevated/40 border border-border text-secondary hover:text-primary rounded-md text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="w-4 h-4" />
        <span>{downloading ? "Downloading..." : "Download skills.md"}</span>
      </button>
    </div>
  );
}
