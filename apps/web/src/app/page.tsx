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
  CheckCircle2,
  ShieldAlert,
  RefreshCw,
  Plus,
  Minus,
  HelpCircle,
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import DotGrid from "@/components/DotGrid";
import { Navbar } from "@/components/Navbar";
import { FAQAccordion } from "@/components/FAQAccordion";
import { Footer } from "@/components/Footer";
import { WhitelistForm } from "@/components/WhitelistForm";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { LogsShowcase } from "@/components/LogsShowcase";

export default async function Home() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  // Server-side check for the landing page (Server Component)
  const allowRegister = process.env.ALLOW_REGISTER === "true";

  return (
    <main className="relative min-h-screen bg-canvas selection:bg-accent-wash selection:text-primary">
      <Navbar user={user} allowRegister={allowRegister} />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden border-b border-border">
        <div className="absolute inset-0 z-0 text-zinc-400 dark:text-zinc-600">
          <DotGrid 
            dotSize={4}
            gap={32}
            baseColor="currentColor"
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
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-semibold tracking-tight text-primary mb-8 leading-[1.05] animate-fade-in delay-100 mx-auto">
            Turns your AI expenses into <br />
            <span className="text-orange-500 italic text-3xl md:text-5xl lg:text-6xl">actionable business insights.</span>
          </h1>
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

          <ShowcaseCard />
          </div>
        </section>

        <LogsShowcase />

        {/* Features Grid */}
      <section id="official-support" className="py-24 md:py-32 border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-4">
              Pricing Accuracy
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-semibold text-primary mb-6">
              Official Provider Support
            </h2>
            <p className="text-muted text-lg leading-relaxed">
              acost tracks real-time pricing from the world's leading AI providers. 
              Get 100% accurate financial visibility for:
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              "OpenAI", "Anthropic", "Google", "OpenRouter", 
              "xAI (Grok)", "DeepSeek", "Qwen", "Minimax"
            ].map((p) => (
              <div key={p} className="fuser-card transition-all duration-500">
                <div className="w-12 h-12 rounded-2xl bg-accent-wash flex items-center justify-center text-accent mb-6 transition-colors duration-500">
                  {p === "OpenAI" ? (
                    <>
                      <img 
                        src="https://asset.brandfetch.io/idR3duQxYl/idqMspkPnk.svg" 
                        alt="OpenAI" 
                        className="w-7 h-7 block dark:hidden transition-all" 
                      />
                      <img 
                        src="https://asset.brandfetch.io/idR3duQxYl/idu144s-jF.svg" 
                        alt="OpenAI" 
                        className="w-7 h-7 hidden dark:block transition-all" 
                      />
                    </>
                  ) : p === "Anthropic" ? (
                    <>
                      <img 
                        src="https://asset.brandfetch.io/idmJWF3N06/idQoj8D4ho.svg" 
                        alt="Anthropic" 
                        className="w-7 h-7 block dark:hidden transition-all" 
                      />
                      <img 
                        src="https://asset.brandfetch.io/idmJWF3N06/idSuRd_tbF.svg" 
                        alt="Anthropic" 
                        className="w-7 h-7 hidden dark:block transition-all" 
                      />
                    </>
                  ) : p === "Google" ? (
                    <img 
                      src="https://asset.brandfetch.io/id6O2oGzv-/idTwScErMg.svg" 
                      alt="Google" 
                      className="w-7 h-7 transition-all" 
                    />
                  ) : p === "OpenRouter" ? (
                    <img 
                      src="https://asset.brandfetch.io/idKAk-lYn3/idseLVVQ2o.jpeg" 
                      alt="OpenRouter" 
                      className="w-7 h-7 rounded-md transition-all" 
                    />
                  ) : p === "xAI (Grok)" ? (
                    <>
                      <img 
                        src="https://asset.brandfetch.io/iddjpnb3_W/idpeQ1A4Q_.svg" 
                        alt="xAI" 
                        className="w-7 h-7 block dark:hidden transition-all" 
                      />
                      <img 
                        src="https://asset.brandfetch.io/iddjpnb3_W/id2cay63L_.svg" 
                        alt="xAI" 
                        className="w-7 h-7 hidden dark:block transition-all" 
                      />
                    </>
                  ) : p === "DeepSeek" ? (
                    <img 
                      src="https://asset.brandfetch.io/idC_7w82en/idlPpJpfdl.jpeg" 
                      alt="DeepSeek" 
                      className="w-7 h-7 rounded-md transition-all" 
                    />
                  ) : p === "Qwen" ? (
                    <img 
                      src="https://asset.brandfetch.io/idIi0wUGp4/idBvRePqcz.png" 
                      alt="Qwen" 
                      className="w-7 h-7 rounded-md transition-all" 
                    />
                  ) : p === "Minimax" ? (
                    <img 
                      src="https://asset.brandfetch.io/idml4symqn/iddkTyjFvQ.jpeg" 
                      alt="Minimax" 
                      className="w-7 h-7 rounded-md transition-all" 
                    />
                  ) : (
                    <div className="w-6 h-6 bg-accent/10 rounded-lg" />
                  )}
                </div>
                <h3 className="text-lg font-display font-semibold text-primary">{p}</h3>
              </div>
            ))}
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
                Generate a workspace key and send telemetry via a simple REST API. No complex setup or proxying required.
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
            {/* Improved Connector Line */}
            <div className="hidden lg:block absolute top-8 left-[16.6%] right-[16.6%] h-[2px] z-0">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="absolute inset-0 w-full h-full border-t-2 border-dashed border-border/50" />
            </div>
            
            <div className="relative text-center group">
              <div className="w-16 h-16 rounded-full bg-canvas border-2 border-border flex items-center justify-center text-xl font-bold font-display mx-auto mb-8 relative z-10 shadow-sm group-hover:border-accent transition-colors duration-500">
                01
              </div>
              <h3 className="text-xl font-display font-semibold text-primary mb-4">Get Your API Key</h3>
              <p className="text-muted text-sm leading-relaxed">
                Create a secure workspace key in seconds and add it to your server's environment variables.
              </p>
            </div>

            <div className="relative text-center group">
              <div className="w-16 h-16 rounded-full bg-canvas border-2 border-border flex items-center justify-center text-xl font-bold font-display mx-auto mb-8 relative z-10 shadow-sm group-hover:border-accent transition-colors duration-500">
                02
              </div>
              <h3 className="text-xl font-display font-semibold text-primary mb-4">Send Telemetry</h3>
              <p className="text-muted text-sm leading-relaxed">
                After your AI response finishes, send the metadata to our ingest endpoint via a simple, non-blocking POST request.
              </p>
            </div>

            <div className="relative text-center group">
              <div className="w-16 h-16 rounded-full bg-canvas border-2 border-border flex items-center justify-center text-xl font-bold font-display mx-auto mb-8 relative z-10 shadow-sm group-hover:border-accent transition-colors duration-500">
                03
              </div>
              <h3 className="text-xl font-display font-semibold text-primary mb-4">Optimize & Save</h3>
              <p className="text-muted text-sm leading-relaxed">
                Get instant visibility into costs, token usage, and margins. Use AI-driven insights to cut spend immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 md:py-32 border-b border-border bg-surface">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-wash border border-border text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
              <HelpCircle className="w-3 h-3 text-accent" />
              Frequently Asked Questions
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-semibold text-primary">
              Common Questions
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <FAQAccordion 
              items={[
                {
                  q: "What exactly is acost?",
                  a: "acost is an AI Cost Intelligence platform. It provides a lightweight API to track every request your app makes to LLM providers. We turn raw telemetry into actionable insights, helping you understand which features, users, and models are driving your AI spend."
                },
                {
                  q: "Which providers and models are supported?",
                  a: (
                    <>
                      We officially support real-time pricing for <strong>OpenAI, Anthropic, Google (Gemini), OpenRouter, xAI (Grok), DeepSeek, Qwen, and Xiaomi (MiMo)</strong>. 
                      You can view the full list of supported models and their current market rates on our <Link href="/providers" className="text-accent font-bold hover:underline">Supported Providers</Link> page.
                    </>
                  )
                },
                {
                  q: "How does it calculate the cost and track usage?",
                  a: (
                    <div className="space-y-6">
                      <p>
                        acost acts as a lightweight observer. The flow is designed to be non-blocking and highly accurate:
                      </p>
                      
                      <div className="space-y-6">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-sm font-bold text-accent">1</div>
                          <div>
                            <p className="text-base font-bold text-primary mb-1">Observation</p>
                            <p className="text-sm text-secondary">After your AI call finishes, you send the model ID and token counts to our <code>/track</code> endpoint.</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-sm font-bold text-accent">2</div>
                          <div>
                            <p className="text-base font-bold text-primary mb-1">Matching</p>
                            <p className="text-sm text-secondary">Our engine matches your request against our global database (synced daily from PriceToken or OpenRouter).</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-sm font-bold text-accent">3</div>
                          <div>
                            <p className="text-base font-bold text-primary mb-1">Calculation</p>
                            <p className="text-sm text-secondary mb-3">We apply the following formula to determine the exact USD cost:</p>
                            <div className="p-4 rounded-xl bg-canvas border border-border font-mono text-sm text-accent text-center shadow-inner">
                              (Input Tokens × Rate) + (Output Tokens × Rate) = Total Cost
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-accent-wash/30 border border-accent/10">
                        <p className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-accent" />
                          Dual-Source Intelligence
                        </p>
                        <ul className="space-y-2 text-sm text-secondary">
                          <li>• <strong>Standard</strong>: Uses official provider rates via PriceToken.ai.</li>
                          <li>• <strong>OpenRouter</strong>: Automatically uses market rates if <code>provider: "openrouter"</code> is detected.</li>
                        </ul>
                      </div>
                    </div>
                  )
                },
                {
                  q: "Can I use custom or unlisted providers?",
                  a: (
                    <div className="space-y-4">
                      <p>Yes, acost is provider-agnostic. However, there are pros and cons to using unlisted vendors:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                          <p className="text-xs font-bold text-emerald-600 uppercase mb-2 tracking-widest">Pro</p>
                          <p className="text-sm text-secondary leading-relaxed">Total flexibility. Track local models (Ollama), custom wrappers, or internal proxy layers.</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                          <p className="text-xs font-bold text-amber-600 uppercase mb-2 tracking-widest">Cons</p>
                          <p className="text-sm text-secondary leading-relaxed">Requires manual calculation. You must send an <code>estimatedCost</code> in your payload for accurate accounting.</p>
                        </div>
                      </div>
                    </div>
                  )
                },
                {
                  q: "How secure is my data?",
                  a: (
                    <div className="space-y-4">
                      <p>
                        We do not store your provider API keys (OpenAI, Anthropic, etc.) on our servers. 
                      </p>
                      <p>
                        For features like the AI Playground where you Bring Your Own Key (BYOK), we apply industry-standard AES-256 encryption. Your keys are only used to facilitate the request and are never persisted in plain text.
                      </p>
                    </div>
                  )
                }
              ]}
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="whitelist" className="py-24 md:py-32 bg-canvas">
        <div className="max-w-4xl mx-auto px-6">
          <div className="fuser-card bg-surface border border-border p-12 md:p-20 text-center relative overflow-hidden group shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-display font-semibold mb-8 tracking-tight text-primary">
                Join the whitelist
              </h2>
              <p className="text-muted text-lg mb-12 max-w-xl mx-auto">
                Join founders who are building profitable AI products with real-time financial visibility. We'll let you know when we're ready for you.
              </p>
              <WhitelistForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
