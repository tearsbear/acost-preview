"use client";

import { Eye } from "lucide-react";

export interface Event {
  id: string;
  feature: string;
  model: string;
  provider: string;
  input_tokens: number;
  output_tokens: number;
  estimated_cost: number;
  latency: number;
  user_id: string | null;
  created_at: string;
  prompt: string | null;
  response_content: string | null;
  raw_response: Record<string, unknown> | null;
  ai_recommendation: string | null;
}

interface EventsTableProps {
  events: Event[];
  onEventClick: (event: Event) => void;
  formatCost: (cost: number) => string;
  formatTokens: (n: number) => string;
}

export function EventsTable({
  events,
  onEventClick,
  formatCost,
  formatTokens,
}: EventsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted text-[10px] font-bold uppercase tracking-wider">
            <th className="pb-3.5 pl-2">Feature</th>
            <th className="pb-3.5">Model</th>
            <th className="pb-3.5">Provider</th>
            <th className="pb-3.5">Tokens</th>
            <th className="pb-3.5">Latency</th>
            <th className="pb-3.5">Cost</th>
            <th className="pb-3.5">User</th>
            <th className="pb-3.5">Logged</th>
            <th className="pb-3.5 text-right pr-2">View</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {events.map((event) => (
            <tr
              key={event.id}
              className="text-secondary group hover:bg-elevated/20 cursor-pointer"
              onClick={() => onEventClick(event)}
            >
              <td className="py-3.5 pl-2">
                <span className="font-mono text-xs bg-accent-wash text-accent border border-accent/10 px-2 py-0.5 rounded-full">
                  {event.feature}
                </span>
              </td>
              <td className="py-3.5 text-xs font-semibold text-primary max-w-[140px] truncate">
                {event.model}
              </td>
              <td className="py-3.5 text-xs text-muted capitalize">
                {event.provider}
              </td>
              <td className="py-3.5 text-xs text-muted font-mono">
                {formatTokens(event.input_tokens + event.output_tokens)}
                <span className="text-[10px] text-muted/70 ml-1">
                  ({event.input_tokens}+{event.output_tokens})
                </span>
              </td>
              <td className="py-3.5 text-xs text-muted font-mono">
                {event.latency}ms
              </td>
              <td className="py-3.5 text-xs text-primary font-mono font-semibold">
                {formatCost(event.estimated_cost)}
              </td>
              <td className="py-3.5 text-xs text-muted font-mono max-w-[100px] truncate">
                {event.user_id ?? (
                  <span className="text-muted/40 italic">—</span>
                )}
              </td>
              <td className="py-3.5 text-xs text-muted whitespace-nowrap">
                {new Date(event.created_at).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="py-3.5 text-right pr-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-md text-muted group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
