"use client";

import { useState, useMemo } from "react";
import { 
  Search, 
  RefreshCw, 
  Calendar,
  Box,
  ChevronDown,
  Filter
} from "lucide-react";

interface ModelPricing {
  model_id: string;
  provider: string;
  input_price: number;
  output_price: number;
  context_window?: string;
  launch_date?: string;
  source: string;
  updated_at: string;
}

export function PricingTable({ data }: { data: ModelPricing[] }) {
  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>("pricetoken");

  // Get unique sources
  const sources = useMemo(() => 
    Array.from(new Set(data.map(m => m.source))).sort(),
    [data]
  );

  // Get unique providers for the selected source
  const providersForSource = useMemo(() => {
    const filtered = data.filter(m => m.source === selectedSource);
    return Array.from(new Set(filtered.map(m => m.provider))).sort();
  }, [data, selectedSource]);

  // Reset provider if it's not available in the new source
  const handleSourceChange = (newSource: string) => {
    setSelectedSource(newSource);
    if (selectedProvider && !data.some(m => m.source === newSource && m.provider === selectedProvider)) {
      setSelectedProvider(null);
    }
  };

  const filteredData = useMemo(() => 
    data.filter(model => {
      const matchesSearch = model.model_id.toLowerCase().includes(search.toLowerCase()) ||
                           model.provider.toLowerCase().includes(search.toLowerCase());
      const matchesProvider = selectedProvider ? model.provider === selectedProvider : true;
      const matchesSource = model.source === selectedSource;
      return matchesSearch && matchesProvider && matchesSource;
    }),
    [data, search, selectedProvider, selectedSource]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 mb-8">
        {/* Top Bar: Search and Source Dropdown */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
           <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted" />
              <input 
                type="text" 
                placeholder="Search models or providers..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-sm"
              />
           </div>
           
           <div className="flex items-center gap-3">
              <div className="relative group">
                <select
                  value={selectedSource}
                  onChange={(e) => handleSourceChange(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 bg-surface border border-border rounded-2xl text-xs font-bold text-primary uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent cursor-pointer transition-all shadow-sm"
                >
                  {sources.map(source => (
                    <option key={source} value={source}>
                      {source === 'pricetoken' ? 'PriceToken (Official)' : 'OpenRouter (Market)'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none group-hover:text-primary transition-colors" />
              </div>

              <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest bg-surface px-4 py-3 rounded-2xl border border-border shadow-sm">
                 <RefreshCw className="w-3 h-3 animate-spin-slow" />
                 <span>Synced Daily</span>
              </div>
           </div>
        </div>

        {/* Provider Filter Chips */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest px-1">
            <span>Filter by Provider</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedProvider(null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                selectedProvider === null 
                  ? "bg-accent text-canvas border-accent shadow-md scale-[1.02]" 
                  : "bg-surface text-secondary border-border hover:border-accent/40 hover:bg-accent-wash/20"
              }`}
            >
              All Models
            </button>
            {providersForSource.map(provider => (
              <button
                key={provider}
                onClick={() => setSelectedProvider(provider)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border uppercase tracking-wider ${
                  selectedProvider === provider 
                    ? "bg-accent text-canvas border-accent shadow-md scale-[1.02]" 
                    : "bg-surface text-secondary border-border hover:border-accent/40 hover:bg-accent-wash/20"
                }`}
              >
                {provider}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-border bg-surface shadow-sm">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-canvas/50 border-b border-border">
              <th className="px-6 py-5 text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Provider</th>
              <th className="px-6 py-5 text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Model ID</th>
              <th className="px-6 py-5 text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Input / 1M</th>
              <th className="px-6 py-5 text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Output / 1M</th>
              <th className="px-6 py-5 text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Context</th>
              <th className="px-6 py-5 text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Launched</th>
              <th className="px-6 py-5 text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredData.length > 0 ? (
              filteredData.map((model) => (
                <tr key={`${model.model_id}_${model.source}`} className="group hover:bg-accent-wash/20 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-xs font-bold text-accent uppercase shadow-inner">
                        {model.provider.substring(0, 1)}
                      </div>
                      <span className="text-xs font-bold text-primary uppercase tracking-widest">{model.provider}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-display font-semibold text-primary group-hover:text-accent transition-colors">{model.model_id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-bold text-primary">
                      ${(model.input_price * 1_000_000).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-bold text-primary">
                      ${(model.output_price * 1_000_000).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-secondary font-medium">
                      <Box className="w-3.5 h-3.5 text-muted/60" />
                      <span>{model.context_window || "128K"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-secondary whitespace-nowrap font-medium">
                      <Calendar className="w-3.5 h-3.5 text-muted/60" />
                      <span>{model.launch_date || "2024"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                        {new Date(model.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center">
                   <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-muted/20 mb-2" />
                      <p className="text-muted text-sm font-medium">No models found matching your criteria.</p>
                      <button 
                        onClick={() => { setSearch(""); setSelectedProvider(null); }}
                        className="text-xs font-bold text-accent hover:underline mt-2"
                      >
                        Clear all filters
                      </button>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
