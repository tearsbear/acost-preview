"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  runPricingSync: () => runPricingSync
});
module.exports = __toCommonJS(index_exports);
var PRICETOKEN_URL = "https://pricetoken.ai/api/v1/text";
var OPENROUTER_URL = "https://openrouter.ai/api/v1/models";
var ALLOWED_PROVIDERS = [
  "openai",
  "xai",
  "google",
  "qwen",
  "deepseek",
  "anthropic",
  "minimax",
  "xiaomi"
];
async function runPricingSync(supabase) {
  console.log("\u{1F680} Starting Dual-Source Pricing Sync (PriceToken + OpenRouter)...");
  try {
    const upsertData = [];
    console.log("\u{1F4E1} Fetching from PriceToken.ai...");
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
          provider,
          input_price: model.inputPerMTok / 1e6,
          output_price: model.outputPerMTok / 1e6,
          context_window: model.contextWindow || "N/A",
          launch_date: model.launchDate || "N/A",
          source: "pricetoken",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
    console.log("\u{1F4E1} Fetching from OpenRouter...");
    const orRes = await fetch(OPENROUTER_URL);
    if (orRes.ok) {
      const { data } = await orRes.json();
      for (const model of data) {
        const parts = model.id.split("/");
        const provider = parts[0].toLowerCase();
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
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
    console.log(`\u{1F4BE} Syncing ${upsertData.length} total model rates to database...`);
    const uniqueUpsertData = Array.from(
      new Map(upsertData.map((item) => [`${item.model_id}_${item.source}`, item])).values()
    );
    console.log(`\u{1F9F9} Deduplicated to ${uniqueUpsertData.length} unique model-source pairs.`);
    const { error } = await supabase.from("model_pricing").upsert(uniqueUpsertData, { onConflict: "model_id,source" });
    if (error) throw error;
    console.log("\u2705 Dual-source sync complete.");
    return { success: true, count: uniqueUpsertData.length };
  } catch (error) {
    console.error("\u274C Sync failed:", error.message);
    return { success: false, error: error.message };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  runPricingSync
});
