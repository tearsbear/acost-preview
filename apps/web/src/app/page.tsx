import Link from "next/link";
import {
  Activity,
  ArrowRight,
  KeyRound,
  Zap,
  LineChart,
  PieChart,
  Shield,
  Layers,
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import DotGrid from "@/components/DotGrid";
import { Navbar } from "@/components/Navbar";

export default async function Home() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  // Server-side check for the landing page (Server Component)
  const allowRegister = process.env.ALLOW_REGISTER === "true";

  return (
    <main className="min-h-screen bg-canvas selection:bg-accent-wash selection:text-primary">
      <Navbar user={user} allowRegister={allowRegister} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden border-b border-border">
        <div className="absolute inset-0 z-0 opacity-60 text-muted dark:text-zinc-500">
          <DotGrid 
            dotSize={4}
            gap={32}
            baseColor="#3a2618"
            activeColor="#F97316"
            proximity={120}
            shockRadius={250}
            shockStrength={5}
            resistance={750}
            returnDuration={1.5}
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-wash border border-border text-primary text-[10px] font-bold uppercase tracking-widest mb-8 animate-fade-in">
            <Zap className="w-3 h-3 text-accent" />
            Telemetry for AI Teams
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-semibold tracking-tight text-primary mb-8 leading-[1.05] animate-fade-in delay-100 mx-auto">
            Turns your AI expenses into <br />
            <span className="text-orange-500 italic text-4xl md:text-6xl lg:text-7xl">actionable business insights.</span>
          </h1>
          <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12 animate-fade-in delay-200">
            acost provides real-time financial visibility into your AI workloads. 
            Track tokens, latency, and costs at the feature level without proxying traffic.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in delay-300">
            {user ? (
              <Link
                href="/dashboard"
                className="button-spring w-full sm:w-auto px-8 py-4 bg-accent text-canvas font-semibold rounded-full text-base shadow-lg flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                {allowRegister && (
                  <Link
                    href="/signup"
                    className="button-spring w-full sm:w-auto px-8 py-4 bg-accent text-canvas font-semibold rounded-full text-base shadow-lg flex items-center justify-center gap-2"
                  >
                    Start Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                <Link
                  href="/docs"
                  className="button-spring w-full sm:w-auto px-8 py-4 bg-surface hover:bg-elevated/40 text-secondary hover:text-primary font-semibold rounded-full text-base border border-border shadow-sm flex items-center justify-center gap-2"
                >
                  View Documentation
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Social Proof / Trusted By */}
      <section className="py-12 bg-surface/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-8">
            Powering AI SaaS Teams
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale contrast-125">
             <div className="text-xl font-bold font-display">OPENAI</div>
             <div className="text-xl font-bold font-display">ANTHROPIC</div>
             <div className="text-xl font-bold font-display">OPENROUTER</div>
             <div className="text-xl font-bold font-display">TOGETHER AI</div>
             <div className="text-xl font-bold font-display">MISTRAL</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 md:py-32 border-b border-border bg-canvas">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-semibold text-primary mb-6">
              AI Profitability Intelligence
            </h2>
            <p className="text-muted text-lg leading-relaxed">
              Stop guessing your margins. acost gives you the granular data you need to 
              optimize your AI costs and improve unit economics.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="fuser-card group hover:border-accent/20 transition-all duration-500">
              <div className="w-12 h-12 rounded-2xl bg-accent-wash flex items-center justify-center text-accent mb-6 group-hover:bg-accent group-hover:text-canvas transition-colors duration-500">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-semibold text-primary mb-3">Granular Telemetry</h3>
              <p className="text-secondary text-sm leading-relaxed">
                Track provider, model, input/output tokens, cost, and latency for every single request in real-time.
              </p>
            </div>
            
            <div className="fuser-card group hover:border-accent/20 transition-all duration-500">
              <div className="w-12 h-12 rounded-2xl bg-accent-wash flex items-center justify-center text-accent mb-6 group-hover:bg-accent group-hover:text-canvas transition-colors duration-500">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-semibold text-primary mb-3">Feature Tracking</h3>
              <p className="text-secondary text-sm leading-relaxed">
                Connect AI costs directly to your product features. Know which parts of your app are profitable and which aren't.
              </p>
            </div>
            
            <div className="fuser-card group hover:border-accent/20 transition-all duration-500">
              <div className="w-12 h-12 rounded-2xl bg-accent-wash flex items-center justify-center text-accent mb-6 group-hover:bg-accent group-hover:text-canvas transition-colors duration-500">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-semibold text-primary mb-3">Cost Analysis</h3>
              <p className="text-secondary text-sm leading-relaxed">
                Beautifully visualized cost breakdowns by model, provider, and feature tag. Identify spend anomalies instantly.
              </p>
            </div>

            <div className="fuser-card group hover:border-accent/20 transition-all duration-500">
              <div className="w-12 h-12 rounded-2xl bg-accent-wash flex items-center justify-center text-accent mb-6 group-hover:bg-accent group-hover:text-canvas transition-colors duration-500">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-semibold text-primary mb-3">Simple Integration</h3>
              <p className="text-secondary text-sm leading-relaxed">
                Generate a workspace key and send telemetry via a simple REST API. No complex SDKs or proxying required.
              </p>
            </div>

            <div className="fuser-card group hover:border-accent/20 transition-all duration-500">
              <div className="w-12 h-12 rounded-2xl bg-accent-wash flex items-center justify-center text-accent mb-6 group-hover:bg-accent group-hover:text-canvas transition-colors duration-500">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-semibold text-primary mb-3">Non-Blocking</h3>
              <p className="text-secondary text-sm leading-relaxed">
                Send telemetry asynchronously from your backend. Your AI responses stay fast, even if the analytics call fails.
              </p>
            </div>

            <div className="fuser-card group hover:border-accent/20 transition-all duration-500">
              <div className="w-12 h-12 rounded-2xl bg-accent-wash flex items-center justify-center text-accent mb-6 group-hover:bg-accent group-hover:text-canvas transition-colors duration-500">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-semibold text-primary mb-3">Usage Trends</h3>
              <p className="text-secondary text-sm leading-relaxed">
                Monitor growth trends and cost spikes over time. Get ahead of your AI bill before it becomes a problem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 md:py-32 border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-semibold text-primary mb-6">
              Connect in 3 minutes
            </h2>
            <p className="text-muted text-lg">
              acost was built to be invisible to your users and painless for your developers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            <div className="hidden lg:block absolute top-10 left-[33%] right-[33%] h-px bg-border border-dashed" />
            
            <div className="relative text-center">
              <div className="w-16 h-16 rounded-full bg-canvas border border-border flex items-center justify-center text-xl font-bold font-display mx-auto mb-8 relative z-10 shadow-sm">
                01
              </div>
              <h3 className="text-xl font-display font-semibold text-primary mb-4">Create API Key</h3>
              <p className="text-muted text-sm leading-relaxed">
                Generate a unique key for your workspace. Store it in your server-side environment variables.
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-16 h-16 rounded-full bg-canvas border border-border flex items-center justify-center text-xl font-bold font-display mx-auto mb-8 relative z-10 shadow-sm">
                02
              </div>
              <h3 className="text-xl font-display font-semibold text-primary mb-4">Post Telemetry</h3>
              <p className="text-muted text-sm leading-relaxed">
                After your AI response finishes, send the metadata to our ingest endpoint. Use our SDK or a simple POST request.
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-16 h-16 rounded-full bg-canvas border border-border flex items-center justify-center text-xl font-bold font-display mx-auto mb-8 relative z-10 shadow-sm">
                03
              </div>
              <h3 className="text-xl font-display font-semibold text-primary mb-4">View Analytics</h3>
              <p className="text-muted text-sm leading-relaxed">
                Open your dashboard to see real-time costs, token counts, and feature economics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32 bg-canvas">
        <div className="max-w-4xl mx-auto px-6">
          <div className="fuser-card bg-surface border border-border p-12 md:p-20 text-center relative overflow-hidden group shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-display font-semibold mb-8 tracking-tight text-primary">
                Ready to understand your <br /> AI margins?
              </h2>
              <p className="text-muted text-lg mb-12 max-w-xl mx-auto">
                Join founders who are building profitable AI products with real-time financial visibility.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="button-spring w-full sm:w-auto px-8 py-4 bg-accent text-canvas font-bold rounded-full text-base shadow-lg"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    {allowRegister && (
                      <Link
                        href="/signup"
                        className="button-spring w-full sm:w-auto px-8 py-4 bg-accent text-canvas font-bold rounded-full text-base shadow-lg"
                      >
                        Get Started Free
                      </Link>
                    )}
                    <Link
                      href="/docs"
                      className="button-spring w-full sm:w-auto px-8 py-4 bg-surface hover:bg-elevated/40 border border-border text-secondary hover:text-primary font-bold rounded-full text-base shadow-sm"
                    >
                      Read the Docs
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-surface">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-accent flex items-center justify-center text-canvas font-bold text-xs">
              a
            </div>
            <span className="font-display font-bold text-base tracking-tight text-primary">
              acost<span className="text-accent">.</span>
            </span>
          </div>
          <div className="flex gap-8 text-xs font-medium text-muted">
            <Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
          </div>
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
            © {new Date().getFullYear()} acost intelligence
          </p>
        </div>
      </footer>
    </main>
  );
}
