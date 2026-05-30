# acost Integration Skills

This file helps a developer or agent integrate `acost` into an existing codebase.

The goal is to:

- detect where AI API calls already happen
- attach telemetry at the correct integration points
- send telemetry to `POST /api/external/consume`
- preserve app behavior without blocking user-facing requests

## Integration Target

Send telemetry from the user's backend to:

```txt
POST {ACOST_BASE_URL}
```

Recommended environment variables:

```env
ACOST_BASE_URL=https://your-domain.com/api/external/consume
ACOST_API_KEY=acost_your_secret_key
```

Required telemetry fields per event:

- `userId`
- `provider`
- `model`

Recommended fields:

- `feature`
- `inputTokens`
- `outputTokens`
- `estimatedCost`
- `latency`
- `createdAt`
- `prompt`
- `responseContent`
- `rawResponse`

## Main Rule

Do not ask users to rewrite their architecture.

Instead:

1. find the existing AI provider call
2. wrap it or add a small telemetry call immediately after it succeeds
3. read usage, model, latency, and user context from the existing flow
4. send a non-blocking telemetry request to `acost`

## How To Detect AI API Calls

Always inspect the codebase first and look for existing AI provider SDKs, HTTP calls, or wrappers.

### Common Providers

Look for these libraries, imports, or clients:

- `openai`
- `anthropic`
- `@anthropic-ai/sdk`
- `@google/generative-ai`
- `google.generativeai`
- `vertexai`
- `openrouter`
- `together`
- `replicate`
- `groq`
- `cohere`
- `mistralai`
- `langchain`
- `vercel ai`

### Common Call Shapes

Search for patterns like:

```txt
chat.completions.create(
responses.create(
messages.create(
messages.stream(
generateContent(
generate_content(
invoke(
ainvoke(
client.chat.completions.create(
fetch("https://api.openai.com
fetch("https://api.anthropic.com
fetch("https://generativelanguage.googleapis.com
```

### Heuristic Search Strategy

When integrating into a user's codebase, search in this order:

1. provider SDK imports
2. custom AI service files like `ai.ts`, `llm.ts`, `openai.ts`, `chat-service.ts`
3. HTTP clients calling provider endpoints directly
4. business features that obviously trigger AI:
   - chat
   - summarize
   - generate
   - classify
   - extract
   - translate
   - analyze
   - embeddings

### Files That Usually Contain AI Calls

Prioritize these locations:

- `src/lib`
- `src/services`
- `src/server`
- `app/api`
- `pages/api`
- `controllers`
- `workers`
- `jobs`
- `functions`
- `routes`

## Where To Hook Telemetry

Best integration points:

- the single shared AI client wrapper
- the provider adapter layer
- the server action or route handler that calls the model
- the queue worker that performs background AI jobs

Avoid:

- adding telemetry in React client components
- duplicating telemetry in multiple downstream layers
- blocking the main request on telemetry success

## Telemetry Mapping

Map user code to `acost` fields like this:

- `userId`: application user id, workspace member id, account id, or tenant user id
- `provider`: `openai`, `anthropic`, `gemini`, `openrouter`, `replicate`, etc.
- `model`: exact model used in the request
- `feature`: product feature name like `chat`, `pdf-summary`, `support-bot`
- `inputTokens`: prompt/input token count from provider usage
- `outputTokens`: completion/output token count from provider usage
- `estimatedCost`: provider cost calculated in the app if available
- `latency`: total duration in milliseconds
- `createdAt`: request completion timestamp
- `prompt`: optional prompt text if the user explicitly wants prompt logging
- `responseContent`: optional output text
- `rawResponse`: optional sanitized provider response

## Non-Blocking Pattern

Always prefer fire-and-forget telemetry from server-side code:

