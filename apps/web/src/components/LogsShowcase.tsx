"use client";

import { useState } from "react";
import { Eye, Search, Filter, ScrollText, RefreshCw } from "lucide-react";
import { EventsTable, type Event } from "../app/dashboard/components/EventsTable";
import { RunDetailDrawer } from "../app/dashboard/components/RunDetailDrawer";

const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    feature: "customer-support",
    model: "gpt-4o",
    provider: "openai",
    input_tokens: 1250,
    output_tokens: 450,
    estimated_cost: 0.00825,
    latency: 1450,
    user_id: "user_2vXk...",
    created_at: new Date().toISOString(),
    prompt: "How do I upgrade my subscription plan to the enterprise tier?",
    response_content: "To upgrade to our Enterprise plan, please navigate to Settings > Billing and select 'Contact Sales'. Our team will reach out within 24 hours.",
    raw_response: { choices: [{ message: { content: "To upgrade to our Enterprise plan..." } }] },
    ai_recommendation: "Consider using **GPT-4o-mini** for this type of general support query. It could reduce costs by up to 90% without sacrificing response quality."
  },
  {
    id: "2",
    feature: "search-indexer",
    model: "claude-3-5-sonnet",
    provider: "anthropic",
    input_tokens: 4200,
    output_tokens: 1200,
    estimated_cost: 0.021,
    latency: 2800,
    user_id: "system",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    prompt: "Analyze the following documentation pages and extract key technical concepts...",
    response_content: "Based on the provided documentation, the core technical concepts are: 1. Vector Embeddings, 2. RAG Architecture...",
    raw_response: { choices: [{ message: { content: "Based on the provided documentation..." } }] },
    ai_recommendation: "High token count detected. Enable **Prompt Caching** to save approximately $0.015 per similar request."
  },
  {
    id: "3",
    feature: "cover-letter-gen",
    model: "gpt-4o-mini",
    provider: "openai",
    input_tokens: 850,
    output_tokens: 600,
    estimated_cost: 0.00021,
    latency: 1200,
    user_id: "user_9mLa...",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    prompt: "Generate a professional cover letter for a Senior Software Engineer position at a fintech startup. Focus on my experience with React and Node.js.",
    response_content: "Dear Hiring Team, I am writing to express my strong interest in the Senior Software Engineer position...",
    raw_response: { choices: [{ message: { content: "Dear Hiring Team..." } }] },
    ai_recommendation: "This task is highly repetitive. Consider using **Llama 3.1 8B** via Groq for near-instant responses at 1/10th the cost."
  }
];

export function LogsShowcase() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const formatCost = (cost: number) => {
    if (cost < 0.01) return `$${cost.toFixed(6)}`;
    return `$${cost.toFixed(4)}`;
  };

  const formatTokens = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  return (
    <section id="observability" className="py-24 md:py-32 bg-canvas overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-wash border border-border text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
              <Eye className="w-3 h-3 text-accent" />
              Deep Observability
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-semibold text-primary mb-6 tracking-tight">
              Inspect every <span className="text-accent italic">single</span> request.
            </h2>
            <p className="text-muted text-lg">
              Don't let your AI be a black box. Track full prompts, responses, and 
              provider metadata with a beautiful, developer-first interface.
            </p>
          </div>
        </div>

        {/* Mock Logs Interface */}
        <div className="fuser-card bg-surface/50 border-border/60 p-1 md:p-2 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.02] to-transparent pointer-events-none" />
          
          <div className="bg-canvas/50 rounded-xl border border-border/40 overflow-hidden">
            {/* Toolbar Simulation */}
            <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between bg-canvas/80 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-accent/10 border border-accent/20 rounded-md text-[10px] font-bold text-accent uppercase tracking-wider">
                  <ScrollText className="w-3 h-3" />
                  Live Activity
                </div>
              </div>
              <div className="p-1.5 bg-canvas border border-border rounded-md text-muted">
                <RefreshCw className="w-3 h-3" />
              </div>
            </div>

            {/* Table */}
            <div className="p-2 overflow-x-auto">
              <EventsTable 
                events={MOCK_EVENTS} 
                onEventClick={setSelectedEvent}
                formatCost={formatCost}
                formatTokens={formatTokens}
              />
            </div>
          </div>

          {/* Hint Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-accent text-canvas text-xs font-bold rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-2 z-20">
            <Eye className="w-3.5 h-3.5" />
            Click any row to view full details
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted text-sm font-medium">
            Includes full support for <span className="text-primary">Reasoning Content</span>, 
            <span className="text-primary">Prompt Caching</span>, and 
            <span className="text-primary"> Multi-modal responses</span>.
          </p>
        </div>
      </div>

      <RunDetailDrawer 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
      />
    </section>
  );
}
