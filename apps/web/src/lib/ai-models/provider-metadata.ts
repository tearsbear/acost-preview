/**
 * Provider metadata — UI labels, base URLs, API key formats, and API call format.
 * This is the single source of truth for provider configuration throughout the app.
 */

export type ApiFormat = "openai" | "anthropic";

export interface ProviderMeta {
  label: string;
  baseUrl: string;
  keyPlaceholder: string;
  website: string;
  /** Which API request/response format this provider uses */
  apiFormat: ApiFormat;
}

export const PROVIDER_META: Record<string, ProviderMeta> = {
  openai: {
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    keyPlaceholder: "sk-proj-...",
    website: "https://platform.openai.com",
    apiFormat: "openai",
  },
  anthropic: {
    label: "Anthropic",
    baseUrl: "https://api.anthropic.com",
    keyPlaceholder: "sk-ant-api03-...",
    website: "https://console.anthropic.com",
    apiFormat: "anthropic",
  },
  google: {
    label: "Google",
    // Google's OpenAI-compatible endpoint (Gemini API)
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    keyPlaceholder: "AIzaSy...",
    website: "https://aistudio.google.com",
    apiFormat: "openai",
  },
  "x-ai": {
    label: "xAI",
    baseUrl: "https://api.x.ai/v1",
    keyPlaceholder: "xai-...",
    website: "https://console.x.ai",
    apiFormat: "openai",
  },
  deepseek: {
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com",
    keyPlaceholder: "sk-...",
    website: "https://platform.deepseek.com",
    apiFormat: "openai",
  },
  qwen: {
    label: "Qwen (Alibaba)",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    keyPlaceholder: "sk-...",
    website: "https://dashscope.console.aliyun.com",
    apiFormat: "openai",
  },
  minimax: {
    label: "Minimax",
    baseUrl: "https://api.minimax.chat/v1",
    keyPlaceholder: "ey...",
    website: "https://www.minimaxi.com",
    apiFormat: "openai",
  },
  custom: {
    label: "Custom Provider",
    baseUrl: "",
    keyPlaceholder: "your-api-key",
    website: "",
    apiFormat: "openai",
  },
};

/** Ordered list of providers shown in the playground dropdown */
export const ALLOWED_PROVIDERS = [
  "openai",
  "anthropic",
  "google",
  "x-ai",
  "deepseek",
  "qwen",
  "minimax",
] as const;

export type AllowedProvider = (typeof ALLOWED_PROVIDERS)[number];
