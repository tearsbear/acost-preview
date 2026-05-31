import { NextRequest, NextResponse } from "next/server";
import {
  authenticateApiKey,
  extractEventsFromBody,
  ingestTelemetryEvents,
} from "@/lib/telemetry-ingestion";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json({ error: "Unauthorized: Missing API Key" }, { status: 401 });
    }

    const apiKeyRecord = await authenticateApiKey(apiKey);
    if (!apiKeyRecord) {
      return NextResponse.json({ error: "Unauthorized: Invalid API Key" }, { status: 401 });
    }

    const body = await request.json();
    const extracted = extractEventsFromBody(body);
    if ("error" in extracted) {
      return NextResponse.json({ error: extracted.error }, { status: 400 });
    }

    const result = await ingestTelemetryEvents({
      workspaceId: apiKeyRecord.workspaceId,
      keyId: apiKeyRecord.keyId,
      events: extracted.events,
      validation: {
        defaultModel: "unknown",
        defaultFeature: "api-ingestion",
      },
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true, count: result.count });
  } catch (error: any) {
    console.error("Telemetry Ingestion Endpoint Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
