/**
 * Server-side PriceToken.ai model fetcher.
 * Caching is delegated to Next.js's extended fetch() — responses are revalidated
 * every 12 hours automatically.
 */

import type { AIModel } from "@/types/ai-model";
import { ALLOWED_PROVIDERS } from "./provider-metadata";

const PRICETOKEN_TEXT_URL = "https://pricetoken.ai/api/v1/text";

/** Cache for 12 hours. Pricing doesn't change every minute. */
const REVALIDATE_SECONDS = 43200;

interface PriceTokenModel {
  modelId: string;
  provider: string;
  displayName: string;
  inputPerMTok: number;
  outputPerMTok: number;
  contextWindow: number;
  status: string;
}

interface PriceTokenResponse {
  data: PriceTokenModel[];
}

function normalizeModel(raw: PriceTokenModel): AIModel {
  return {
    modelId: raw.modelId,
    displayName: raw.displayName || raw.modelId,
    provider: raw.provider.toLowerCase(),
    inputPrice: raw.inputPerMTok / 1_000_000,
    outputPrice: raw.outputPerMTok / 1_000_000,
    contextLength: raw.contextWindow || 0,
    supportsTools: true, // Standard assumption for listed providers
    supportsVision: raw.modelId.includes("vision") || raw.modelId.includes("gpt-4o"),
    supportsReasoning: raw.modelId.includes("reasoner") || raw.modelId.includes("o1") || raw.modelId.includes("o3"),
  };
}

export async function fetchPriceTokenModels(): Promise<AIModel[]> {
  try {
    const res = await fetch(PRICETOKEN_TEXT_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: {
        "User-Agent": "acost-dashboard/1.0",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`PriceToken API error: ${res.status}`);
    }

    const json: PriceTokenResponse = await res.json();
    const raw: PriceTokenModel[] = json?.data ?? [];

    const allowed = new Set<string>(ALLOWED_PROVIDERS);

    return raw
      .filter((m) => allowed.has(m.provider.toLowerCase()) && m.status === "active")
      .map(normalizeModel)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  } catch (error) {
    console.error("Failed to fetch from PriceToken, returning empty list:", error);
    return [];
  }
}
