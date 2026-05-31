"use client";

import { useEffect, useState } from "react";
import {
  Play,
  ShieldAlert,
  RefreshCw,
  Sliders,
  MessageSquare,
  DollarSign,
  ChevronDown,
} from "lucide-react";
import type {
  AIModel,
  ProviderGroup,
  ModelsApiResponse,
} from "@/types/ai-model";
import type { ApiKey, LogEntry, RunResult } from "./types";
import { ModelSpecsCard } from "./components/ModelSpecsCard";
import { ResultsModal } from "./components/ResultsModal";
import { SecurityModal } from "./components/SecurityModal";
import { encryptApiKeyClient, type EncryptedEnvelope } from "./crypto-client";

const customProvider: ProviderGroup = {
  provider: "custom",
  label: "Custom Provider",
  baseUrl: "",
  keyPlaceholder: "your-api-key",
  models: [],
};

/* ─── Component ─── */
export default function PlaygroundPage() {
  // Step 1: Acost API Key
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [selectedKeyId, setSelectedKeyId] = useState("");

  // Step 2: Dynamic LLM Providers & Models
  const [providers, setProviders] = useState<ProviderGroup[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [modelSource, setModelSource] = useState<
    "openrouter" | "pricetoken" | "fallback" | "loading"
  >("loading");
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("");
  const [customModel, setCustomModel] = useState("");

  // Step 3: Base URL
  const [baseUrl, setBaseUrl] = useState("https://api.openai.com/v1");

  // Step 4: LLM API Key
  const [llmApiKey, setLlmApiKey] = useState("");

  // Step 5: Test Mode — prompt or slider
  const [testMode, setTestMode] = useState<"prompt" | "slider">("prompt");

  // Prompt mode
  const [prompt, setPrompt] = useState("hello there!");

  // Slider mode
  const [sliderInputTokens, setSliderInputTokens] = useState(350);
  const [sliderOutputTokens, setSliderOutputTokens] = useState(150);

  // Common
  const [feature, setFeature] = useState("playground-test");
  const [userId, setUserId] = useState("user-playground-1");

  // Terminal / Results
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  // Combine fetched providers with the custom provider option
  const allProviders = [...providers, customProvider];
  const currentProvider =
    allProviders.find((p) => p.provider === provider) || customProvider;

  useEffect(() => {
    fetchKeys();
    fetchModels();
  }, []);

  // Sync base URL and model when provider changes
  useEffect(() => {
    if (loadingModels) return;

    setBaseUrl(currentProvider.baseUrl);

    if (currentProvider.models.length > 0) {
      // Find default model (e.g. gpt-4o-mini, haiku, gemini-2.5-flash-preview etc.)
      const defaultModel = currentProvider.models.find(
        (m) =>
          m.modelId.includes("mini") ||
          m.modelId.includes("flash") ||
          m.modelId.includes("haiku") ||
          m.modelId.includes("deepseek-chat"),
      );
      setModel(defaultModel?.modelId || currentProvider.models[0].modelId);
    } else {
      setModel("");
    }
  }, [provider, loadingModels]);

  const fetchKeys = async () => {
    try {
      setLoadingKeys(true);
      const response = await fetch("/api/keys");
      const data = await response.json();
      if (data.keys && data.keys.length > 0) {
        setKeys(data.keys);
        setSelectedKeyId(data.keys[0].id);
      }
    } catch (err) {
      console.error("Failed to load keys for playground", err);
    } finally {
      setLoadingKeys(false);
    }
  };

  const fetchModels = async () => {
    try {
      setLoadingModels(true);
      const res = await fetch("/api/playground/models");
      const data: ModelsApiResponse = await res.json();
      if (data.providers) {
        setProviders(data.providers);
        setModelSource(data.source);
        // Find OpenAI if available, else first
        const initialProvider =
          data.providers.find((p) => p.provider === "openai") ||
          data.providers[0];
        if (initialProvider) {
          setProvider(initialProvider.provider);
          setBaseUrl(initialProvider.baseUrl);
          const defaultModel =
            initialProvider.models.find((m) => m.modelId.includes("mini")) ||
            initialProvider.models[0];
          if (defaultModel) {
            setModel(defaultModel.modelId);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load dynamic models for playground", err);
      setModelSource("fallback");
    } finally {
      setLoadingModels(false);
    }
  };

  const addLog = (
    message: string,
    type: "info" | "success" | "error" | "warn" = "info",
  ) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp: time, type, message }]);
  };

  const clearLogs = () => setLogs([]);

  const getActiveModel = () => (provider === "custom" ? customModel : model);

  const getActiveBaseUrl = () => baseUrl;

  const getSelectedModelObj = (): AIModel | null => {
    if (provider === "custom") return null;
    return currentProvider.models.find((m) => m.modelId === model) || null;
  };

  const calculateCostForParams = (
    activeModel: string,
    inTokens: number,
    outTokens: number,
  ) => {
    const selectedModel = getSelectedModelObj();
    if (selectedModel) {
      return (
        inTokens * selectedModel.inputPrice +
        outTokens * selectedModel.outputPrice
      );
    }
    return inTokens * 0.000002 + outTokens * 0.000008; // Fallback rates
  };

  /* ─── Validation ─── */
  const canRun = () => {
    if (!selectedKeyId) return false;
    if (!getActiveModel()) return false;
    if (!getActiveBaseUrl()) return false;
    if (!llmApiKey.trim()) return false;
    if (testMode === "prompt" && !prompt.trim()) return false;
    return true;
  };

  /* ─── RUN ─── */
  const runTest = async () => {
    if (isRunning || !canRun()) return;
    setIsRunning(true);
    setResult(null);
    setShowModal(true);

    const activeModel = getActiveModel();
    const activeBaseUrl = getActiveBaseUrl();
    const selectedModel = getSelectedModelObj();

    addLog("─── New Test Run ───", "info");
    addLog(`Provider: ${currentProvider.label}`, "info");
    addLog(`Model: ${activeModel}`, "info");
    addLog(`Base URL: ${activeBaseUrl}`, "info");
    addLog(`Test Mode: ${testMode}`, "info");

    const dynamicPricingPayload = selectedModel
      ? {
          inputPrice: selectedModel.inputPrice,
          outputPrice: selectedModel.outputPrice,
        }
      : {};

    // Dynamic Zero-Knowledge transit key exchange & Web Crypto encryption
    addLog("Initiating dynamically secure transit key handshake...", "info");
    let envelope: EncryptedEnvelope | null = null;
    try {
      envelope = await encryptApiKeyClient(llmApiKey.trim());
      addLog(
        "Zero-knowledge client-side AES-GCM encryption complete. API key obfuscated in transit.",
        "success",
      );
    } catch (cryptoError: any) {
      addLog(
        `Dynamic transit key handshake bypassed: ${
          cryptoError.message || cryptoError
        }. Falling back to standard SSL transit.`,
        "warn",
      );
    }

    const authPayload = envelope
      ? {
          encryptedApiKey: envelope.encryptedApiKey,
          iv: envelope.iv,
          keyToken: envelope.keyToken,
        }
      : {
          llmApiKey: llmApiKey.trim(),
        };

    if (testMode === "prompt") {
      // ── PROMPT MODE: Real LLM call via server proxy ──
      addLog("Sending prompt to LLM via server proxy...", "info");
      addLog(
        `Prompt: "${prompt.slice(0, 80)}${prompt.length > 80 ? "..." : ""}"`,
        "info",
      );

      try {
        const res = await fetch("/api/playground/llm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: activeModel,
            baseUrl: activeBaseUrl,
            prompt,
            provider,
            maxTokens: 512,
            ...dynamicPricingPayload,
            ...authPayload,
          }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          addLog(`LLM Error: ${data.error || `HTTP ${res.status}`}`, "error");
          setIsRunning(false);
          return;
        }

        addLog(`LLM Response received in ${data.latency}ms`, "success");
        addLog(
          `Tokens — Input: ${data.inputTokens}, Output: ${data.outputTokens}`,
          "success",
        );
        addLog(`Estimated Cost: $${data.cost.toFixed(6)}`, "success");
        addLog(
          `Response: "${(data.content || "").slice(0, 100)}${
            (data.content || "").length > 100 ? "..." : ""
          }"`,
          "info",
        );

        setResult({
          content: data.content,
          inputTokens: data.inputTokens,
          outputTokens: data.outputTokens,
          latency: data.latency,
          cost: data.cost,
          model: data.model,
          provider: data.provider,
          rawResponse: data.rawResponse,
        });

        // Track to dashboard
        await trackEvent({
          model: data.model,
          provider: data.provider,
          inputTokens: data.inputTokens,
          outputTokens: data.outputTokens,
          cost: data.cost,
          latency: data.latency,
          prompt,
          responseContent: data.content,
          rawResponse: data.rawResponse,
        });
      } catch (err: any) {
        addLog(`Network Error: ${err.message || err}`, "error");
        setIsRunning(false);
        return;
      }
    } else {
      // ── SLIDER MODE: Real LLM call with controlled token parameters ──
      const estimatedWordsForInputTokens = Math.max(
        10,
        Math.floor(sliderInputTokens * 0.7),
      );
      const syntheticPrompt =
        `Write exactly ${sliderOutputTokens} tokens about AI cost tracking. ${"lorem ipsum dolor sit amet consectetur adipiscing elit ".repeat(
          Math.ceil(estimatedWordsForInputTokens / 8),
        )}`.slice(0, estimatedWordsForInputTokens * 5);

      addLog(
        `Slider mode: Generating ~${sliderInputTokens} input tokens, requesting ~${sliderOutputTokens} output tokens`,
        "info",
      );
      addLog("Sending padded prompt to LLM via server proxy...", "info");

      try {
        const res = await fetch("/api/playground/llm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: activeModel,
            baseUrl: activeBaseUrl,
            prompt: syntheticPrompt,
            provider,
            maxTokens: sliderOutputTokens,
            ...dynamicPricingPayload,
            ...authPayload,
          }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          addLog(`LLM Error: ${data.error || `HTTP ${res.status}`}`, "error");
          setIsRunning(false);
          return;
        }

        addLog(`LLM Response received in ${data.latency}ms`, "success");
        addLog(
          `Actual Tokens — Input: ${data.inputTokens}, Output: ${data.outputTokens}`,
          "success",
        );
        addLog(`Estimated Cost: $${data.cost.toFixed(6)}`, "success");

        setResult({
          content: data.content,
          inputTokens: data.inputTokens,
          outputTokens: data.outputTokens,
          latency: data.latency,
          cost: data.cost,
          model: data.model,
          provider: data.provider,
          rawResponse: data.rawResponse,
        });

        // Track to dashboard
        await trackEvent({
          model: data.model,
          provider: data.provider,
          inputTokens: data.inputTokens,
          outputTokens: data.outputTokens,
          cost: data.cost,
          latency: data.latency,
          prompt: syntheticPrompt,
          responseContent: data.content,
          rawResponse: data.rawResponse,
        });
      } catch (err: any) {
        addLog(`Network Error: ${err.message || err}`, "error");
        setIsRunning(false);
        return;
      }
    }

    setIsRunning(false);
  };

  /* ─── Track event to acost dashboard ─── */
  const trackEvent = async (params: {
    model: string;
    provider: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    latency: number;
    prompt?: string;
    responseContent?: string;
    rawResponse?: Record<string, unknown>;
  }) => {
    addLog("Sending telemetry to Acost dashboard...", "info");

    try {
      const response = await fetch("/api/playground/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKeyId: selectedKeyId,
          events: [
            {
              feature,
              userId: userId || undefined,
              model: params.model,
              provider: params.provider,
              inputTokens: params.inputTokens,
              outputTokens: params.outputTokens,
              estimatedCost: params.cost,
              latency: params.latency,
              createdAt: new Date().toISOString(),
              prompt: params.prompt || "(no prompt provided)",
              responseContent:
                params.responseContent || "(no response content provided)",
              ...(params.rawResponse !== undefined && {
                rawResponse: params.rawResponse,
              }),
            },
          ],
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        addLog(
          "Telemetry tracked successfully — visible in your dashboard.",
          "success",
        );
      } else {
        addLog(
          `Tracking Error: ${data.error || `HTTP ${response.status}`}`,
          "error",
        );
      }
    } catch (err: any) {
      addLog(`Tracking Network Error: ${err.message || err}`, "error");
    }
  };

  /* ─── Slider estimated cost ─── */
  const sliderEstimatedCost = calculateCostForParams(
    getActiveModel(),
    sliderInputTokens,
    sliderOutputTokens,
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-baseline gap-4 mb-2 flex-wrap">
          <h1 className="text-4xl font-display font-semibold tracking-tight text-primary">
            Playground
          </h1>
          {modelSource === "openrouter" && (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live OpenRouter API
            </span>
          )}
          {modelSource === "pricetoken" && (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live PriceToken API
            </span>
          )}
          {modelSource === "fallback" && (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Offline Fallback Models
            </span>
          )}
          {modelSource === "loading" && (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-pulse" />
              Loading Metadata...
            </span>
          )}
        </div>
        <p className="text-muted text-sm leading-relaxed">
          Test real LLM API calls with dynamically loaded model metadata &
          pricing. Every request logs precise cost telemetry directly to your
          dashboard.
        </p>
      </div>

      {/* Form Card */}
      <div className="fuser-card space-y-6">
        {/* ─── STEP 1: Acost API Key ─── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent text-canvas text-[10px] font-bold">
              1
            </span>
            <label className="text-xs font-bold text-primary uppercase tracking-wider">
              Acost API Key
            </label>
          </div>
          {loadingKeys ? (
            <div className="text-xs text-muted flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-accent" />
              <span>Loading keys...</span>
            </div>
          ) : keys.length === 0 ? (
            <div className="text-xs text-muted flex items-center gap-2 bg-surface border border-border p-3.5 rounded-md">
              <ShieldAlert className="w-4 h-4" />
              <span>
                No API keys found. Create one in the <strong>API Keys</strong>{" "}
                page first.
              </span>
            </div>
          ) : (
            <select
              value={selectedKeyId}
              onChange={(e) => setSelectedKeyId(e.target.value)}
              className="w-full px-4 py-2.5 bg-canvas border border-border rounded-md text-primary text-sm focus:outline-none focus:border-accent transition-colors cursor-pointer"
            >
              {keys.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name} ({k.display_prefix})
                </option>
              ))}
            </select>
          )}
          <p className="text-[10px] text-muted mt-1.5">
            Telemetry from this test will be logged under this key in your
            dashboard.
          </p>
        </div>

        <div className="border-t border-border" />

        {/* ─── STEP 2: LLM Provider + Model ─── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent text-canvas text-[10px] font-bold">
              2
            </span>
            <label className="text-xs font-bold text-primary uppercase tracking-wider">
              LLM Provider & Model
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Provider */}
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
                Provider
              </label>
              {loadingModels ? (
                <div className="h-10 w-full bg-canvas border border-border rounded-md animate-pulse flex items-center px-4 text-xs text-muted">
                  Loading AI providers...
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-4 py-2.5 bg-canvas border border-border rounded-md text-primary text-sm focus:outline-none focus:border-accent transition-colors appearance-none pr-8 cursor-pointer"
                  >
                    {allProviders.map((prov) => (
                      <option key={prov.provider} value={prov.provider}>
                        {prov.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>

            {/* Model */}
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
                Model
              </label>
              {loadingModels ? (
                <div className="h-10 w-full bg-canvas border border-border rounded-md animate-pulse flex items-center px-4 text-xs text-muted">
                  Loading models...
                </div>
              ) : provider === "custom" ? (
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="e.g. my-model-v2"
                  className="w-full px-4 py-2.5 bg-canvas border border-border rounded-md text-primary placeholder-zinc-500 text-sm focus:outline-none focus:border-accent transition-colors"
                />
              ) : (
                <div className="relative">
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-canvas border border-border rounded-md text-primary text-sm focus:outline-none focus:border-accent transition-colors appearance-none pr-8 cursor-pointer"
                  >
                    {currentProvider.models.map((m) => (
                      <option key={m.modelId} value={m.modelId}>
                        {m.displayName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Model Specs */}
          {provider !== "custom" && (
            <ModelSpecsCard selectedModel={getSelectedModelObj()} />
          )}
        </div>

        <div className="border-t border-border" />

        {/* ─── STEP 3: Base URL ─── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent text-canvas text-[10px] font-bold">
              3
            </span>
            <label className="text-xs font-bold text-primary uppercase tracking-wider">
              Base URL
            </label>
          </div>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.openai.com/v1"
            readOnly={provider !== "custom"}
            className={`w-full px-4 py-2.5 bg-canvas border border-border rounded-md text-primary placeholder-zinc-500 text-sm font-mono focus:outline-none focus:border-accent transition-colors ${
              provider !== "custom" ? "opacity-60" : ""
            }`}
          />
          {provider !== "custom" && (
            <p className="text-[10px] text-muted mt-1.5">
              Auto-filled from provider config. Select &quot;Custom
              Provider&quot; to enter a manual endpoint.
            </p>
          )}
        </div>

        <div className="border-t border-border" />

        {/* ─── STEP 4: LLM API Key ─── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent text-canvas text-[10px] font-bold">
              4
            </span>
            <label className="text-xs font-bold text-primary uppercase tracking-wider">
              LLM API Key
            </label>
          </div>
          <input
            id="llm-api-key-input"
            type="password"
            value={llmApiKey}
            onChange={(e) => setLlmApiKey(e.target.value)}
            placeholder={currentProvider.keyPlaceholder}
            className="w-full px-4 py-2.5 bg-canvas border border-border rounded-md text-primary placeholder-zinc-500 text-sm font-mono focus:outline-none focus:border-accent transition-colors"
          />
          <div className="flex items-center justify-between flex-wrap gap-2 mt-1.5">
            <p className="text-[10px] text-muted leading-relaxed">
              Sent server-side to the LLM provider.{" "}
              <strong>Never stored</strong> in our database — exists only in
              memory during the request.
            </p>
            <button
              type="button"
              onClick={() => setShowSecurityModal(true)}
              className="text-[10px] text-accent hover:underline font-semibold cursor-pointer select-none"
            >
              How it works & View security
            </button>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* ─── STEP 5: Test Mode ─── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent text-canvas text-[10px] font-bold">
              5
            </span>
            <label className="text-xs font-bold text-primary uppercase tracking-wider">
              Test Mode
            </label>
          </div>

          {/* Mode Tabs */}
          <div className="flex bg-surface border border-border p-1 rounded-lg w-fit mb-4">
            <button
              onClick={() => setTestMode("prompt")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                testMode === "prompt"
                  ? "bg-canvas border border-border text-primary shadow-sm"
                  : "text-muted hover:text-primary"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Prompt</span>
            </button>
            <button
              onClick={() => setTestMode("slider")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                testMode === "slider"
                  ? "bg-canvas border border-border text-primary shadow-sm"
                  : "text-muted hover:text-primary"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Slider</span>
            </button>
          </div>

          {testMode === "prompt" ? (
            <div className="space-y-3">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Type your prompt here..."
                className="w-full px-4 py-2.5 bg-canvas border border-border rounded-md text-primary placeholder-zinc-500 text-sm focus:outline-none focus:border-accent transition-colors leading-relaxed"
              />
              <p className="text-[10px] text-muted">
                Sends this prompt directly to the LLM. Real token counts and
                latency are tracked.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-[10px] text-muted">
                Control approximate token volume via sliders. A padded prompt is
                generated to approximate the input size, and max_tokens is set
                for output. Real LLM call is still made.
              </p>

              {/* Input Tokens Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-muted uppercase tracking-wider">
                  <span>Target Input Tokens</span>
                  <span className="font-mono text-primary text-xs">
                    {sliderInputTokens}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="4000"
                  step="10"
                  value={sliderInputTokens}
                  onChange={(e) => setSliderInputTokens(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer bg-border h-1 rounded-lg"
                />
              </div>

              {/* Output Tokens Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-muted uppercase tracking-wider">
                  <span>Max Output Tokens</span>
                  <span className="font-mono text-primary text-xs">
                    {sliderOutputTokens}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="4000"
                  step="10"
                  value={sliderOutputTokens}
                  onChange={(e) =>
                    setSliderOutputTokens(Number(e.target.value))
                  }
                  className="w-full accent-black cursor-pointer bg-border h-1 rounded-lg"
                />
              </div>

              <div className="bg-canvas border border-border rounded-md p-3 text-xs text-muted flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>
                  Estimated cost:{" "}
                  <strong className="text-primary font-mono">
                    ${sliderEstimatedCost.toFixed(6)}
                  </strong>
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border" />

        {/* ─── Optional: Feature Tag + User ID ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
              Feature Tag
            </label>
            <input
              type="text"
              value={feature}
              onChange={(e) => setFeature(e.target.value)}
              placeholder="e.g. chatbot-widget"
              className="w-full px-4 py-2.5 bg-canvas border border-border rounded-md text-primary placeholder-zinc-500 text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
              User Identifier
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. customer_782"
              className="w-full px-4 py-2.5 bg-canvas border border-border rounded-md text-primary placeholder-zinc-500 text-sm font-mono focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        {/* ─── RUN BUTTON ─── */}
        <button
          onClick={runTest}
          disabled={isRunning || !canRun() || loadingModels}
          className="w-full button-spring py-3 bg-accent hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-canvas font-semibold rounded-md text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isRunning ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          <span>
            {isRunning
              ? "Executing..."
              : testMode === "prompt"
              ? "Run Prompt Test"
              : "Run Slider Test"}
          </span>
        </button>
      </div>

      {/* Results Telemetry Console Modal */}
      <ResultsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        isRunning={isRunning}
        result={result}
        logs={logs}
      />

      <SecurityModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
      />
    </div>
  );
}
