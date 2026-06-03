"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { CheckCircle2, ArrowRight } from "lucide-react";

export function WhitelistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createSupabaseBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from("whitelist")
        .insert([
          {
            name,
            email,
            product_description: productDescription,
            product_url: productUrl,
          },
        ]);

      if (insertError) {
        if (insertError.code === "23505") {
          setError("This email is already on the whitelist!");
        } else {
          setError(insertError.message);
        }
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-6 border border-green-500/20">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-2xl font-display font-semibold text-primary mb-2">You're on the list!</h3>
        <p className="text-muted">We'll reach out as soon as we're ready for you.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2" htmlFor="name">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 bg-canvas border border-border rounded-md text-primary placeholder-zinc-500 text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2" htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-4 py-3 bg-canvas border border-border rounded-md text-primary placeholder-zinc-500 text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2" htmlFor="productDescription">
            Tell me about your product <span className="text-muted font-normal lowercase">(optional)</span>
          </label>
          <textarea
            id="productDescription"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            placeholder="What are you building?"
            rows={3}
            className="w-full px-4 py-3 bg-canvas border border-border rounded-md text-primary placeholder-zinc-500 text-sm focus:outline-none focus:border-accent transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2" htmlFor="productUrl">
            Product URL <span className="text-muted font-normal lowercase">(optional)</span>
          </label>
          <input
            id="productUrl"
            type="url"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            placeholder="https://yourproduct.com"
            className="w-full px-4 py-3 bg-canvas border border-border rounded-md text-primary placeholder-zinc-500 text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-xs animate-fade-in text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full button-spring py-4 bg-accent text-canvas font-bold rounded-full text-base shadow-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Join Whitelist
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
