import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify user cookie session
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { apiKeyId, events } = body;

    if (!apiKeyId) {
      return NextResponse.json(
        { error: "Bad Request: Missing API Key ID" },
        { status: 400 },
      );
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "Bad Request: Missing or invalid events array" },
        { status: 400 },
      );
    }

    // 2. Lookup key to confirm ownership and extract workspace_id
    // Supabase RLS for select automatically filters out keys that don't belong to workspaces owned by the user.
    const { data: keyRecord, error: keyError } = await supabase
      .from("api_keys")
      .select("workspace_id")
      .eq("id", apiKeyId)
      .single();

    if (keyError || !keyRecord) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid key selection or permission denied" },
        { status: 401 },
      );
    }

    const { workspace_id: workspaceId } = keyRecord;

    // 3. Prepare and insert events using admin client (bypasses RLS for write)
    const adminSupabase = createSupabaseAdminClient();

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
      prompt: event.prompt ?? null,
      response_content: event.responseContent ?? null,
      raw_response: event.rawResponse ?? null,
    }));

    const { error: insertError } = await adminSupabase
      .from("events")
      .insert(dbEvents);
    if (insertError) {
      console.error(
        "Playground Ingestion Database Insertion Error:",
        insertError,
      );
      return NextResponse.json(
        { error: "Internal Server Error: Telemetry insertion failed" },
        { status: 500 },
      );
    }

    // 4. Update last_used_at on the key
    adminSupabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", apiKeyId)
      .then(({ error }) => {
        if (error)
          console.error(
            "Failed to update playground API key last_used_at",
            error,
          );
      });

    // 5. Aggregate and increment daily metrics atomically
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

    const incrementPromises = Object.values(aggregations).map((agg) =>
      adminSupabase.rpc("increment_daily_metrics", {
        p_workspace_id: agg.workspaceId,
        p_date: agg.date,
        p_feature: agg.feature,
        p_model: agg.model,
        p_requests: agg.requests,
        p_input_tokens: agg.inputTokens,
        p_output_tokens: agg.outputTokens,
        p_cost: agg.cost,
      }),
    );

    const rpcResults = await Promise.all(incrementPromises);
    const rpcError = rpcResults.find((res) => res.error);
    if (rpcError) {
      console.error(
        "Playground Ingestion RPC Incrementor Error:",
        rpcError.error,
      );
    }

    return NextResponse.json({ success: true, count: dbEvents.length });
  } catch (error: any) {
    console.error("Playground Ingestion Endpoint Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
