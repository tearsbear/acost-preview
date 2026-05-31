import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import {
  authenticateApiKey as sharedAuthenticateApiKey,
  ingestTelemetryEvents as sharedIngestTelemetryEvents,
  extractEventsFromBody,
  TelemetryPayloadEvent,
  IngestValidationOptions,
} from "@acost/telemetry";

export { extractEventsFromBody };
export type { TelemetryPayloadEvent, IngestValidationOptions };

export async function authenticateApiKey(apiKey: string) {
  const supabase = createSupabaseAdminClient();
  return sharedAuthenticateApiKey(supabase, apiKey);
}

export async function ingestTelemetryEvents(params: {
  workspaceId: string;
  keyId?: string;
  events: TelemetryPayloadEvent[];
  validation?: IngestValidationOptions;
}) {
  const supabase = createSupabaseAdminClient();
  return sharedIngestTelemetryEvents(supabase, params);
}
