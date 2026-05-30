import { NextRequest, NextResponse } from "next/server";
import { FALLBACK_MODELS } from "@/config/fallback-models";
import { getMasterSecret, decryptKeyToken, decryptApiKey } from "@/lib/crypto-server";

export const dynamic = "force-dynamic";

function getModelRates(modelId: string, customInputPrice?: number, customOutputPrice?: number) {
  // If explicitly passed by client, respect it (this handles dynamically loaded OpenRouter models)
  if (typeof customInputPrice === "number" && typeof customOutputPrice === "number") {
    return { input: customInputPrice, output: customOutputPrice };
  }

  // Fallback lookup
  const norm = modelId.toLowerCase();
  const matched = FALLBACK_MODELS.find(
    (m) => m.modelId.toLowerCase() === norm || m.modelId.toLowerCase().endsWith(`/${norm}`)
  );
  if (matched) {
    return { input: matched.inputPrice, output: matched.outputPrice };
  }

  // Sensible default for unrecognized/custom models
  return { input: 0.000002, output: 0.000008 };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      model,
      baseUrl,
      llmApiKey,
      prompt,
      maxTokens,
      provider,
      inputPrice,
      outputPrice,
      encryptedApiKey,
      iv,
      keyToken,
    } = body;

    let actualApiKey = "";
    if (encryptedApiKey && iv && keyToken) {
      try {
        const masterSecret = getMasterSecret();
        const rawKey = decryptKeyToken(keyToken, masterSecret);
        actualApiKey = decryptApiKey(encryptedApiKey, iv, rawKey);
      } catch (decryptionError: any) {
        console.error("Playground LLM Decryption Failed:", decryptionError);
        return NextResponse.json(
          { error: "Failed to decrypt secure API key payload. Please refresh the playground and try again." },
          { status: 400 }
        );
      }
    } else {
      // Graceful fallback to plain-text for backwards compatibility (e.g. curl, test suites)
      actualApiKey = llmApiKey || "";
    }

    if (!model || !baseUrl || !actualApiKey || !prompt) {
      return NextResponse.json(
        { error: "Missing required fields: model, baseUrl, prompt, and API key" },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    let content = "";
    let inputTokens = 0;
    let outputTokens = 0;
    let elapsed = 0;
    let rawResponse: Record<string, unknown> = {};

    if (provider === "anthropic") {
      // ── Native Anthropic Messages API ──
      const endpoint = `${baseUrl.replace(/\/$/, "")}/v1/messages`;
      
      const llmRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": actualApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: maxTokens || 512,
        }),
      });

      elapsed = Date.now() - startTime;
      const llmPayload = await llmRes.json();
      rawResponse = llmPayload;

      if (!llmRes.ok) {
        const errMsg = llmPayload?.error?.message || llmPayload?.error || `HTTP ${llmRes.status}`;
        return NextResponse.json({ error: errMsg }, { status: llmRes.status });
      }

      content = llmPayload.content?.[0]?.text || "";
      inputTokens = llmPayload.usage?.input_tokens ?? 0;
      outputTokens = llmPayload.usage?.output_tokens ?? 0;
    } else {
      // ── Standard Chat Completions API ──
      const endpoint = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

      const llmRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${actualApiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: maxTokens || 512,
        }),
      });

      elapsed = Date.now() - startTime;
      const llmPayload = await llmRes.json();
      rawResponse = llmPayload;

      if (!llmRes.ok) {
        const errMsg = llmPayload?.error?.message || llmPayload?.error || `HTTP ${llmRes.status}`;
        return NextResponse.json({ error: errMsg }, { status: llmRes.status });
      }

      content = llmPayload.choices?.[0]?.message?.content || "";
      inputTokens = llmPayload.usage?.prompt_tokens ?? 0;
      outputTokens = llmPayload.usage?.completion_tokens ?? 0;
    }

    // Get pricing dynamically
    const rates = getModelRates(model, inputPrice, outputPrice);
    const cost = inputTokens * rates.input + outputTokens * rates.output;

    return NextResponse.json({
      success: true,
      content,
      inputTokens,
      outputTokens,
      latency: elapsed,
      cost,
      model,
      provider: provider || "custom",
      rawResponse,
    });
  } catch (err: any) {
    console.error("Playground LLM Proxy Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
