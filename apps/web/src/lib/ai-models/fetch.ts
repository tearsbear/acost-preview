/**
 * Server-side OpenRouter model fetcher.
 * Caching is delegated to Next.js's extended fetch() — responses are revalidated
 * every 12 hours automatically without any manual in-memory cache management.
 */

import type { AIModel } from "@/types/ai-model";
import { ALLOWED_PROVIDERS } from "./provider-metadata";

const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";

/** Cache for 12 hours. OpenRouter model lists don't change frequently. */
const REVALIDATE_SECONDS = 43200;

// ─── OpenRouter raw shape (partial) ──────────────────────────────────────────

interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  architecture?: {
    modality?: string;
    input_modalities?: string[];
    output_modalities?: string[];
  };
  pricing: {
    prompt: string;
    completion: string;
  };
  supported_parameters?: string[];
}

interface OpenRouterResponse {
  data: OpenRouterModel[];
}

// ─── Normalisation ────────────────────────────────────────────────────────────

function normalizeModel(raw: OpenRouterModel): AIModel {
  const [provider, ...modelParts] = raw.id.split("/");
  // OpenRouter IDs are "provider/model-name" — strip the prefix so the bare
  // model ID can be sent directly to the provider's own API endpoint.
  const modelId = modelParts.length > 0 ? modelParts.join("/") : raw.id;
  const supportedParams = raw.supported_parameters ?? [];
  const inputModalities = raw.architecture?.input_modalities ?? [];
  const modality = raw.architecture?.modality ?? "";

  return {
    modelId,
    displayName: raw.name || raw.id,
    provider,
    inputPrice: parseFloat(raw.pricing?.prompt) || 0,
    outputPrice: parseFloat(raw.pricing?.completion) || 0,
    contextLength: raw.context_length || 0,
    supportsTools:
      supportedParams.includes("tools") ||
      supportedParams.includes("tool_choice"),
    supportsVision:
      inputModalities.includes("image") || modality.includes("image"),
    supportsReasoning:
      supportedParams.includes("reasoning") ||
      supportedParams.includes("include_reasoning"),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch all models from OpenRouter, filtered to allowed providers.
 * Next.js automatically caches the underlying HTTP response for REVALIDATE_SECONDS.
 */
export async function fetchOpenRouterModels(): Promise<AIModel[]> {
  const res = await fetch(OPENROUTER_MODELS_URL, {
    // Next.js 14 extended fetch — ISR-style cache with revalidation
    next: { revalidate: REVALIDATE_SECONDS },
    headers: {
      "User-Agent": "acost-playground/1.0",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`OpenRouter API error: ${res.status} ${res.statusText}`);
  }

  const json: OpenRouterResponse = await res.json();
  const raw: OpenRouterModel[] = json?.data ?? [];

  const allowed = new Set<string>(ALLOWED_PROVIDERS);

  return raw
    .filter((m) => {
      const [provider] = m.id.split("/");
      return allowed.has(provider);
    })
    .map(normalizeModel)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}
