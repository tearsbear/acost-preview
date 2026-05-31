import { createHash } from "crypto";
import { SupabaseClient } from "@supabase/supabase-js";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export interface TelemetryPayloadEvent {
  feature: unknown;
  model?: unknown;
  provider?: unknown;
  inputTokens: unknown;
  outputTokens: unknown;
  estimatedCost?: unknown;
  latency?: unknown;
  userId?: unknown;
  user?: unknown;
  createdAt?: unknown;
  prompt: unknown;
  responseContent: unknown;
  rawResponse?: unknown;
}

export interface PreparedTelemetryEvent {
  workspace_id: string;
  feature: string;
  model: string;
  provider: string;
  input_tokens: number;
  output_tokens: number;
  estimated_cost: number;
  latency: number;
  user_id: string | null;
  created_at: string;
  prompt: string;
  response_content: string;
  raw_response: JsonValue | null;
  ai_recommendation: string | null;
}

export interface IngestValidationOptions {
  requireUserId?: boolean;
  requireModel?: boolean;
  defaultFeature?: string;
  defaultProvider?: string;
  defaultModel?: string;
  maxBatchSize?: number;
}

export interface AuthenticatedApiKey {
  workspaceId: string;
  keyId: string;
}

interface ModelPricing {
  inputPrice: number;
  outputPrice: number;
}

// In-memory cache for pricing data
let pricingCache: Record<string, ModelPricing> | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function getPricingData(supabase: SupabaseClient): Promise<Record<string, ModelPricing>> {
  const now = Date.now();
  if (pricingCache && now - lastFetchTime < CACHE_TTL) {
    return pricingCache;
  }

  try {
    console.log("📡 Fetching model pricing from database...");
    const { data, error } = await supabase
      .from("model_pricing")
      .select("model_id, input_price, output_price, source")
      .eq("is_active", true);

    if (error) throw error;

    const newCache: Record<string, ModelPricing> = {};
    for (const row of data) {
      // Key format: "model_id:source"
      const key = `${row.model_id}:${row.source}`;
      newCache[key] = {
        inputPrice: row.input_price,
        outputPrice: row.output_price,
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

function readNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readNumber(value: unknown): number {
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

function readCreatedAt(value: unknown): string {
  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) {
    return new Date(value).toISOString();
  }

  return new Date().toISOString();
}

function toJsonValue(value: unknown): JsonValue | null {
  if (value === undefined) {
    return null;
  }

  try {
    return JSON.parse(JSON.stringify(value)) as JsonValue;
  } catch {
    return null;
  }
}

export function extractEventsFromBody(body: unknown):
  | { events: TelemetryPayloadEvent[] }
  | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Bad Request: Request body must be a JSON object" };
  }

  const payload = body as { event?: unknown; events?: unknown };

  if (Array.isArray(payload.events)) {
    if (payload.events.length === 0) {
      return { error: "Bad Request: Events array cannot be empty" };
    }

    return { events: payload.events as TelemetryPayloadEvent[] };
  }

  if (payload.event && typeof payload.event === "object") {
    return { events: [payload.event as TelemetryPayloadEvent] };
  }

  return {
    error: "Bad Request: Provide either an event object or a non-empty events array",
  };
}

export async function authenticateApiKey(
  supabase: SupabaseClient,
  apiKey: string,
): Promise<AuthenticatedApiKey | null> {
  const keyHash = createHash("sha256").update(apiKey).digest("hex");

  const { data, error } = await supabase
    .from("api_keys")
    .select("workspace_id, id")
    .eq("key_hash", keyHash)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    workspaceId: data.workspace_id,
    keyId: data.id,
  };
}

export async function prepareEvents(
  supabase: SupabaseClient,
  workspaceId: string,
  events: TelemetryPayloadEvent[],
  options: IngestValidationOptions,
): Promise<{ dbEvents: PreparedTelemetryEvent[] } | { error: string }> {
  const maxBatchSize = options.maxBatchSize ?? 100;
  if (events.length > maxBatchSize) {
    return {
      error: `Bad Request: Too many events. Maximum ${maxBatchSize} events per request`,
    };
  }

  const pricing = await getPricingData(supabase);
  const dbEvents: PreparedTelemetryEvent[] = [];

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
        error: "Bad Request: Each event must include a non-empty 'responseContent' string",
      };
    }

    if (rawEvent.inputTokens === undefined || rawEvent.inputTokens === null) {
      return { error: "Bad Request: Each event must include 'inputTokens'" };
    }
    const inTokens = readNumber(rawEvent.inputTokens);

    if (rawEvent.outputTokens === undefined || rawEvent.outputTokens === null) {
      return { error: "Bad Request: Each event must include 'outputTokens'" };
    }
    const outTokens = readNumber(rawEvent.outputTokens);

    const rawProvider = readNonEmptyString(rawEvent.provider);
    const model = readNonEmptyString(rawEvent.model) ?? options.defaultModel;

    // Pricing source logic: explicitly 'openrouter' or default to 'pricetoken'
    const provider = rawProvider?.toLowerCase() === "openrouter" ? "openrouter" : "pricetoken";

    const userId =
      readNonEmptyString(rawEvent.userId) ?? readNonEmptyString(rawEvent.user);

    if (options.requireUserId && !userId) {
      return { error: "Bad Request: Each event must include userId" };
    }

    if (options.requireModel && !model) {
      return { error: "Bad Request: Each event must include model" };
    }

    let estimatedCost = readNumber(rawEvent.estimatedCost);

    // Automatic cost calculation fallback
    if (estimatedCost === 0 && model) {
      // Determine pricing source: default to pricetoken unless provider is explicitly openrouter
      const providerLower = provider?.toLowerCase();
      const pricingSource = providerLower === "openrouter" ? "openrouter" : "pricetoken";

      // Normalize model ID for lookup (strip any provider prefix if present)
      let normalizedModel = model.toLowerCase();
      if (normalizedModel.includes("/")) {
        normalizedModel = normalizedModel.split("/").pop() || normalizedModel;
      }

      let modelPricing = pricing[`${normalizedModel}:${pricingSource}`];
      
      // Secondary lookup: Try without source if primary fails
      if (!modelPricing) {
        // Find any source for this model
        const firstMatchKey = Object.keys(pricing).find(k => k.startsWith(`${normalizedModel}:`));
        if (firstMatchKey) {
          modelPricing = pricing[firstMatchKey];
        }
      }

      if (modelPricing) {
        estimatedCost = inTokens * modelPricing.inputPrice + outTokens * modelPricing.outputPrice;
      } else {
        // Last resort: standard fallback rates if model is unknown
        // $0.002 / 1k input, $0.008 / 1k output (roughly GPT-3.5 levels)
        estimatedCost = (inTokens * 0.000002) + (outTokens * 0.000008);
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
      ai_recommendation: null,
    });
  }

  return { dbEvents };
}

