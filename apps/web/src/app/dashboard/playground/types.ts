export interface ApiKey {
  id: string;
  name: string;
  display_prefix: string;
  created_at: string;
}

export interface LogEntry {
  timestamp: string;
  type: "info" | "success" | "error" | "warn";
  message: string;
}

export interface RunResult {
  content: string;
  inputTokens: number;
  outputTokens: number;
  latency: number;
  cost: number;
  model: string;
  provider: string;
  rawResponse?: Record<string, unknown>;
}
