import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import {
  extractEventsFromBody,
  ingestTelemetryEvents,
} from "@/lib/telemetry-ingestion";

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
    const { apiKeyId } = body;

    if (!apiKeyId) {
      return NextResponse.json(
        { error: "Bad Request: Missing API Key ID" },
        { status: 400 },
      );
    }

    const extracted = extractEventsFromBody(body);
    if ("error" in extracted) {
      return NextResponse.json(
        { error: extracted.error },
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

    const result = await ingestTelemetryEvents({
      workspaceId: keyRecord.workspace_id,
      keyId: apiKeyId,
      events: extracted.events,
      validation: {
        defaultProvider: "openai",
        defaultModel: "unknown",
        defaultFeature: "playground",
      },
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({ success: true, count: result.count });
  } catch (error: any) {
    console.error("Playground Ingestion Endpoint Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
