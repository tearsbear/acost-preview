import { NextResponse } from "next/server";
import { fetchOpenRouterModels } from "@/lib/ai-models/fetch";
import { FALLBACK_MODELS } from "@/config/fallback-models";
import { PROVIDER_META, ALLOWED_PROVIDERS } from "@/lib/ai-models/provider-metadata";
import type { ProviderGroup, ModelsApiResponse } from "@/types/ai-model";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const models = await fetchOpenRouterModels();
    
    // Group models by provider
    const groups: ProviderGroup[] = ALLOWED_PROVIDERS.map((provider) => {
      const meta = PROVIDER_META[provider];
      const providerModels = models.filter((m) => m.provider === provider);
      
      return {
        provider,
        label: meta.label,
        baseUrl: meta.baseUrl,
        keyPlaceholder: meta.keyPlaceholder,
        models: providerModels,
      };
    });

    const response: ModelsApiResponse = {
      providers: groups,
      cachedAt: new Date().toISOString(),
      source: "openrouter",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch dynamic models from OpenRouter, falling back to static list:", error);
    
    // Fall back to static models
    const groups: ProviderGroup[] = ALLOWED_PROVIDERS.map((provider) => {
      const meta = PROVIDER_META[provider];
      const providerModels = FALLBACK_MODELS.filter((m) => m.provider === provider);
      
      return {
        provider,
        label: meta.label,
        baseUrl: meta.baseUrl,
        keyPlaceholder: meta.keyPlaceholder,
        models: providerModels,
      };
    });

    const response: ModelsApiResponse = {
      providers: groups,
      cachedAt: new Date().toISOString(),
      source: "fallback",
    };

    return NextResponse.json(response);
  }
}
