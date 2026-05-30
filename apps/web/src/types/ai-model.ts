/**
 * Normalized AI model shape returned from OpenRouter and used throughout the app.
 * Prices are always expressed as USD per single token.
 */
export interface AIModel {
  /** Full OpenRouter-style ID, e.g. "openai/gpt-4o" */
  modelId: string;
  /** Human-readable label, e.g. "GPT-4o" */
  displayName: string;
  /** First segment of modelId, e.g. "openai" */
  provider: string;
  /** Input cost in USD per token */
  inputPrice: number;
  /** Output cost in USD per token */
  outputPrice: number;
  /** Maximum context window in tokens */
  contextLength: number;
  supportsTools: boolean;
  supportsVision: boolean;
  supportsReasoning: boolean;
}

/** A provider with its full list of available models */
export interface ProviderGroup {
  provider: string;
  label: string;
  baseUrl: string;
  keyPlaceholder: string;
  models: AIModel[];
}

/** Shape returned by /api/playground/models */
export interface ModelsApiResponse {
  providers: ProviderGroup[];
  cachedAt: string;
  source: "openrouter" | "fallback";
}
