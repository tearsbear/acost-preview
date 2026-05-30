import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createHash, randomBytes } from "crypto";

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
      return NextResponse.json({ keys: [] });
    }

    const workspaceIds = workspaces.map((w) => w.id);

    // Retrieve API Keys for workspaces owned by the user
    const { data: keys, error: keyError } = await supabase
      .from("api_keys")
      .select("id, name, display_prefix, created_at, last_used_at, workspace_id")
      .in("workspace_id", workspaceIds)
      .order("created_at", { ascending: false });

    if (keyError) {
      return NextResponse.json({ error: keyError.message }, { status: 500 });
    }

    return NextResponse.json({ keys });
  } catch (error: any) {
    console.error("GET /api/keys error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, workspaceId } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Verify user ownership of the designated workspace
    const { data: workspace, error: wError } = await supabase
      .from("workspaces")
      .select("id")
      .eq("id", workspaceId)
      .eq("owner_id", user.id)
      .single();

    if (wError || !workspace) {
      return NextResponse.json({ error: "Invalid workspace or permission denied" }, { status: 400 });
    }

    // Generate full cryptographic key (SHA-256 verified)
    const rawToken = randomBytes(24).toString("hex");
    const fullKey = `acost_${rawToken}`;
    const displayPrefix = `acost_${rawToken.slice(0, 8)}...`;
    const keyHash = createHash("sha256").update(fullKey).digest("hex");

    const { data: keyRecord, error: insertError } = await supabase
      .from("api_keys")
      .insert({
        name,
        display_prefix: displayPrefix,
        key_hash: keyHash,
        workspace_id: workspaceId,
      })
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Return the raw API key ONLY ONCE to let users copy
    return NextResponse.json({
      id: keyRecord.id,
      apiKey: fullKey,
    });
  } catch (error: any) {
    console.error("POST /api/keys error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Key ID is required" }, { status: 400 });
    }

    // Execute deletion (RLS policies ensure deletion is owned-only)
    const { error } = await supabase.from("api_keys").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/keys error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
