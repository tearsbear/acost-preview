"use client";

import { useState, useEffect } from "react";
import { Check, Copy } from "lucide-react";
import { Highlight, themes } from "prism-react-renderer";

interface CopyCodeBlockProps {
  title: string;
  code: string;
  language?: string;
  className?: string;
}

export function CopyCodeBlock({
  title,
  code,
  language = "typescript",
  className = "",
}: CopyCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    
    checkTheme();

    // Watch for theme changes (useful for manual toggles)
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center text-xs font-bold text-muted uppercase tracking-wider">
        <span>{title}</span>
        <button
          onClick={handleCopy}
          className="button-spring inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface border border-border text-muted hover:text-primary shadow-sm transition-all"
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-500" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
          <span className="font-semibold">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      
      <div className="relative group">
        <Highlight
          theme={isDarkMode ? themes.vsDark : themes.vsLight}
          code={code.trim()}
          language={language}
        >
          {({ className: highlightClass, style, tokens, getLineProps, getTokenProps }) => (
            <pre 
              className={`${highlightClass} p-4 border border-border rounded-xl text-[13px] font-mono overflow-x-auto leading-relaxed select-all transition-all duration-300
                !bg-canvas dark:!bg-zinc-950 text-primary dark:text-zinc-100 group-hover:border-border-strong dark:group-hover:border-zinc-700`}
              style={{ ...style, backgroundColor: undefined }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}
