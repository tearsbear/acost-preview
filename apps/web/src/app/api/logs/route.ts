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

    const { data: workspaces, error: workspaceError } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id);

    if (workspaceError || !workspaces || workspaces.length === 0) {
      return NextResponse.json({
        events: [],
        total: 0,
        stats: {
          totalRequests: 0,
          totalCost: 0,
          avgLatency: 0,
          totalTokens: 0,
        },
      });
    }

    const workspaceId = workspaces[0].id;

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "25", 10)),
    );
    const offset = (page - 1) * limit;
    const search = searchParams.get("search")?.trim() ?? "";
    const model = searchParams.get("model")?.trim() ?? "";
    const provider = searchParams.get("provider")?.trim() ?? "";
    const feature = searchParams.get("feature")?.trim() ?? "";
    const dateFrom = searchParams.get("dateFrom")?.trim() ?? "";
    const dateTo = searchParams.get("dateTo")?.trim() ?? "";
    const hasLogs = searchParams.get("hasLogs") === "true";

    // Build filtered query
    let query = supabase
      .from("events")
      .select(
        "id, feature, model, provider, input_tokens, output_tokens, estimated_cost, latency, user_id, created_at, prompt, response_content, raw_response, ai_recommendation",
        { count: "exact" },
      )
      .eq("workspace_id", workspaceId);

    if (search) {
      query = query.or(
        `feature.ilike.%${search}%,model.ilike.%${search}%,provider.ilike.%${search}%,user_id.ilike.%${search}%`,
      );
    }
    if (model) query = query.ilike("model", `%${model}%`);
    if (provider) query = query.ilike("provider", `%${provider}%`);
    if (feature) query = query.ilike("feature", `%${feature}%`);
    if (dateFrom) query = query.gte("created_at", dateFrom);
    if (dateTo) query = query.lte("created_at", dateTo + "T23:59:59.999Z");
    if (hasLogs) query = query.not("prompt", "is", null);

    const {
      data: events,
      error: eventsError,
      count,
    } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (eventsError) {
      return NextResponse.json({ error: eventsError.message }, { status: 500 });
    }

    // Stats for the filtered result set (aggregate over all matching rows, not just this page)
    let statsQuery = supabase
      .from("events")
      .select("estimated_cost, latency, input_tokens, output_tokens")
      .eq("workspace_id", workspaceId);

    if (search) {
      statsQuery = statsQuery.or(
        `feature.ilike.%${search}%,model.ilike.%${search}%,provider.ilike.%${search}%,user_id.ilike.%${search}%`,
      );
    }
    if (model) statsQuery = statsQuery.ilike("model", `%${model}%`);
    if (provider) statsQuery = statsQuery.ilike("provider", `%${provider}%`);
    if (feature) statsQuery = statsQuery.ilike("feature", `%${feature}%`);
    if (dateFrom) statsQuery = statsQuery.gte("created_at", dateFrom);
    if (dateTo)
      statsQuery = statsQuery.lte("created_at", dateTo + "T23:59:59.999Z");
    if (hasLogs) statsQuery = statsQuery.not("prompt", "is", null);

    const { data: statsRows } = await statsQuery;

    let totalCost = 0;
    let totalLatency = 0;
    let totalTokens = 0;
    const rowCount = statsRows?.length ?? 0;

    statsRows?.forEach((r) => {
      totalCost += Number(r.estimated_cost) || 0;
      totalLatency += Number(r.latency) || 0;
      totalTokens +=
        (Number(r.input_tokens) || 0) + (Number(r.output_tokens) || 0);
    });

    // Distinct filter options for dropdowns
    const { data: filterOptions } = await supabase
      .from("events")
      .select("model, provider, feature")
      .eq("workspace_id", workspaceId);

    const models = Array.from(
      new Set(filterOptions?.map((r) => r.model).filter(Boolean))
    ).sort();
    const providers = Array.from(
      new Set(filterOptions?.map((r) => r.provider).filter(Boolean))
    ).sort();
    const features = Array.from(
      new Set(filterOptions?.map((r) => r.feature).filter(Boolean))
    ).sort();

    return NextResponse.json({
      events: events ?? [],
      total: count ?? 0,
      page,
      limit,
      stats: {
        totalRequests: rowCount,
        totalCost: Number(totalCost.toFixed(6)),
        avgLatency: rowCount > 0 ? Math.round(totalLatency / rowCount) : 0,
        totalTokens,
      },
      filterOptions: { models, providers, features },
    });
  } catch (error: any) {
    console.error("GET /api/logs error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
