// src/index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { createClient } from "@supabase/supabase-js";
import {
  authenticateApiKey,
  ingestTelemetryEvents,
  extractEventsFromBody
} from "@acost/telemetry";
var app = new Hono();
app.use("*", cors());
app.get("/", (c) => c.text("Tracker API is running"));
app.post("/v1/track", async (c) => {
  try {
    const apiKey = c.req.header("x-api-key");
    if (!apiKey) {
      return c.json({ error: "Unauthorized: Missing API Key" }, 401);
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Missing Supabase configuration");
      return c.json({ error: "Internal Server Error" }, 500);
    }
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const apiKeyRecord = await authenticateApiKey(supabase, apiKey);
    if (!apiKeyRecord) {
      return c.json({ error: "Unauthorized: Invalid API Key" }, 401);
    }
    const body = await c.req.json();
    const extracted = extractEventsFromBody(body);
    if ("error" in extracted) {
      return c.json({ error: extracted.error }, 400);
    }
    const result = await ingestTelemetryEvents(supabase, {
      workspaceId: apiKeyRecord.workspaceId,
      keyId: apiKeyRecord.keyId,
      events: extracted.events,
      validation: {
        defaultProvider: "openai",
        defaultModel: "unknown",
        defaultFeature: "api-ingestion"
      }
    });
    if (!result.ok) {
      return c.json({ error: result.error }, result.status);
    }
    return c.json({ success: true, count: result.count });
  } catch (error) {
    console.error("Telemetry Ingestion Error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});
var index_default = app;
if (process.env.NODE_ENV !== "production") {
  const port = 3001;
  console.log(`Tracker API is running on http://localhost:${port}`);
  serve({
    fetch: app.fetch,
    port
  });
}
export {
  index_default as default
};
