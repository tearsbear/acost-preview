import { SupabaseClient } from "@supabase/supabase-js";

const PRICETOKEN_URL = "https://pricetoken.ai/api/v1/text";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/models";

// STRICT LIST of supported providers as requested
const ALLOWED_PROVIDERS = [
  "openai",
  "xai",
  "google",
  "qwen",
  "deepseek",
  "anthropic",
  "minimax",
  "xiaomi"
];

export async function runPricingSync(supabase: SupabaseClient) {
  console.log("🚀 Starting Dual-Source Pricing Sync (PriceToken + OpenRouter)...");

  try {
    const upsertData: any[] = [];

    // 1. Fetch from PriceToken.ai
    console.log("📡 Fetching from PriceToken.ai...");
    const ptRes = await fetch(PRICETOKEN_URL);
    if (ptRes.ok) {
      const { data } = await ptRes.json();
      for (const model of data) {
        const provider = model.provider.toLowerCase();
        if (!ALLOWED_PROVIDERS.includes(provider)) continue;

        let normalizedModelId = model.modelId.toLowerCase();
        if (normalizedModelId.startsWith(`${provider}/`)) {
          normalizedModelId = normalizedModelId.replace(`${provider}/`, "");
        }

        upsertData.push({
          model_id: normalizedModelId,
          provider: provider,
          input_price: model.inputPerMTok / 1_000_000,
          output_price: model.outputPerMTok / 1_000_000,
          context_window: model.contextWindow || "N/A",
          launch_date: model.launchDate || "N/A",
          source: "pricetoken",
          updated_at: new Date().toISOString(),
        });
      }
    }

    // 2. Fetch from OpenRouter
    console.log("📡 Fetching from OpenRouter...");
    const orRes = await fetch(OPENROUTER_URL);
    if (orRes.ok) {
      const { data } = await orRes.json();
      for (const model of data) {
        // OpenRouter IDs are usually provider/model-id
        const parts = model.id.split("/");
        const provider = parts[0].toLowerCase();
        
        // Map OpenRouter provider names to our strict list if needed
        let mappedProvider = provider;
        if (provider === "mistralai") mappedProvider = "mistral";
        if (provider === "x-ai") mappedProvider = "xai";
        
        if (!ALLOWED_PROVIDERS.includes(mappedProvider)) continue;

        const normalizedModelId = parts.length > 1 ? parts.slice(1).join("/") : parts[0];

        upsertData.push({
          model_id: normalizedModelId,
          provider: mappedProvider,
          input_price: parseFloat(model.pricing.prompt),
          output_price: parseFloat(model.pricing.completion),
          context_window: `${Math.floor(model.context_length / 1024)}K`,
          launch_date: "N/A",
          source: "openrouter",
          updated_at: new Date().toISOString(),
        });
      }
    }

    // 3. Batch Upsert to Supabase
    console.log(`💾 Syncing ${upsertData.length} total model rates to database...`);
    
    // Deduplicate based on model_id + source
    const uniqueUpsertData = Array.from(
      new Map(upsertData.map(item => [`${item.model_id}_${item.source}`, item])).values()
    );

    console.log(`🧹 Deduplicated to ${uniqueUpsertData.length} unique model-source pairs.`);

    const { error } = await supabase
      .from("model_pricing")
      .upsert(uniqueUpsertData, { onConflict: "model_id,source" });

    if (error) throw error;

    console.log("✅ Dual-source sync complete.");
    return { success: true, count: uniqueUpsertData.length };
  } catch (error: any) {
    console.error("❌ Sync failed:", error.message);
    return { success: false, error: error.message };
  }
}
