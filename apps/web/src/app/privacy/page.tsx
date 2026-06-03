import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { Shield, Lock, Eye, Database, Mail, Calendar } from "lucide-react";

export default async function PrivacyPolicyPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const allowRegister = process.env.ALLOW_REGISTER === "true";

  return (
    <main className="relative min-h-screen bg-canvas">
      <Navbar user={user} allowRegister={allowRegister} />

      <div className="max-w-4xl mx-auto px-6 py-24 md:py-32">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-wash border border-border text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
            <Shield className="w-3 h-3 text-accent" />
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight text-primary mb-6">
            Privacy Policy
          </h1>
          <p className="text-muted text-lg">
            Last updated:{" "}
            <span className="text-primary font-semibold">
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="space-y-12">
            {/* Introduction */}
            <section className="fuser-card p-8">
              <h2 className="text-2xl font-display font-semibold text-primary mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-wash flex items-center justify-center">
                  <Eye className="w-4 h-4 text-accent" />
                </div>
                Introduction
              </h2>
              <div className="text-secondary space-y-4">
                <p>
                  Welcome to acost ("we," "our," or "us"). We are committed to
                  protecting your privacy and handling your data in an open and
                  transparent manner. This Privacy Policy explains how we
                  collect, use, disclose, and safeguard your information when
                  you use our AI cost intelligence platform.
                </p>
                <p>
                  By accessing or using acost, you agree to the terms of this
                  Privacy Policy. If you do not agree with the terms of this
                  Privacy Policy, please do not access or use our services.
                </p>
              </div>
            </section>

            {/* Information We Collect */}
            <section className="fuser-card p-8">
              <h2 className="text-2xl font-display font-semibold text-primary mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-wash flex items-center justify-center">
                  <Database className="w-4 h-4 text-accent" />
                </div>
                Information We Collect
              </h2>
              <div className="text-secondary space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-3">
                    1. Account Information
                  </h3>
                  <p className="mb-2">
                    When you create an account, we collect:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Email address</li>
                    <li>Password (encrypted and hashed)</li>
                    <li>Workspace name</li>
                    <li>Account creation date</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-primary mb-3">
                    2. Telemetry Data
                  </h3>
                  <p className="mb-2">
                    When you send telemetry to our tracking API, we collect:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>AI provider names (e.g., OpenAI, Anthropic, Google)</li>
                    <li>Model identifiers (e.g., gpt-4, claude-3-opus)</li>
                    <li>Token counts (input and output)</li>
                    <li>Request timestamps</li>
                    <li>Feature tags and metadata</li>
                    <li>Calculated costs based on public pricing</li>
                    <li>Response latency metrics</li>
                  </ul>
                  <p className="mt-3 text-sm italic">
                    <strong>Important:</strong> We do NOT collect or store the
                    actual content of your prompts, completions, or any
                    user-generated content sent to AI providers.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-primary mb-3">
                    3. API Keys (BYOK - Bring Your Own Key)
                  </h3>
                  <p className="mb-2">
                    For features like the AI Playground where you provide your
                    own API keys:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Keys are encrypted using AES-256 encryption before storage
                    </li>
                    <li>
                      Keys are only decrypted when needed to facilitate your
                      requests
                    </li>
                    <li>We never use your API keys for our own purposes</li>
                    <li>You can delete your stored keys at any time</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-primary mb-3">
                    4. Usage Data
                  </h3>
                  <p className="mb-2">
                    We automatically collect certain information, including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Browser type and version</li>
                    <li>Device information</li>
                    <li>IP address (anonymized)</li>
                    <li>Pages visited and features used</li>
                    <li>Time and date of visits</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section className="fuser-card p-8">
              <h2 className="text-2xl font-display font-semibold text-primary mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-wash flex items-center justify-center">
                  <Shield className="w-4 h-4 text-accent" />
                </div>
                How We Use Your Information
              </h2>
              <div className="text-secondary space-y-4">
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process and complete transactions</li>
                  <li>
                    Calculate accurate AI usage costs and generate insights
                  </li>
                  <li>
                    Send you technical notices, updates, and support messages
                  </li>
                  <li>Respond to your comments and questions</li>
                  <li>
                    Detect, prevent, and address technical issues and security
                    vulnerabilities
                  </li>
                  <li>Analyze usage patterns to improve user experience</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

            {/* Data Security */}
            <section className="fuser-card p-8">
              <h2 className="text-2xl font-display font-semibold text-primary mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-wash flex items-center justify-center">
                  <Lock className="w-4 h-4 text-accent" />
                </div>
                Data Security
              </h2>
              <div className="text-secondary space-y-4">
                <p>
                  We implement appropriate technical and organizational security
                  measures to protect your personal information, including:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>AES-256 encryption for sensitive data at rest</li>
                  <li>TLS/SSL encryption for data in transit</li>
                  <li>Secure authentication via Supabase Auth</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and monitoring</li>
                  <li>Secure cloud infrastructure (Vercel, Supabase)</li>
                </ul>
                <p className="mt-4">
                  However, no method of transmission over the Internet or
                  electronic storage is 100% secure. While we strive to use
                  commercially acceptable means to protect your personal
                  information, we cannot guarantee its absolute security.
                </p>
              </div>
            </section>

            {/* Data Sharing */}
            <section className="fuser-card p-8">
              <h2 className="text-2xl font-display font-semibold text-primary mb-4">
                Data Sharing and Disclosure
              </h2>
              <div className="text-secondary space-y-4">
                <p>
                  We do not sell, trade, or rent your personal information to
                  third parties. We may share your information only in the
                  following limited circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Service Providers:</strong> With trusted third-party
                    service providers who assist us in operating our platform
                    (e.g., Vercel for hosting, Supabase for database services)
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law,
                    subpoena, or other legal process
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with a
                    merger, acquisition, or sale of assets
                  </li>
                  <li>
                    <strong>Protection:</strong> To protect the rights,
                    property, or safety of acost, our users, or others
                  </li>
                </ul>
              </div>
            </section>

            {/* Data Retention */}
            <section className="fuser-card p-8">
              <h2 className="text-2xl font-display font-semibold text-primary mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-wash flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-accent" />
                </div>
                Data Retention
              </h2>
              <div className="text-secondary space-y-4">
                <p>
                  We retain your information for as long as your account is
                  active or as needed to provide you services. You may request
                  deletion of your account and associated data at any time by
                  contacting us.
                </p>
                <p>
                  Telemetry data is retained indefinitely to provide historical
                  cost analysis and insights, unless you specifically request
                  its deletion.
                </p>
              </div>
            </section>

            {/* Your Rights */}
            <section className="fuser-card p-8">
              <h2 className="text-2xl font-display font-semibold text-primary mb-4">
                Your Rights
              </h2>
              <div className="text-secondary space-y-4">
                <p>
                  Depending on your location, you may have the following rights
                  regarding your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Access:</strong> Request access to your personal
                    information
                  </li>
                  <li>
                    <strong>Correction:</strong> Request correction of
                    inaccurate data
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your personal
                    information
                  </li>
                  <li>
                    <strong>Portability:</strong> Request a copy of your data in
                    a machine-readable format
                  </li>
                  <li>
                    <strong>Objection:</strong> Object to certain processing of
                    your data
                  </li>
                  <li>
                    <strong>Withdraw Consent:</strong> Withdraw consent where
                    processing is based on consent
                  </li>
                </ul>
                <p className="mt-4">
                  To exercise any of these rights, please contact us using the
                  information provided below.
                </p>
              </div>
            </section>

            {/* Cookies */}
            <section className="fuser-card p-8">
              <h2 className="text-2xl font-display font-semibold text-primary mb-4">
                Cookies and Tracking
              </h2>
              <div className="text-secondary space-y-4">
                <p>
                  We use cookies and similar tracking technologies to track
                  activity on our service and store certain information. You can
                  instruct your browser to refuse all cookies or to indicate
                  when a cookie is being sent.
                </p>
                <p>We use the following types of cookies:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Essential Cookies:</strong> Required for
                    authentication and basic functionality
                  </li>
                  <li>
                    <strong>Preference Cookies:</strong> Remember your settings
                    and preferences
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> Help us understand how
                    visitors interact with our service
                  </li>
                </ul>
              </div>
            </section>

            {/* Third-Party Services */}
            <section className="fuser-card p-8">
              <h2 className="text-2xl font-display font-semibold text-primary mb-4">
                Third-Party Services
              </h2>
              <div className="text-secondary space-y-4">
                <p>Our service uses the following third-party services:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Supabase:</strong> For authentication and database
                    services
                  </li>
                  <li>
                    <strong>Vercel:</strong> For hosting and deployment
                  </li>
                  <li>
                    <strong>PriceToken.ai:</strong> For AI model pricing data
                    (public API)
                  </li>
                  <li>
                    <strong>OpenRouter:</strong> For AI model pricing data
                    (public API)
                  </li>
                </ul>
                <p className="mt-4">
                  These third-party services have their own privacy policies. We
                  encourage you to review their privacy statements.
                </p>
              </div>
            </section>

            {/* Children's Privacy */}
            <section className="fuser-card p-8">
              <h2 className="text-2xl font-display font-semibold text-primary mb-4">
                Children's Privacy
              </h2>
              <div className="text-secondary space-y-4">
                <p>
                  Our service is not intended for individuals under the age of
                  18. We do not knowingly collect personal information from
                  children. If you are a parent or guardian and believe your
                  child has provided us with personal information, please
                  contact us.
                </p>
              </div>
            </section>

            {/* International Users */}
            <section className="fuser-card p-8">
              <h2 className="text-2xl font-display font-semibold text-primary mb-4">
                International Data Transfers
              </h2>
              <div className="text-secondary space-y-4">
                <p>
                  Your information may be transferred to and maintained on
                  computers located outside of your state, province, country, or
                  other governmental jurisdiction where data protection laws may
                  differ.
                </p>
                <p>
                  By using our service, you consent to the transfer of your
                  information to our facilities and to the third parties with
                  whom we share it as described in this Privacy Policy.
                </p>
              </div>
            </section>

            {/* Changes to Privacy Policy */}
            <section className="fuser-card p-8">
              <h2 className="text-2xl font-display font-semibold text-primary mb-4">
                Changes to This Privacy Policy
              </h2>
              <div className="text-secondary space-y-4">
                <p>
                  We may update our Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page and updating the "Last updated" date.
                </p>
                <p>
                  You are advised to review this Privacy Policy periodically for
                  any changes. Changes to this Privacy Policy are effective when
                  they are posted on this page.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="fuser-card p-8 bg-accent-wash/30 border-accent/10">
              <h2 className="text-2xl font-display font-semibold text-primary mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-wash flex items-center justify-center">
                  <Mail className="w-4 h-4 text-accent" />
                </div>
                Contact Us
              </h2>
              <div className="text-secondary space-y-4">
                <p>
                  If you have any questions about this Privacy Policy, or wish
                  to exercise your privacy rights, please contact us at:
                </p>
                <div className="p-4 rounded-lg bg-canvas border border-border">
                  <p className="font-semibold text-primary mb-1">Email</p>
                  <a
                    href="mailto:jiehanandika@gmail.com"
                    className="text-accent hover:underline"
                  >
                    jiehanandika@gmail.com
                  </a>
                </div>
                <p className="text-sm italic">
                  We will respond to all requests within 30 days.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
