import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { handle } from "hono/vercel";
import { createClient } from "@supabase/supabase-js";
import {
  authenticateApiKey,
  ingestTelemetryEvents,
  extractEventsFromBody,
} from "@acost/telemetry";
import { runPricingSync } from "@acost/pricing";

const app = new Hono();

// Enable CORS for external integrations
app.use("*", cors());

// Health check
app.get("/", (c) => c.text("Tracker API is running"));

// Internal Sync Endpoint
app.on(["GET", "POST"], "/v1/internal/sync-pricing", async (c) => {
  const secret = c.req.header("x-internal-secret") || c.req.query("secret");
  const expectedSecret = process.env.INTERNAL_SYNC_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return c.json({ error: "Missing Supabase configuration" }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const result = await runPricingSync(supabase);

  if (result.success) {
    return c.json({ success: true, count: result.count });
  } else {
    return c.json({ error: result.error }, 500);
  }
});

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

    // 1. Authenticate API Key
    const apiKeyRecord = await authenticateApiKey(supabase, apiKey);
    if (!apiKeyRecord) {
      return c.json({ error: "Unauthorized: Invalid API Key" }, 401);
    }

    // 2. Parse and Extract Events
    const body = await c.req.json();
    const extracted = extractEventsFromBody(body);
    if ("error" in extracted) {
      return c.json({ error: extracted.error }, 400);
    }

    // 3. Ingest Events
    const result = await ingestTelemetryEvents(supabase, {
      workspaceId: apiKeyRecord.workspaceId,
      keyId: apiKeyRecord.keyId,
      events: extracted.events,
      validation: {
        defaultModel: "unknown",
        defaultFeature: "api-ingestion",
      },
    });

    if (!result.ok) {
      return c.json({ error: result.error }, result.status as any);
    }

    return c.json({ success: true, count: result.count });
  } catch (error: any) {
    console.error("Telemetry Ingestion Error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default app;

// Vercel Serverless Function handlers
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
export const OPTIONS = handle(app);

if (process.env.NODE_ENV !== "production") {
  const port = 3001;
  console.log(`Tracker API is running on http://localhost:${port}`);
  serve({
    fetch: app.fetch,
    port,
  });
}
