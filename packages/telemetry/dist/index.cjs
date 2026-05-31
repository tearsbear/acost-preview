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
function prepareEvents(workspaceId, events, options) {
  const maxBatchSize = options.maxBatchSize ?? 100;
  if (events.length > maxBatchSize) {
    return {
      error: `Bad Request: Too many events. Maximum ${maxBatchSize} events per request`
    };
  }
  const dbEvents = [];
  for (const rawEvent of events) {
    const feature = readNonEmptyString(rawEvent.feature) ?? options.defaultFeature ?? "external-api";
    const provider = readNonEmptyString(rawEvent.provider) ?? options.defaultProvider;
    const model = readNonEmptyString(rawEvent.model) ?? options.defaultModel;
    const userId = readNonEmptyString(rawEvent.userId) ?? readNonEmptyString(rawEvent.user);
    if (options.requireUserId && !userId) {
      return { error: "Bad Request: Each event must include userId" };
    }
    if (options.requireProvider && !provider) {
      return { error: "Bad Request: Each event must include provider" };
    }
    if (options.requireModel && !model) {
      return { error: "Bad Request: Each event must include model" };
    }
    dbEvents.push({
      workspace_id: workspaceId,
      feature,
      model: model ?? "unknown",
      provider: provider ?? "openai",
      input_tokens: readNumber(rawEvent.inputTokens),
      output_tokens: readNumber(rawEvent.outputTokens),
      estimated_cost: readNumber(rawEvent.estimatedCost),
      latency: readNumber(rawEvent.latency),
      user_id: userId ?? null,
      created_at: readCreatedAt(rawEvent.createdAt),
      prompt: readNonEmptyString(rawEvent.prompt) ?? null,
      response_content: readNonEmptyString(rawEvent.responseContent) ?? null,
      raw_response: toJsonValue(rawEvent.rawResponse),
      ai_recommendation: null
    });
  }
  return { dbEvents };
}
async function ingestTelemetryEvents(supabase, params) {
  const validation = params.validation ?? {};
  const prepared = prepareEvents(params.workspaceId, params.events, validation);
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
