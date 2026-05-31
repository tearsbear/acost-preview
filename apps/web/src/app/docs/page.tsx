"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  BookOpen, 
  KeyRound, 
  Send, 
  ShieldCheck, 
  Code2, 
  Layers, 
  Activity, 
  Terminal, 
  CheckCircle2,
  RefreshCw,
  ChevronRight,
  Copy
} from "lucide-react";
import { CopyCodeBlock } from "@/components/CopyCodeBlock";
import { SkillsGuideActions } from "@/components/SkillsGuideActions";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function DocsPage() {
  const endpoint = process.env.NEXT_PUBLIC_ACOST_BASE_URL || "https://tracker.your-domain.com/v1/track";
  const [activeTab, setActiveTab] = useState<"curl" | "fetch" | "batch">("curl");
  const [activeLang, setActiveLang] = useState<"js" | "python" | "go">("js");
  const [user, setUser] = useState<User | null>(null);

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, [supabase]);

  const envCode = `ACOST_BASE_URL=${endpoint}
ACOST_API_KEY=acost_your_secret_key`;

  const curlCode = `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: acost_your_secret_key" \\
  -d '{
    "event": {
      "userId": "user_123",
      "model": "gpt-4o-mini",
      "feature": "chat-answer",
      "prompt": "What is the capital of France?",
      "responseContent": "The capital of France is Paris.",
      "inputTokens": 1200,
      "outputTokens": 280,
      "latency": 842
    }
  }'`;

  const fetchJSCode = `const endpoint = process.env.ACOST_BASE_URL!;
const apiKey = process.env.ACOST_API_KEY!;

await fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
  },
  body: JSON.stringify({
    event: {
      userId: "user_123",
      model: "gpt-4o-mini",
      feature: "chat-answer",
      prompt: "What is the capital of France?",
      responseContent: "The capital of France is Paris.",
      inputTokens: 1200,
      outputTokens: 280,
      latency: 842,
      createdAt: new Date().toISOString(),
      // provider: "openrouter" // Optional: defaults to openai/pricetoken
    },
  }),
});`;

  const fetchPythonCode = `import requests
import os

endpoint = os.environ.get("ACOST_BASE_URL")
api_key = os.environ.get("ACOST_API_KEY")

payload = {
    "event": {
        "userId": "user_123",
        "model": "gpt-4o-mini",
        "feature": "chat-answer",
        "prompt": "What is the capital of France?",
        "responseContent": "The capital of France is Paris.",
        "inputTokens": 1200,
        "outputTokens": 280,
        "latency": 842
    }
}

response = requests.post(
    endpoint,
    json=payload,
    headers={"x-api-key": api_key}
)
print(response.status_code)`;

  const fetchGoCode = `package main

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
			"feature":         "chat-answer",
			"prompt":          "What is the capital of France?",
			"responseContent": "The capital of France is Paris.",
			"inputTokens":     1200,
			"outputTokens":    280,
			"latency":         842,
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

  const batchJSCode = `await fetch(process.env.ACOST_BASE_URL!, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.ACOST_API_KEY!,
  },
  body: JSON.stringify({
    events: [
      {
        userId: "user_123",
        model: "gpt-4o-mini",
        feature: "chat-answer",
        prompt: "Hello",
        responseContent: "Hi!",
        inputTokens: 900,
        outputTokens: 240,
        latency: 710,
      },
      {
        userId: "user_456",
        model: "claude-3-5-sonnet",
        feature: "summarizer",
        prompt: "Summarize this...",
        responseContent: "Summary...",
        inputTokens: 1500,
        outputTokens: 420,
        latency: 1240,
      }
    ],
  }),
});`;

  const batchPythonCode = `import requests
import os

endpoint = os.environ.get("ACOST_BASE_URL")
api_key = os.environ.get("ACOST_API_KEY")

payload = {
    "events": [
        {
            "userId": "user_123",
            "model": "gpt-4o-mini",
            "feature": "chat-answer",
            "prompt": "Hello",
            "responseContent": "Hi!",
            "inputTokens": 900,
            "outputTokens": 240,
            "latency": 710,
        },
        {
            "userId": "user_456",
            "model": "claude-3-5-sonnet",
            "feature": "summarizer",
            "prompt": "Summarize this...",
            "responseContent": "Summary...",
            "inputTokens": 1500,
            "outputTokens": 420,
            "latency": 1240,
        }
    ]
}

