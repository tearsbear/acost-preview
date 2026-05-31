import { createClient } from "@supabase/supabase-js";
import ws from "ws";

async function clearData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    realtime: { transport: ws as any }
  });
  console.log("🧹 Dropping all model pricing data...");
  
  const { error } = await supabase
    .from("model_pricing")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

  if (error) {
    console.error("❌ Failed to clear data:", error.message);
  } else {
    console.log("✅ Table cleared.");
  }
}

clearData();
