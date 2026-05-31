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
  authenticateApiKey: () => authenticateApiKey,
  extractEventsFromBody: () => extractEventsFromBody,
  ingestTelemetryEvents: () => ingestTelemetryEvents,
  prepareEvents: () => prepareEvents
});
module.exports = __toCommonJS(index_exports);
var import_crypto = require("crypto");
var pricingCache = null;
var lastFetchTime = 0;
var CACHE_TTL = 1e3 * 60 * 60;
async function getPricingData(supabase) {
  const now = Date.now();
  if (pricingCache && now - lastFetchTime < CACHE_TTL) {
    return pricingCache;
  }
  try {
    console.log("\u{1F4E1} Fetching model pricing from database...");
    const { data, error } = await supabase.from("model_pricing").select("model_id, input_price, output_price, source").eq("is_active", true);
    if (error) throw error;
    const newCache = {};
    for (const row of data) {
      const key = `${row.model_id}:${row.source}`;
      newCache[key] = {
        inputPrice: row.input_price,
        outputPrice: row.output_price
      };
    }
    pricingCache = newCache;
    lastFetchTime = now;
    return newCache;
  } catch (error) {
    console.error("Database pricing lookup failed:", error);
    return pricingCache || {};
  }
}
function readNonEmptyString(value) {
  if (typeof value !== "string") {
    return void 0;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : void 0;
}
function readNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
}
function readCreatedAt(value) {
  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) {
    return new Date(value).toISOString();
  }
  return (/* @__PURE__ */ new Date()).toISOString();
}
function toJsonValue(value) {
  if (value === void 0) {
    return null;
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}
function extractEventsFromBody(body) {
  if (!body || typeof body !== "object") {
    return { error: "Bad Request: Request body must be a JSON object" };
  }
  const payload = body;
  if (Array.isArray(payload.events)) {
    if (payload.events.length === 0) {
      return { error: "Bad Request: Events array cannot be empty" };
    }
    return { events: payload.events };
  }
  if (payload.event && typeof payload.event === "object") {
    return { events: [payload.event] };
  }
  return {
    error: "Bad Request: Provide either an event object or a non-empty events array"
  };
}
async function authenticateApiKey(supabase, apiKey) {
  const keyHash = (0, import_crypto.createHash)("sha256").update(apiKey).digest("hex");
  const { data, error } = await supabase.from("api_keys").select("workspace_id, id").eq("key_hash", keyHash).single();
  if (error || !data) {
    return null;
  }
  return {
    workspaceId: data.workspace_id,
    keyId: data.id
  };
}
async function prepareEvents(supabase, workspaceId, events, options) {
  const maxBatchSize = options.maxBatchSize ?? 100;
  if (events.length > maxBatchSize) {
    return {
      error: `Bad Request: Too many events. Maximum ${maxBatchSize} events per request`
    };
  }
  const pricing = await getPricingData(supabase);
  const dbEvents = [];
  for (const rawEvent of events) {
    const feature = readNonEmptyString(rawEvent.feature) ?? options.defaultFeature;
    if (!feature) {
      return { error: "Bad Request: Each event must include a non-empty 'feature' string" };
    }
    const prompt = readNonEmptyString(rawEvent.prompt);
    if (!prompt) {
      return { error: "Bad Request: Each event must include a non-empty 'prompt' string" };
    }
    const responseContent = readNonEmptyString(rawEvent.responseContent);
    if (!responseContent) {
      return {
        error: "Bad Request: Each event must include a non-empty 'responseContent' string"
      };
    }
    if (rawEvent.rawResponse === void 0 || rawEvent.rawResponse === null) {
      return { error: "Bad Request: Each event must include 'rawResponse'" };
    }
    if (rawEvent.inputTokens === void 0 || rawEvent.inputTokens === null) {
      return { error: "Bad Request: Each event must include 'inputTokens'" };
    }
    const inTokens = readNumber(rawEvent.inputTokens);
    if (rawEvent.outputTokens === void 0 || rawEvent.outputTokens === null) {
      return { error: "Bad Request: Each event must include 'outputTokens'" };
    }
    const outTokens = readNumber(rawEvent.outputTokens);
    const rawProvider = readNonEmptyString(rawEvent.provider);
    const model = readNonEmptyString(rawEvent.model) ?? options.defaultModel;
    const provider = rawProvider?.toLowerCase() === "openrouter" ? "openrouter" : "pricetoken";
    const userId = readNonEmptyString(rawEvent.userId) ?? readNonEmptyString(rawEvent.user);
    if (options.requireUserId && !userId) {
      return { error: "Bad Request: Each event must include userId" };
    }
    if (options.requireModel && !model) {
      return { error: "Bad Request: Each event must include model" };
    }
    let estimatedCost = readNumber(rawEvent.estimatedCost);
    if (estimatedCost === 0 && model) {
      const providerLower = provider?.toLowerCase();
      const pricingSource = providerLower === "openrouter" ? "openrouter" : "pricetoken";
      let normalizedModel = model.toLowerCase();
      if (normalizedModel.includes("/")) {
        normalizedModel = normalizedModel.split("/").pop() || normalizedModel;
      }
      let modelPricing = pricing[`${normalizedModel}:${pricingSource}`];
      if (!modelPricing) {
        const firstMatchKey = Object.keys(pricing).find((k) => k.startsWith(`${normalizedModel}:`));
        if (firstMatchKey) {
          modelPricing = pricing[firstMatchKey];
        }
      }
      if (modelPricing) {
        estimatedCost = inTokens * modelPricing.inputPrice + outTokens * modelPricing.outputPrice;
      } else {
        estimatedCost = inTokens * 2e-6 + outTokens * 8e-6;
      }
    }
    dbEvents.push({
      workspace_id: workspaceId,
      feature,
      model: model ?? "unknown",
      provider: provider ?? "unknown",
      input_tokens: inTokens,
      output_tokens: outTokens,
      estimated_cost: estimatedCost,
      latency: readNumber(rawEvent.latency),
      user_id: userId ?? null,
      created_at: readCreatedAt(rawEvent.createdAt),
      prompt,
      response_content: responseContent,
      raw_response: toJsonValue(rawEvent.rawResponse),
      ai_recommendation: null
    });
  }
  return { dbEvents };
}
async function ingestTelemetryEvents(supabase, params) {
  const validation = params.validation ?? {};
  const prepared = await prepareEvents(supabase, params.workspaceId, params.events, validation);
  if ("error" in prepared) {
    return { ok: false, status: 400, error: prepared.error };
  }
  const { dbEvents } = prepared;
  const { error: insertError } = await supabase.from("events").insert(dbEvents);
  if (insertError) {
    console.error("Telemetry insertion failed:", insertError);
    return {
      ok: false,
      status: 500,
      error: "Internal Server Error: Telemetry insertion failed"
    };
  }
  if (params.keyId) {
    supabase.from("api_keys").update({ last_used_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", params.keyId).then(({ error }) => {
      if (error) {
        console.error("Failed to update API key last_used_at", error);
      }
    });
  }
  const aggregations = {};
  for (const event of dbEvents) {
    const date = new Date(event.created_at).toISOString().split("T")[0];
    const key = `${date}_${event.feature}_${event.model}`;
    if (!aggregations[key]) {
      aggregations[key] = {
        workspaceId: params.workspaceId,
        date,
        feature: event.feature,
        model: event.model,
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        cost: 0
      };
    }
    aggregations[key].requests += 1;
    aggregations[key].inputTokens += event.input_tokens;
    aggregations[key].outputTokens += event.output_tokens;
    aggregations[key].cost += event.estimated_cost;
  }
  const rpcResults = await Promise.all(
    Object.values(aggregations).map(
      (aggregation) => supabase.rpc("increment_daily_metrics", {
        p_workspace_id: aggregation.workspaceId,
        p_date: aggregation.date,
        p_feature: aggregation.feature,
        p_model: aggregation.model,
        p_requests: aggregation.requests,
        p_input_tokens: aggregation.inputTokens,
        p_output_tokens: aggregation.outputTokens,
        p_cost: aggregation.cost
      })
    )
  );
  const rpcError = rpcResults.find((result) => result.error);
  if (rpcError) {
    console.error("Daily metrics aggregation failed:", rpcError.error);
  }
  return {
    ok: true,
    count: dbEvents.length
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  authenticateApiKey,
  extractEventsFromBody,
  ingestTelemetryEvents,
  prepareEvents
});
