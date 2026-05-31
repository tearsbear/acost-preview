import Link from "next/link";
import { 
  ArrowLeft, 
  RefreshCw, 
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabaseServer";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PricingTable } from "@/components/PricingTable";

export const dynamic = "force-dynamic";

export default async function ProvidersPage() {
  const supabaseAdmin = createSupabaseAdminClient();
  const supabaseServer = createSupabaseServerClient();
  
  // Get current user and feature flag
  const { data: { user } } = await supabaseServer.auth.getUser();
  const allowRegister = process.env.ALLOW_REGISTER === "true";
  
  // Fetch pricing data from the database
  const { data: pricingData, error } = await supabaseAdmin
    .from("model_pricing")
    .select("*")
    .eq("is_active", true)
    .order("provider", { ascending: true })
    .order("input_price", { ascending: true });

  return (
    <main className="min-h-screen bg-canvas selection:bg-accent-wash selection:text-primary">
      <Navbar user={user} allowRegister={allowRegister} />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight text-primary mb-4">
            Real-time AI Model Pricing.
          </h1>
          <p className="text-secondary text-lg leading-relaxed">
            We track {pricingData?.length || 0}+ models across the leading AI providers. Data is synced every 24 hours from official sources via <a href="https://pricetoken.ai" target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-accent/30 hover:decoration-accent transition-colors">PriceToken.ai</a>.
          </p>
        </div>

        {/* Pricing Table Section */}
        {error ? (
          <div className="p-12 text-center bg-surface border border-border rounded-2xl">
            <p className="text-muted text-sm">Failed to load pricing data. Please try again later.</p>
          </div>
        ) : (
          <PricingTable data={pricingData || []} />
        )}

        {/* Notes Section */}
        <section className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="fuser-card bg-emerald-500/5 border-emerald-500/10">
            <h3 className="text-xl font-display font-semibold text-primary mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Verified Rates
            </h3>
            <ul className="space-y-3 text-sm text-secondary leading-relaxed">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Multi-Agent Verification</strong>: Prices are cross-checked across multiple sources.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Historical Snapshots</strong>: We track price drops to give you accurate retroactive billing.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Auto-Sync</strong>: Your dashboard updates automatically when providers change rates.</span>
              </li>
            </ul>
          </div>

          <div className="fuser-card bg-amber-500/5 border-amber-500/10">
            <h3 className="text-xl font-display font-semibold text-primary mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Custom Providers
            </h3>
            <ul className="space-y-3 text-sm text-secondary leading-relaxed">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong>Manual Overrides</strong>: Use <code>estimatedCost</code> for local LLMs or custom wrappers.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong>Flexibility</strong>: Track any model by specifying your own per-token rates.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong>Recommendation</strong>: Always use official IDs when possible for zero-config tracking.</span>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
