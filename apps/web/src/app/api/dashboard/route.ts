import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Retrieve active workspaces for the current user
    const { data: workspaces, error: workspaceError } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id);

    if (workspaceError || !workspaces || workspaces.length === 0) {
      return NextResponse.json({
        summary: {
          requests: 0,
          cost: 0.0,
          avgLatency: 0,
          inputTokens: 0,
          outputTokens: 0,
        },
        charts: [],
        models: [],
        events: [],
      });
    }

    const workspaceId = workspaces[0].id;

    // 1. Fetch pre-aggregated Daily Metrics
    const { data: dailyMetrics, error: metricsError } = await supabase
      .from("daily_metrics")
      .select(
        "date, total_requests, total_input_tokens, total_output_tokens, total_cost, model, feature",
      )
      .eq("workspace_id", workspaceId)
      .order("date", { ascending: true });

    if (metricsError) {
      return NextResponse.json(
        { error: metricsError.message },
        { status: 500 },
      );
    }

    // 2. Fetch Recent raw events (last 10)
    const { data: recentEvents, error: eventsError } = await supabase
      .from("events")
      .select(
        "id, feature, model, provider, input_tokens, output_tokens, estimated_cost, latency, user_id, created_at, prompt, response_content, raw_response, ai_recommendation",
      )
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (eventsError) {
      return NextResponse.json({ error: eventsError.message }, { status: 500 });
    }

    // 3. Process aggregates in memory for maximum rendering performance
    let totalRequests = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCost = 0.0;
    let totalLatencySum = 0;
    let latencyCount = 0;

    // We can query average latency from raw events to be extremely precise
    const { data: latencyAvgData } = await supabase
      .from("events")
      .select("latency")
      .eq("workspace_id", workspaceId);

    if (latencyAvgData && latencyAvgData.length > 0) {
      latencyAvgData.forEach((ev) => {
        totalLatencySum += ev.latency;
        latencyCount++;
      });
    }

    const avgLatency =
      latencyCount > 0 ? Math.round(totalLatencySum / latencyCount) : 0;

    // Daily metrics rollups for charts
    const dailyChartDataMap: Record<
      string,
      { date: string; cost: number; requests: number; tokens: number }
    > = {};
    const modelBreakdownMap: Record<
      string,
      { model: string; requests: number; cost: number }
    > = {};

    if (dailyMetrics) {
      dailyMetrics.forEach((m) => {
        totalRequests += m.total_requests;
        totalInputTokens += m.total_input_tokens;
        totalOutputTokens += m.total_output_tokens;
        totalCost += Number(m.total_cost);

        // Chart aggregation
        const dateStr = m.date;
        if (!dailyChartDataMap[dateStr]) {
          dailyChartDataMap[dateStr] = {
            date: dateStr,
            cost: 0.0,
            requests: 0,
            tokens: 0,
          };
        }
        dailyChartDataMap[dateStr].cost += Number(m.total_cost);
        dailyChartDataMap[dateStr].requests += m.total_requests;
        dailyChartDataMap[dateStr].tokens +=
          m.total_input_tokens + m.total_output_tokens;

        // Model aggregation
        const modelStr = m.model;
        if (!modelBreakdownMap[modelStr]) {
          modelBreakdownMap[modelStr] = {
            model: modelStr,
            requests: 0,
            cost: 0.0,
          };
        }
        modelBreakdownMap[modelStr].requests += m.total_requests;
        modelBreakdownMap[modelStr].cost += Number(m.total_cost);
      });
    }

    return NextResponse.json({
      summary: {
        requests: totalRequests,
        cost: Number(totalCost.toFixed(6)),
        avgLatency,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
      },
      charts: Object.values(dailyChartDataMap),
      models: Object.values(modelBreakdownMap),
      events: recentEvents || [],
    });
  } catch (error: any) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
