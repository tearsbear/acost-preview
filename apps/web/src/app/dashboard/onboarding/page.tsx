"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, KeyRound, Route, ShieldCheck, Sparkles, Code2, Zap } from "lucide-react";
import { CopyCodeBlock } from "@/components/CopyCodeBlock";
import { SkillsGuideActions } from "@/components/SkillsGuideActions";

export const dynamic = "force-dynamic";

export default function OnboardingPage() {
  const endpoint = process.env.NEXT_PUBLIC_ACOST_BASE_URL || "https://tracker.your-domain.com/v1/track";
  const [activeLang, setActiveLang] = useState<"js" | "python" | "go">("js");

  const envSnippet = `ACOST_BASE_URL=${endpoint}
ACOST_API_KEY=acost_your_secret_key`;

  const requestSnippet = `await fetch(process.env.ACOST_BASE_URL!, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.ACOST_API_KEY!,
  },
  body: JSON.stringify({
    event: {
      userId: "user_123",
      model: "gpt-4o-mini",
      feature: "user-onboarding",
      prompt: "Create a short onboarding checklist for a new team member.",
      responseContent: "1. Verify email\\n2. Add profile photo\\n3. Join slack channel",
      inputTokens: 1100,
      outputTokens: 260,
      latency: 920,
      createdAt: new Date().toISOString(),
      rawResponse: { id: "chatcmpl-123", model: "gpt-4o-mini", usage: { ... } },
      // provider: "openrouter" // Optional: defaults to pricetoken
    },
  }),
});`;

  const pythonSnippet = `import requests
import os

endpoint = os.environ.get("ACOST_BASE_URL")
api_key = os.environ.get("ACOST_API_KEY")

payload = {
    "event": {
        "userId": "user_123",
        "model": "gpt-4o-mini",
        "feature": "user-onboarding",
        "prompt": "Create a short onboarding checklist for a new team member.",
        "responseContent": "1. Verify email\\n2. Add profile photo\\n3. Join slack channel",
        "inputTokens": 1100,
        "outputTokens": 260,
        "latency": 920,
        "rawResponse": {"id": "chatcmpl-123", "model": "gpt-4o-mini", "usage": {"total_tokens": 1360}}
    }
}

response = requests.post(
    endpoint,
    json=payload,
    headers={"x-api-key": api_key}
)
print(response.status_code)`;

  const goSnippet = `package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"
)

func main() {
	endpoint := os.Getenv("ACOST_BASE_URL")
	apiKey := os.Getenv("ACOST_API_KEY")

	payload := map[string]interface{}{
		"event": map[string]interface{}{
			"userId":          "user_123",
			"model":           "gpt-4o-mini",
			"feature":         "user-onboarding",
			"prompt":          "Create a short onboarding checklist for a new team member.",
			"responseContent": "1. Verify email\\n2. Add profile photo\\n3. Join slack channel",
			"inputTokens":     1100,
			"outputTokens":    260,
			"latency":         920,
			"rawResponse":     map[string]interface{}{"id": "chatcmpl-123"},
		},
	}

	jsonPayload, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", endpoint, bytes.NewBuffer(jsonPayload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", apiKey)

	client := &http.Client{}
	resp, _ := client.Do(req)
	defer resp.Body.Close()
}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12 animate-fade-in">
      {/* ─── Hero Section ─── */}
      <div className="relative">
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10 animate-pulse" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
              <Sparkles className="w-3 h-3" />
              Quick Start
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight text-primary leading-tight">
              Connect your service in minutes.
            </h1>
            <p className="text-secondary text-base leading-relaxed max-w-lg">
              Follow these simple steps to start tracking your AI costs and usage metrics with zero friction.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/docs"
                className="button-spring flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-canvas font-semibold rounded-lg text-sm shadow-lg shadow-primary/10"
              >
                API Docs
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center scale-90 origin-left">
                <SkillsGuideActions />
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* ─── Code Implementation ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 space-y-10">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-accent text-canvas flex items-center justify-center font-display font-bold text-[10px] shadow-md shadow-accent/20 shrink-0 mt-0.5">
                1
              </div>
              <div className="space-y-3 flex-1">
                <h2 className="text-2xl font-display font-semibold text-primary tracking-tight">Configure Env</h2>
                <p className="text-sm text-secondary leading-relaxed max-w-xl">
                  Store keys in your server-side environment. 
                  <span className="inline-flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded bg-amber-500/5 border border-amber-500/10 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                    <ShieldCheck className="w-3 h-3" />
                    Never expose keys in client code.
                  </span>
                </p>
                <div className="scale-95 origin-top-left">
                  <CopyCodeBlock title=".env" code={envSnippet} language="bash" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-accent text-canvas flex items-center justify-center font-display font-bold text-[10px] shadow-md shadow-accent/20 shrink-0 mt-0.5">
                2
              </div>
              <div className="space-y-3 flex-1">
                <h2 className="text-2xl font-display font-semibold text-primary tracking-tight">Send Event</h2>
                <p className="text-sm text-secondary leading-relaxed max-w-xl">
                  Trigger a non-blocking POST request after your AI provider returns usage data.
                </p>
                <div className="scale-95 origin-top-left">
                  <CopyCodeBlock 
                    title={
                      <div className="flex bg-surface border border-border p-1 rounded-lg">
                        {[
                          { id: "js", label: "JS" },
                          { id: "python", label: "PY" },
                          { id: "go", label: "GO" }
                        ].map((lang) => (
                          <button
                            key={lang.id}
                            onClick={() => setActiveLang(lang.id as any)}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                              activeLang === lang.id 
                                ? "bg-accent/10 text-accent shadow-sm" 
                                : "text-muted hover:text-primary"
                            }`}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </div>
                    }
                    code={activeLang === 'js' ? requestSnippet : activeLang === 'python' ? pythonSnippet : goSnippet} 
                    language={activeLang === 'js' ? 'typescript' : activeLang === 'python' ? 'python' : 'go'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
       
      </div>
    </div>
  );
}
