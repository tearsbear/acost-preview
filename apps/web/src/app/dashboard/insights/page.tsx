"use client";

import { useEffect, useState } from "react";
import { Sparkles, Zap, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";

interface AIInsightsData {
  summary: string;
  insights: Array<{ text: string; priority: "high" | "medium" | "low" }>;
  recommendations: string[];
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<AIInsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async (force = false) => {
    setLoading(true);
    try {
      const url = force ? "/api/dashboard/insights?refresh=true" : "/api/dashboard/insights";
      const response = await fetch(url);
      const result = await response.json();
      if (result && !result.error) {
        setInsights(result);
      }
    } catch (err) {
      console.error("Failed to load insights", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "low": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="p-2 hover:bg-elevated/40 rounded-full border border-border transition-colors text-muted hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-display font-semibold tracking-tight text-primary">
              AI Cost Insights
            </h1>
            <p className="text-muted text-sm">
              Deep analysis and actionable recommendations for your AI workload.
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchInsights(true)}
          disabled={loading}
          className="button-spring flex items-center gap-2 px-4 py-2 bg-surface hover:bg-elevated/40 border border-border text-secondary hover:text-primary rounded-md text-xs font-semibold shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? "Analyzing..." : "Refresh Analysis"}
        </button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="fuser-card h-32 animate-pulse bg-elevated/20" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="fuser-card h-64 animate-pulse bg-elevated/10" />
            <div className="fuser-card h-64 animate-pulse bg-elevated/10" />
          </div>
        </div>
      ) : insights ? (
        <div className="space-y-6">
          {/* Summary Section */}
          <div className="fuser-card bg-gradient-to-br from-accent/5 to-transparent border-accent/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-display font-semibold text-primary">Intelligence Summary</h2>
            </div>
            <p className="text-secondary leading-relaxed text-lg italic">
              "{insights.summary}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Insights Section */}
            <div className="fuser-card">
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-accent" />
                Key Findings
              </h3>
              <div className="space-y-4">
                {insights.insights.map((insight, idx) => (
                  <div key={idx} className="p-4 bg-canvas/40 border border-border rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-muted">FINDING_0{idx + 1}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(insight.priority)}`}>
                        {insight.priority}
                      </span>
                    </div>
                    <p className="text-secondary text-sm leading-relaxed font-medium">
                      {insight.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="fuser-card">
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                Action Plan
              </h3>
              <div className="space-y-4">
                {insights.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex gap-4 items-start group">
                    <div className="w-6 h-6 rounded-full bg-elevated border border-border flex items-center justify-center text-[10px] font-bold text-muted group-hover:text-accent group-hover:border-accent/30 transition-colors shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-secondary text-sm leading-relaxed py-0.5">
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="fuser-card text-center py-16 border-dashed">
          <p className="text-muted">Unable to generate insights at this time.</p>
        </div>
      )}
    </div>
  );
}
