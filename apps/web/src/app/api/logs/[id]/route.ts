import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Log ID is required" }, { status: 400 });
    }

    const { data: log, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !log) {
      return NextResponse.json({ error: "Log entry not found" }, { status: 404 });
    }

    return NextResponse.json(log);
  } catch (error: any) {
    console.error("GET /api/logs/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