```ts
void fetch(process.env.ACOST_BASE_URL!, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.ACOST_API_KEY!,
  },
  body: JSON.stringify({
    event: {
      userId: appUser.id,
      provider: "openai",
      model: result.model,
      feature: "chat",
      inputTokens: result.usage?.prompt_tokens ?? 0,
      outputTokens: result.usage?.completion_tokens ?? 0,
      estimatedCost: estimatedCost,
      latency,
      createdAt: new Date().toISOString(),
    },
  }),
}).catch((error) => {
  console.warn("acost telemetry failed", error);
});
```

## Provider Detection Notes

### OpenAI

Common response fields:

- `result.model`
- `result.usage.prompt_tokens`
- `result.usage.completion_tokens`

Typical hooks:

- `openai.chat.completions.create(...)`
- `openai.responses.create(...)`

### Anthropic

Common response fields depend on SDK version, but often include:

- `response.model`
- `response.usage.input_tokens`
- `response.usage.output_tokens`

Typical hooks:

- `anthropic.messages.create(...)`

### Gemini

Usage fields may vary by SDK or endpoint.

Look for:

- model name in request config
- token counts in usage metadata
- total duration around `generateContent(...)`

Typical hooks:

- `model.generateContent(...)`
- `client.models.generateContent(...)`

### Direct HTTP Calls

If the user does not use an SDK, detect:

- `fetch(...)`
- `axios.post(...)`
- `got.post(...)`

Check the request URL for provider domains and extract:

- model from request body
- provider from hostname
- usage from response JSON

## Example Integration Workflow

### Step 1

Find the main AI call:

```ts
const result = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages,
});
```

### Step 2

Measure latency:

```ts
const startedAt = Date.now();
const result = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages,
});
const latency = Date.now() - startedAt;
```

### Step 3

Send telemetry:

```ts
void fetch(process.env.ACOST_BASE_URL!, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.ACOST_API_KEY!,
  },
  body: JSON.stringify({
    event: {
      userId: user.id,
      provider: "openai",
      model: result.model,
      feature: "chat",
      inputTokens: result.usage?.prompt_tokens ?? 0,
      outputTokens: result.usage?.completion_tokens ?? 0,
      estimatedCost: 0,
      latency,
    },
  }),
}).catch(() => {});
```

## Batch Mode

If the user's architecture already uses queues or event buffers, send batches:

```ts
await fetch(process.env.ACOST_BASE_URL!, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.ACOST_API_KEY!,
  },
  body: JSON.stringify({
    events: telemetryEvents,
  }),
});
```

Batch rules:

- maximum `100` events per request
- each event must include `userId`, `provider`, and `model`

## Framework Notes

### Next.js

Prefer integration inside:

- route handlers
- server actions
- backend utility modules

Avoid client-side browser telemetry with secret keys.

### Express / Fastify / NestJS

Prefer integration inside:

- service layer
- controller wrapper
- interceptor
- provider client module

### Python Backends

Wrap:

- OpenAI client calls
- Anthropic client calls
- Gemini SDK calls
- direct `requests` / `httpx` provider calls

### Workers / Queues

If AI runs in a worker:

- log telemetry from the worker itself
- use job payload metadata to fill `userId` and `feature`

## Safety Rules

- never block the main user request on telemetry success
- never expose `ACOST_API_KEY` in frontend code
- avoid storing prompts by default unless explicitly needed
- prefer one shared wrapper over many scattered hooks
- avoid double logging the same AI request

## Success Criteria

The integration is correct when:

- AI calls are detected in the real backend execution path
- telemetry is emitted after successful provider responses
- `userId`, `provider`, and `model` are always present
- latency and token usage are captured when available
- the app still behaves normally if `acost` is temporarily unavailable

## Output Template For Agents

When helping a user integrate, produce:

1. the exact file where the AI call happens
2. the exact function or route to wrap
3. the telemetry fields available from that code path
4. the missing fields that need to be inferred
5. the final code patch that sends telemetry to `ACOST_BASE_URL`
