"use client";

import { Sparkles, Zap, AlertCircle, MousePointer2 } from "lucide-react";

export function ShowcaseCard() {
  const insights = [
    {
      text: "GPT-4o usage for 'Customer Support' is 42% more expensive than similar tasks on Claude 3.5 Sonnet.",
      priority: "high",
    },
    {
      text: "Recursive embedding calls in 'Search Indexer' are causing a 15% cost spike every Sunday at 2 AM.",
      priority: "medium",
    },
    {
      text: "Latency for 'Image Generation' has increased by 250ms following the latest provider update.",
      priority: "low",
    },
  ];

  const recommendations = [
    "Switch 'General Chat' feature to Llama 3.1 70B to save $1,200/mo without losing quality.",
    "Implement request batching for the 'Translation Service' to reduce API overhead by 12%.",
    "Enable prompt caching for 'Code Analysis' to save approximately 4.2M input tokens daily.",
    "Migrate 'Vector Search' to DeepSeek-V3 for a 60% reduction in inference costs.",
    "Optimize system prompt for 'Data Extraction' to reduce input token overhead by 18%.",
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "low": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="relative max-w-5xl mx-auto mt-16 animate-slide-up delay-400">
      {/* Decorative background elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="fuser-card bg-canvas/40 backdrop-blur-sm border-border/60 p-4 md:p-8 shadow-2xl relative z-10 text-left">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Intelligence Summary & Findings */}
          <div className="flex-1 space-y-6">
            <div className="p-6 bg-gradient-to-br from-accent/5 to-transparent border border-accent/10 rounded-2xl relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-display font-semibold text-primary">Intelligence Summary</h3>
              </div>
              <p className="text-secondary leading-relaxed italic relative z-10 text-sm md:text-base">
                "Your AI gross margins have improved by 18.4% this month. However, 
                a significant efficiency gap remains in your 'Customer Support' pipeline."
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-2 px-1">
                <AlertCircle className="w-3.5 h-3.5 text-accent" />
                Key Findings
              </h4>
              {insights.map((insight, idx) => (
                <div key={idx} className="p-4 bg-surface border border-border/50 rounded-xl space-y-2 hover:border-accent/30 transition-colors group">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-muted">AUDIT_0{idx + 1}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getPriorityColor(insight.priority)}`}>
                      {insight.priority}
                    </span>
                  </div>
                  <p className="text-secondary text-sm leading-relaxed font-medium group-hover:text-primary transition-colors">
                    {insight.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Action Plan */}
          <div className="w-full lg:w-[400px] space-y-6">
            <div className="fuser-card bg-surface/80 border-border h-full flex flex-col">
              <h4 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-accent" />
                Recommended Actions
              </h4>
              <div className="space-y-6 flex-1">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="flex gap-4 items-start group cursor-default">
                    <div className="w-6 h-6 rounded-full bg-accent-wash border border-border flex items-center justify-center text-[10px] font-bold text-muted group-hover:text-accent group-hover:border-accent/30 transition-all shrink-0">
                      {idx + 1}
                    </div>
                    <div className="space-y-1">
                      <p className="text-secondary text-sm leading-relaxed group-hover:text-primary transition-colors">
                        {rec}
                      </p>
                      <button className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                        Apply Change <MousePointer2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-border/50">
                <div className="flex items-center justify-between text-xs font-medium text-muted mb-3">
                  <span>Projected Monthly Savings</span>
                  <span className="text-emerald-500 font-bold">+$4,150.00</span>
                </div>
                <div className="w-full bg-accent-wash rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[85%] rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
