import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { createHash } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json({ error: "Unauthorized: Missing API Key" }, { status: 401 });
    }

    // 1. Hash the key using SHA-256 to lookup securely
    const keyHash = createHash("sha256").update(apiKey).digest("hex");

    const supabase = createSupabaseAdminClient();

    // 2. Validate API key
    const { data: apiKeyRecord, error: keyError } = await supabase
      .from("api_keys")
      .select("workspace_id, id")
      .eq("key_hash", keyHash)
      .single();

    if (keyError || !apiKeyRecord) {
      return NextResponse.json({ error: "Unauthorized: Invalid API Key" }, { status: 401 });
    }

    const { workspace_id: workspaceId, id: keyId } = apiKeyRecord;

    // 3. Parse and validate telemetry events batch
    const body = await request.json();
    const { events } = body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: "Bad Request: Missing or invalid events array" }, { status: 400 });
    }

    // 4. Update last_used_at timestamp on the API key asynchronously (fire & forget)
    supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", keyId)
      .then(({ error }) => {
        if (error) console.error("Failed to update API key last_used_at", error);
      });

    // 5. Prepare events and insert into `events` table
    const dbEvents = events.map((event: any) => ({
      workspace_id: workspaceId,
      feature: event.feature,
      model: event.model || "unknown",
      provider: event.provider || "openai",
      input_tokens: Number(event.inputTokens) || 0,
      output_tokens: Number(event.outputTokens) || 0,
      estimated_cost: Number(event.estimatedCost) || 0.0,
      latency: Number(event.latency) || 0,
      user_id: event.userId || null,
      created_at: event.createdAt || new Date().toISOString(),
    }));

    const { error: insertError } = await supabase.from("events").insert(dbEvents);
    if (insertError) {
      console.error("Telemetry Insertion Error:", insertError);
      return NextResponse.json({ error: "Internal Server Error: Telemetry insertion failed" }, { status: 500 });
    }

    // 6. Aggregate batch metrics in-memory to update `daily_metrics` efficiently
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
      // Extract date portion YYYY-MM-DD
      const date = new Date(event.created_at).toISOString().split("T")[0];
      const key = `${date}_${event.feature}_${event.model}`;

      if (!aggregations[key]) {
        aggregations[key] = {
          workspaceId,
          date,
          feature: event.feature,
          model: event.model,
          requests: 0,
          inputTokens: 0,
          outputTokens: 0,
          cost: 0.0,
        };
      }

      aggregations[key].requests += 1;
      aggregations[key].inputTokens += event.input_tokens;
      aggregations[key].outputTokens += event.output_tokens;
      aggregations[key].cost += event.estimated_cost;
    }

    // 7. Increment daily metrics atomically using our Postgres RPC function
    // We execute them in parallel for speed since the batch unique combinations are small
    const incrementPromises = Object.values(aggregations).map((agg) =>
      supabase.rpc("increment_daily_metrics", {
        p_workspace_id: agg.workspaceId,
        p_date: agg.date,
        p_feature: agg.feature,
        p_model: agg.model,
        p_requests: agg.requests,
        p_input_tokens: agg.inputTokens,
        p_output_tokens: agg.outputTokens,
        p_cost: agg.cost,
      })
    );

    const rpcResults = await Promise.all(incrementPromises);
    const rpcError = rpcResults.find((res) => res.error);
    if (rpcError) {
      console.error("Daily Metrics RPC Incrementor Error:", rpcError.error);
      // We don't crash or fail the request since events are already safely logged in `events` table
    }

    return NextResponse.json({ success: true, count: dbEvents.length });
  } catch (error: any) {
    console.error("Telemetry Ingestion Endpoint Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
