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
You are an AI Cost Intelligence expert for "acost", a platform for AI SaaS founders. 
Your goal is to provide financial clarity and identify profitability issues.

DATA:
Metrics (Daily Aggregates by feature and model):
${JSON.stringify(metricsSummary, null, 2)}

Recent Events Context (Sample of raw completions):
${JSON.stringify(eventsContext, null, 2)}

ANALYSIS FOCUS:
1. Feature Profitability: Which features are costing the most? Are they using models that are too expensive (e.g., using GPT-4 for simple classification)?
2. Cost Trends: Is there a sudden spike or a steady increase that needs attention?
3. Efficiency: Are prompts too verbose based on the token counts?
4. Model Usage: Are they over-relying on a single provider? Could they switch to gpt-4o-mini or Claude Haiku for certain features?

GOAL:
- Provide a clear, data-driven summary.
- List 3-5 specific, actionable insights.
- Provide 3 clear recommendations for cost optimization.

FORMAT:
Return ONLY a JSON object with this structure:
{
  "summary": "Short paragraph summary (max 2 sentences)",
  "insights": [
    { "text": "Insight description", "priority": "high" | "medium" | "low" }
  ],
  "recommendations": ["Actionable step 1", "Actionable step 2"]
}

CONSTRAINTS:
- Maximum 3 insights.
- Insights MUST have a priority: high, medium, or low.
- Keep descriptions concise.
`;

    const response = await fetch("https://openagentic.id/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "claude-opus-4.6",
        messages: [
          { role: "system", content: "You are a helpful AI cost optimization assistant." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    const llmResult = await response.json();
    
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
