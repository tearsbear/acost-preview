import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { runPricingSync } from "./index";

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials in environment");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: { 'x-my-custom-header': 'my-app-name' },
    },
    realtime: {
      transport: ws as any,
    },
  });
  const result = await runPricingSync(supabase);
  
  if (result.success) {
    console.log(`✅ Successfully synced ${result.count} models.`);
  } else {
    console.error(`❌ Sync failed: ${result.error}`);
  }
}

main();
