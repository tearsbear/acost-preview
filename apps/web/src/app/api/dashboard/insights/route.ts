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
        summary: "No workspace data found.",
        insights: [],
        recommendations: [],
      });
    }

    const workspaceId = workspaces[0].id;
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "true";

    // 1. Check Cache first (1 hour TTL)
    if (!forceRefresh) {
      const { data: cachedData, error: cacheError } = await supabase
        .from("ai_insights_cache")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!cacheError && cachedData) {
        const createdAt = new Date(cachedData.created_at).getTime();
        const now = new Date().getTime();
        const oneHour = 60 * 60 * 1000;

        if (now - createdAt < oneHour) {
          console.log("Returning cached AI insights");
          return NextResponse.json({
            summary: cachedData.summary,
            insights: cachedData.insights,
            recommendations: cachedData.recommendations,
            cached: true,
            cachedAt: cachedData.created_at
          });
        }
      }
    }

    // Fetch Daily Metrics (last 30 days)
    const { data: dailyMetrics } = await supabase
      .from("daily_metrics")
      .select("date, total_requests, total_cost, model, feature")
      .eq("workspace_id", workspaceId)
      .order("date", { ascending: false })
      .limit(100);

    // Fetch Recent events for context
    const { data: recentEvents } = await supabase
      .from("events")
      .select("feature, model, input_tokens, output_tokens, estimated_cost, latency, prompt, response_content")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!dailyMetrics || dailyMetrics.length === 0) {
      return NextResponse.json({
        summary: "Not enough data to generate insights yet.",
        insights: [],
        recommendations: [],
      });
    }

    // Prepare data for LLM
    const metricsSummary = dailyMetrics.slice(0, 14); // Last 14 entries
    const eventsContext = recentEvents?.map(ev => ({
      feature: ev.feature,
      model: ev.model,
      cost: ev.estimated_cost,
      prompt: ev.prompt?.substring(0, 100),
      response: ev.response_content?.substring(0, 100)
    }));

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json({
        summary: "AI Insights are currently unavailable (API key missing).",
        insights: ["Please configure OPENAI_API_KEY in your environment."],
        recommendations: [],
      });
    }

    const prompt = `
You are the Virtual CTO and Cost Intelligence Expert for "acost". 
Your goal is to analyze the user's AI workload data and provide a "Profitability Audit".

### DATA CONTEXT:
1. Metrics (Last 14 days):
${JSON.stringify(metricsSummary, null, 2)}

2. Recent Executions (Samples):
${JSON.stringify(eventsContext, null, 2)}

### ANALYSIS FRAMEWORK:
- **Efficiency Gap**: Is the token-to-value ratio healthy?
- **Model-Task Fit**: Are expensive models being used for "commodity" tasks?
- **Latency ROI**: Is high latency justified by the output quality?
- **Cost Anomalies**: Identify unexpected spikes or patterns.

### RESPONSE FORMAT:
Return ONLY a JSON object:
{
  "summary": "A 1-2 sentence executive summary of the overall account health.",
  "insights": [
    { 
      "text": "Specific finding (e.g., 'Feature X is responsible for 60% of total spend but has 2s+ latency').", 
      "priority": "high" | "medium" | "low" 
    }
  ],
  "recommendations": [
    "Actionable instruction (e.g., 'Migrate the 'Summary' feature to Claude Haiku to save $45/mo')."
  ]
}

### CONSTRAINTS:
- Maximum 3 insights.
- Insights must be data-driven based on the provided JSON.
- Recommendations must be specific and "implementable today".
`;

    const response = await fetch("https://openagentic.id/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "claude-sonnet-4.6",
        messages: [
          { role: "system", content: "You are a helpful AI cost optimization assistant." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    const rawText = await response.text();
    const jsonEndIndex = rawText.lastIndexOf("}");
    const cleanJson = rawText.substring(0, jsonEndIndex + 1);
    const llmResult = JSON.parse(cleanJson);
    
    if (!response.ok) {
      console.error("OpenAI API Error:", llmResult);
      return NextResponse.json({
        summary: "Failed to generate AI insights due to an API error.",
        insights: [llmResult.error?.message || "Unknown error"],
        recommendations: [],
      });
    }

    try {
      let content = llmResult.choices[0].message.content;
      
      // Handle potential markdown code blocks in the response
      if (content.includes("```json")) {
        content = content.split("```json")[1].split("```")[0].trim();
      } else if (content.includes("```")) {
        content = content.split("```")[1].split("```")[0].trim();
      }
      
      const insights = JSON.parse(content);

      // 3. Persist to cache (always insert new record, retrieval gets latest)
      await supabase.from("ai_insights_cache").insert({
        workspace_id: workspaceId,
        summary: insights.summary,
        insights: insights.insights,
        recommendations: insights.recommendations,
        created_at: new Date().toISOString(),
      });

      return NextResponse.json(insights);
    } catch (parseError) {
      console.error("Failed to parse AI insights JSON:", parseError);
      return NextResponse.json({
        summary: "Failed to process AI insights.",
        insights: ["The AI returned an invalid response format."],
        recommendations: [],
      });
    }
  } catch (error: any) {
    console.error("AI Insights Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI insights" },
      { status: 500 }
    );
  }
}