export async function ingestTelemetryEvents(
  supabase: SupabaseClient,
  params: {
    workspaceId: string;
    keyId?: string;
    events: TelemetryPayloadEvent[];
    validation?: IngestValidationOptions;
  }
) {
  const validation = params.validation ?? {};
  const prepared = await prepareEvents(supabase, params.workspaceId, params.events, validation);

  if ("error" in prepared) {
    return { ok: false as const, status: 400, error: prepared.error };
  }

  const { dbEvents } = prepared;

  const { error: insertError } = await supabase.from("events").insert(dbEvents);
  if (insertError) {
    console.error("Telemetry insertion failed:", insertError);
    return {
      ok: false as const,
      status: 500,
      error: "Internal Server Error: Telemetry insertion failed",
    };
  }

  if (params.keyId) {
    supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", params.keyId)
      .then(({ error }) => {
        if (error) {
          console.error("Failed to update API key last_used_at", error);
        }
      });
  }

  const aggregations: Record<
    string,
    {
      workspaceId: string;
      date: string;
      feature: string;
      model: string;
      requests: number;
      inputTokens: number;
      outputTokens: number;
      cost: number;
    }
  > = {};

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
        cost: 0,
      };
    }

    aggregations[key].requests += 1;
    aggregations[key].inputTokens += event.input_tokens;
    aggregations[key].outputTokens += event.output_tokens;
    aggregations[key].cost += event.estimated_cost;
  }

  const rpcResults = await Promise.all(
    Object.values(aggregations).map((aggregation) =>
      supabase.rpc("increment_daily_metrics", {
        p_workspace_id: aggregation.workspaceId,
        p_date: aggregation.date,
        p_feature: aggregation.feature,
        p_model: aggregation.model,
        p_requests: aggregation.requests,
        p_input_tokens: aggregation.inputTokens,
        p_output_tokens: aggregation.outputTokens,
        p_cost: aggregation.cost,
      }),
    ),
  );

  const rpcError = rpcResults.find((result) => result.error);
  if (rpcError) {
    console.error("Daily metrics aggregation failed:", rpcError.error);
  }

  return {
    ok: true as const,
    count: dbEvents.length,
  };
}
