import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const adminSupabase = createSupabaseAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { logId } = await request.json();

    if (!logId) {
      return NextResponse.json({ error: "Log ID is required" }, { status: 400 });
    }

    // Fetch the specific log entry
    const { data: log, error: logError } = await supabase
      .from("events")
      .select("*")
      .eq("id", logId)
      .single();

    if (logError || !log) {
      return NextResponse.json({ error: "Log entry not found" }, { status: 404 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json({ error: "AI Service unavailable" }, { status: 503 });
    }

    const prompt = `
You are a Senior AI Platform Engineer specializing in Cost & Performance Optimization. 
Analyze the following single execution log from "acost" and provide a high-impact, actionable recommendation.

### LOG DATA:
- Feature: ${log.feature}
- Model: ${log.model}
- Latency: ${log.latency}ms
- Cost: $${log.estimated_cost}
- Token Usage: ${log.input_tokens} (Input) / ${log.output_tokens} (Output)

### CONTENT:
- Prompt: "${log.prompt || "N/A"}"
- Response: "${log.response_content || "N/A"}"

### YOUR TASK:
Provide a concise, 2-3 sentence recommendation using this structure:
1. **The Issue**: Identify the primary bottleneck (e.g., model overkill, prompt verbosity, or high latency).
2. **The Fix**: Give a specific, technical instruction (e.g., "Switch to gpt-4o-mini", "Remove redundant examples from the prompt").
3. **The Benefit**: Estimate the impact (e.g., "This will reduce cost by ~80% with negligible quality loss").

### CONSTRAINTS:
- Use a professional, direct tone.
- Do NOT use markdown code blocks.
- Focus on the biggest "win" for this specific log.
- Return ONLY the recommendation text.
`;

    const response = await fetch("https://openagentic.id/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "claude-sonnet-4.5",
        messages: [
          { role: "system", content: "You are a helpful AI optimization assistant." },
          { role: "user", content: prompt },
        ],
      }),
    });

    const llmResult = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: "AI Provider error" }, { status: 500 });
    }

    let recommendation = llmResult.choices[0].message.content;
    
    // Clean up potential markdown
    if (recommendation.includes("```")) {
      recommendation = recommendation.replace(/```[a-z]*\n/g, "").replace(/\n```/g, "").trim();
    }

    // Save/Update the recommendation in the events table
    // Use admin client to bypass RLS for system-level update
    const { error: updateError } = await adminSupabase
      .from("events")
      .update({ ai_recommendation: recommendation })
      .eq("id", logId);

    if (updateError) {
      console.error("Failed to persist AI recommendation:", updateError);
      // We still return the recommendation even if save fails, but log the error
    }

    return NextResponse.json({ recommendation });
  } catch (error: any) {
    console.error("Log Recommendation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
