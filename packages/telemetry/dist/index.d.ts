import { SupabaseClient } from '@supabase/supabase-js';

type JsonValue = string | number | boolean | null | {
    [key: string]: JsonValue;
} | JsonValue[];
interface TelemetryPayloadEvent {
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
interface PreparedTelemetryEvent {
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
interface IngestValidationOptions {
    requireUserId?: boolean;
    requireModel?: boolean;
    defaultFeature?: string;
    defaultProvider?: string;
    defaultModel?: string;
    maxBatchSize?: number;
}
interface AuthenticatedApiKey {
    workspaceId: string;
    keyId: string;
}
declare function extractEventsFromBody(body: unknown): {
    events: TelemetryPayloadEvent[];
} | {
    error: string;
};
declare function authenticateApiKey(supabase: SupabaseClient, apiKey: string): Promise<AuthenticatedApiKey | null>;
declare function prepareEvents(supabase: SupabaseClient, workspaceId: string, events: TelemetryPayloadEvent[], options: IngestValidationOptions): Promise<{
    dbEvents: PreparedTelemetryEvent[];
} | {
    error: string;
}>;
declare function ingestTelemetryEvents(supabase: SupabaseClient, params: {
    workspaceId: string;
    keyId?: string;
    events: TelemetryPayloadEvent[];
    validation?: IngestValidationOptions;
}): Promise<{
    ok: false;
    status: number;
    error: string;
    count?: undefined;
} | {
    ok: true;
    count: number;
    status?: undefined;
    error?: undefined;
}>;

export { type AuthenticatedApiKey, type IngestValidationOptions, type JsonValue, type PreparedTelemetryEvent, type TelemetryPayloadEvent, authenticateApiKey, extractEventsFromBody, ingestTelemetryEvents, prepareEvents };
