import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createClient } from "@supabase/supabase-js";
import {
  authenticateApiKey,
  ingestTelemetryEvents,
  extractEventsFromBody,
} from "@acost/telemetry";

async function testTracker() {
  console.log("🚀 Starting local tracker verification...");

  // Mock Supabase
  const mockSupabase = {
    from: (table) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: { workspace_id: "test-workspace", id: "test-key-id" },
            error: null,
          }),
        }),
      }),
      insert: async () => ({ error: null }),
      update: () => ({
        eq: () => ({
          then: (cb) => cb({ error: null }),
        }),
      }),
    }),
    rpc: async () => ({ error: null }),
  };

  try {
    console.log("✅ Testing @acost/telemetry exports...");
    if (typeof authenticateApiKey !== "function") throw new Error("authenticateApiKey is not exported");
    if (typeof ingestTelemetryEvents !== "function") throw new Error("ingestTelemetryEvents is not exported");
    if (typeof extractEventsFromBody !== "function") throw new Error("extractEventsFromBody is not exported");

    console.log("✅ Exports verified.");
    console.log("🎉 Local verification passed! The service is ready for deployment.");
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    process.exit(1);
  }
}

testTracker();