response = requests.post(
    endpoint,
    json=payload,
    headers={"x-api-key": api_key}
)
print(response.status_code)`;

  const batchGoCode = `package main

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
		"events": []map[string]interface{}{
			{
				"userId":          "user_123",
				"model":           "gpt-4o-mini",
				"feature":         "chat-answer",
				"prompt":          "Hello",
				"responseContent": "Hi!",
				"inputTokens":     900,
				"outputTokens":    240,
				"latency":         710,
			},
			{
				"userId":          "user_456",
				"model":           "claude-3-5-sonnet",
				"feature":         "summarizer",
				"prompt":          "Summarize this...",
				"responseContent": "Summary...",
				"inputTokens":     1500,
				"outputTokens":    420,
				"latency":         1240,
			},
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
    <main className="min-h-screen bg-canvas text-primary pb-20">
      <Navbar user={user} />
      <div className="max-w-6xl mx-auto px-6 py-32 space-y-16 animate-fade-in">
        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-12">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/5 border border-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest">
              <BookOpen className="w-3 h-3" />
              API Documentation
            </div>
            <h1 className="text-5xl font-display font-semibold tracking-tight leading-tight">
              Ingestion API Reference.
            </h1>
            <p className="text-secondary text-base leading-relaxed max-w-xl">
              acost provides a high-performance REST API to track AI costs from any backend environment. No SDK required—just a simple POST request.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <SkillsGuideActions />
            <Link
              href="/dashboard/keys"
              className="button-spring flex items-center justify-center gap-2 px-6 py-3 bg-accent text-canvas font-semibold rounded-lg text-sm shadow-lg shadow-accent/10"
            >
              Create API Key
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

       {/* ─── Environment Setup ─── */}
        <section className="fuser-card bg-surface-elevated/50 border-border">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="max-w-xs space-y-4">
              <div className="flex items-center gap-2 text-accent">
                <Layers className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest">Configuration</h3>
              </div>
              <h2 className="text-2xl font-display font-semibold">Environment Variables</h2>
              <p className="text-xs text-secondary leading-relaxed">
                Store these keys in your secure backend configuration. Never expose your API key in client-side code.
              </p>
            </div>
            <div className="flex-1 w-full">
              <CopyCodeBlock 
                title=".env configuration" 
                code={envCode} 
                language="bash"
              />
            </div>
          </div>
        </section>

        {/* ─── Supported Providers ─── */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-semibold tracking-tight">Official Support</h2>
            <p className="text-secondary text-sm">We provide high-precision tracking for the following providers.</p>
          </div>
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              "OpenAI", "Anthropic", "Google", "OpenRouter", 
              "xAI", "DeepSeek", "Qwen", "Xiaomi"
            ].map((p) => (
              <div key={p} className="fuser-card !p-3 transition-all duration-500 text-center">
                <div className="w-8 h-8 rounded-xl bg-accent-wash flex items-center justify-center text-accent mb-3 transition-colors duration-500 mx-auto">
                  {p === "OpenAI" ? (
                    <>
                      <img 
                        src="https://asset.brandfetch.io/idR3duQxYl/idqMspkPnk.svg" 
                        alt="OpenAI" 
                        className="w-5 h-5 block dark:hidden transition-all" 
                      />
                      <img 
                        src="https://asset.brandfetch.io/idR3duQxYl/idu144s-jF.svg" 
                        alt="OpenAI" 
                        className="w-5 h-5 hidden dark:block transition-all" 
                      />
                    </>
                  ) : p === "Anthropic" ? (
                    <>
                      <img 
                        src="https://asset.brandfetch.io/idmJWF3N06/idQoj8D4ho.svg" 
                        alt="Anthropic" 
                        className="w-5 h-5 block dark:hidden transition-all" 
                      />
                      <img 
                        src="https://asset.brandfetch.io/idmJWF3N06/idSuRd_tbF.svg" 
                        alt="Anthropic" 
                        className="w-5 h-5 hidden dark:block transition-all" 
                      />
                    </>
                  ) : p === "Google" ? (
                    <img 
                      src="https://asset.brandfetch.io/id6O2oGzv-/idTwScErMg.svg" 
                      alt="Google" 
                      className="w-5 h-5 transition-all" 
                    />
                  ) : p === "OpenRouter" ? (
                    <img 
                      src="https://asset.brandfetch.io/idKAk-lYn3/idseLVVQ2o.jpeg" 
                      alt="OpenRouter" 
                      className="w-5 h-5 rounded-md transition-all" 
                    />
                  ) : p === "xAI" ? (
                    <>
                      <img 
                        src="https://asset.brandfetch.io/iddjpnb3_W/idpeQ1A4Q_.svg" 
                        alt="xAI" 
                        className="w-5 h-5 block dark:hidden transition-all" 
                      />
                      <img 
                        src="https://asset.brandfetch.io/iddjpnb3_W/id2cay63L_.svg" 
                        alt="xAI" 
                        className="w-5 h-5 hidden dark:block transition-all" 
                      />
                    </>
                  ) : p === "DeepSeek" ? (
                    <img 
                      src="https://asset.brandfetch.io/idC_7w82en/idlPpJpfdl.jpeg" 
                      alt="DeepSeek" 
                      className="w-5 h-5 rounded-md transition-all" 
                    />
                  ) : p === "Qwen" ? (
                    <img 
                      src="https://asset.brandfetch.io/idIi0wUGp4/idBvRePqcz.png" 
                      alt="Qwen" 
                      className="w-5 h-5 rounded-md transition-all" 
                    />
                  ) : p === "Minimax" || p === "Xiaomi" ? (
                    <img 
                      src="https://asset.brandfetch.io/idml4symqn/iddkTyjFvQ.jpeg" 
                      alt="Minimax" 
                      className="w-5 h-5 rounded-md transition-all" 
                    />
                  ) : (
                    <div className="w-4 h-4 bg-accent/10 rounded-md" />
                  )}
                </div>
                <h3 className="text-[10px] font-display font-bold text-primary truncate uppercase tracking-tight">{p}</h3>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
              <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-blue-600 uppercase">Dual-Source Pricing</p>
                <p className="text-[11px] text-secondary leading-relaxed">
                  We track both official rates via <strong>PriceToken.ai</strong> and <strong>OpenRouter</strong> market rates. 
                  Our engine automatically switches to OpenRouter pricing if <code>provider: "openrouter"</code> is sent.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-amber-600 uppercase">Custom Providers</p>
                <p className="text-[11px] text-secondary leading-relaxed">
                  You can use any provider, but we recommend sending a manual <code>estimatedCost</code> for unlisted vendors to ensure absolute accuracy.
                </p>
              </div>
            </div>
          </div>
        </section>

   

        {/* ─── Payload Schema ─── */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-display font-semibold tracking-tight">Request Schema</h2>
            <p className="text-secondary text-sm">Every event requires the following core fields for precise tracking.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-canvas border-b border-border">
                      <th className="px-6 py-4 font-semibold text-primary">Field</th>
                      <th className="px-6 py-4 font-semibold text-primary">Type</th>
                      <th className="px-6 py-4 font-semibold text-primary">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {[
                      { f: "userId", t: "string", s: "Required", desc: "Unique identifier for your application user." },
                      { f: "model", t: "string", s: "Required", desc: "Exact model ID used (e.g. gpt-4o)." },
                      { f: "feature", t: "string", s: "Required", desc: "Grouping tag for your product features." },
                      { f: "prompt", t: "string", s: "Required", desc: "The input text sent to the AI model." },
                      { f: "responseContent", t: "string", s: "Required", desc: "The generated text response from the model." },
                      { f: "inputTokens", t: "number", s: "Required", desc: "Prompt token count." },
                      { f: "outputTokens", t: "number", s: "Required", desc: "Completion token count." },
                      { f: "provider", t: "string", s: "Optional", desc: "AI vendor. Defaults to PriceToken.ai rates if omitted." },
                      { f: "latency", t: "number", s: "Optional", desc: "Request duration in milliseconds." },
                      { f: "estimatedCost", t: "number", s: "Optional", desc: "Manual cost override. If omitted, acost will calculate this using model metadata." }
                    ].map(row => (
                      <tr key={row.f} className="group hover:bg-canvas/30 transition-colors">
                        <td className="px-6 py-4">
                          <code className="text-accent font-bold">{row.f}</code>
                          <p className="text-[11px] text-secondary mt-1">{row.desc}</p>
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-secondary">{row.t}</td>
                        <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.s === 'Required' 
                            ? 'bg-emerald-500/10 text-emerald-600' 
                            : row.s === 'Recommended'
                            ? 'bg-blue-500/10 text-blue-600'
                            : 'bg-canvas text-secondary'
                        }`}>
                          {row.s === 'Required' && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {row.s}
                        </span>
                      </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="fuser-card bg-surface-elevated border-border">
                <div className="flex items-center gap-2 mb-4 text-accent">
                  <Layers className="w-4 h-4" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">Payload Formats</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-primary mb-1">Single Event</h4>
                    <p className="text-xs text-secondary leading-relaxed">Pass a single object under the <code className="bg-canvas px-1 rounded font-bold text-accent">event</code> key.</p>
                  </div>
                  <div className="h-px bg-border" />
                  <div>
                    <h4 className="text-sm font-semibold text-primary mb-1">Batch (Up to 100)</h4>
                    <p className="text-xs text-secondary leading-relaxed">Pass an array of objects under the <code className="bg-canvas px-1 rounded font-bold text-accent">events</code> key.</p>
                  </div>
                </div>
              </div>

              <div className="fuser-card space-y-4 bg-surface-elevated border-border">
                <div className="flex items-center gap-2 text-accent">
                  <Activity className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">Responses</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-emerald-600 font-bold">200 OK</span>
                    <span className="text-secondary">Accepted</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-amber-600 font-bold">400 Bad Request</span>
                    <span className="text-secondary">Schema Error</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-red-600 font-bold">401 Unauthorized</span>
                    <span className="text-secondary">Invalid Key</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Implementation Examples ─── */}
        <section className="space-y-8 pt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-accent">
                <h2 className="text-3xl font-display font-semibold tracking-tight">Implementation Examples</h2>
              </div>
              <p className="text-secondary text-sm">Ready-to-use snippets for your backend environment.</p>
            </div>
            
            <div className="flex bg-surface border border-border p-1 rounded-xl shadow-sm h-fit">
              {[
                { id: "curl", label: "cURL" },
                { id: "fetch", label: "Single Event" },
                { id: "batch", label: "Batch (Bulk)" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeTab === tab.id 
                      ? "bg-accent text-canvas shadow-md" 
                      : "text-muted hover:text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="fuser-card bg-surface-elevated/50 border-border p-6 shadow-xl space-y-6">
            {activeTab !== "curl" && (
              <div className="flex justify-center">
                <div className="flex bg-surface/50 border border-border p-1 rounded-lg w-fit">
                  {[
                    { id: "js", label: "JavaScript" },
                    { id: "python", label: "Python" },
                    { id: "go", label: "Go" }
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setActiveLang(lang.id as any)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                        activeLang === lang.id 
                          ? "bg-accent/10 text-accent shadow-sm" 
                          : "text-muted hover:text-primary"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              {activeTab === "curl" && (
                <CopyCodeBlock 
                  title="cURL Request" 
                  code={curlCode} 
                  language="bash"
                />
              )}
              {activeTab === "fetch" && (
                <CopyCodeBlock 
                  title={`${activeLang === 'js' ? 'JavaScript' : activeLang === 'python' ? 'Python' : 'Go'} Ingestion`}
                  code={activeLang === 'js' ? fetchJSCode : activeLang === 'python' ? fetchPythonCode : fetchGoCode} 
                  language={activeLang === 'js' ? 'typescript' : activeLang === 'python' ? 'python' : 'go'}
                />
              )}
              {activeTab === "batch" && (
                <CopyCodeBlock 
                  title={`${activeLang === 'js' ? 'JavaScript' : activeLang === 'python' ? 'Python' : 'Go'} Batch Ingestion`}
                  code={activeLang === 'js' ? batchJSCode : activeLang === 'python' ? batchPythonCode : batchGoCode} 
                  language={activeLang === 'js' ? 'typescript' : activeLang === 'python' ? 'python' : 'go'}
                />
              )}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-canvas border border-border w-fit">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Secure SSL Ingestion Enabled</span>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
