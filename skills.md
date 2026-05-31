# acost Integration Skills

This file provides structured guidance for AI agents and developers to integrate `acost` into any software product. 

## Scope & Boundaries
- **Primary Use Case**: Tracking AI API costs, token usage, and latency from backend environments.
- **Environment**: Backend only (Node.js, Python, Go, etc.). 
- **Security**: Never use these instructions in client-side (browser/mobile) code.
- **API Target**: All telemetry must be sent to the high-performance tracker service at `ACOST_BASE_URL`.

## Structural Overview
acost uses a decoupled architecture to ensure high-speed ingestion:
1. **Tracker Service (`tracker.domain.com`)**: Optimized for receiving telemetry via `POST /v1/track`.
2. **Dashboard (`domain.com`)**: For management and visualization.
3. **Authentication**: Uses a workspace-specific API key passed in the `x-api-key` header.

## Workflows

### 1. Detect AI Call Points
Search the codebase for AI provider SDKs, library imports, or direct HTTP API calls.
- **Keywords**: `openai`, `anthropic`, `gemini`, `google-generativeai`, `groq`, `deepseek`, `mistralai`, `cohere`, `langchain`, `llama-index`, `litellm`, `openrouter`, `together`, `perplexity`, `minimax`, `xiaomi`, `mimo`, `vercel ai`, `ai-sdk`.
- **Patterns**:
  - `chat.completions.create`, `.chat.completions`, `completions.create` (OpenAI/Mistral/Groq)
  - `messages.create`, `.messages` (Anthropic/OpenAI)
  - `generateContent`, `generate_content` (Google Gemini)
  - `generateText`, `streamText`, `generateObject`, `streamObject` (Vercel AI SDK)
  - `.invoke(`, `.stream(`, `.batch(`, `.call(` (LangChain)
  - `.query(`, `.chat(`, `.complete(` (LlamaIndex)
  - `completion(`, `acompletion(` (LiteLLM)
  - `POST` to `.../completions` or `.../chat/completions` (Direct REST)

### 2. Implement Surgical Hook (Pro Pattern)
To ensure 100% reliability without adding latency to your user, use the **Pro Pattern**. This ensures the telemetry is sent even if the main response has already been returned.

#### JavaScript (Standard Node.js / Express)
For long-running servers (not serverless), use a standard non-blocking `void` call. The process won't exit, so the request will complete in the background.

```ts
// Standard Node.js (Express, Fastify, etc.)
app.post("/ai-route", async (req, res) => {
  const response = await openai.call(...);
  
  // Non-blocking fire-and-forget
  fetch(process.env.ACOST_BASE_URL!, {
    method: "POST",
    headers: { "x-api-key": process.env.ACOST_API_KEY! },
    body: JSON.stringify({ event: { ...data } })
  }).catch(err => console.error(err));

  res.json({ result: response });
});
```

#### JavaScript (Serverless / Vercel)
Leverage `waitUntil` (Next.js 14) or `after` (Next.js 15) to keep the execution environment alive.

```ts
import { waitUntil } from "@vercel/functions";

waitUntil(
  fetch(process.env.ACOST_BASE_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": process.env.ACOST_API_KEY! },
    body: JSON.stringify({ event: { ...data } })
  }).catch(() => {})
);
```

#### Python (Standard / Flask / Django)
Use a background thread or a task queue (like Celery) to avoid blocking the main request.

```python
import threading

def send_telemetry(payload):
    requests.post(url, json=payload, headers=headers)

# Inside your route...
threading.Thread(target=send_telemetry, args=(payload,)).start()
```

#### Python (Async / FastAPI)
Use `BackgroundTasks` to handle telemetry after the response is sent.

#### Go
Use a simple goroutine for non-blocking ingestion.

```go
go func(p Payload) {
    // execute standard http POST request
}(payload)
```

### 3. Choose Ingestion Mode
- **If** the app processes requests one-by-one **Then** use **Single Event Mode**.
- **If** the app uses background workers or handles high volume **Then** use **Batch Mode** (up to 100 events).

## Technical Reference

### Environment Variables
```env
ACOST_BASE_URL=https://tracker-acost.vercel.app/v1/track
ACOST_API_KEY=acost_your_secret_key
```

### Required Fields (The "Core Eight")
- `userId`: Unique identifier for your end-user.
- `model`: Exact model ID (e.g., `gpt-4o`, `claude-3-5-sonnet`).
- `feature`: Product feature name (e.g., `chat-bot`).
- `prompt`: The input text sent to the AI.
- `responseContent`: The model's generated response. Can be empty if the model uses reasoning fields (like `reasoning_content`) or was cut off.
- `rawResponse`: The complete raw JSON response from the provider (crucial for auditing and deep debugging).
- `inputTokens`: Token usage for the prompt.
- `outputTokens`: Token usage for the response.

### Recommended Fields
- `latency`: Duration in milliseconds.
- `provider`: Use `openrouter` for market-proxy pricing. Defaults to official `pricetoken` rates if omitted or unlisted.

### Optional Metadata
- `estimatedCost`: Manual cost override. acost will calculate this automatically using model metadata if omitted.
- `createdAt`: ISO 8601 timestamp. Defaults to current time.

### Implementation Examples

#### 1. Single Event Mode
Use this when your application processes requests one-by-one.

**JavaScript (Node.js / Vercel)**
```ts
import { waitUntil } from "@vercel/functions";

// In your API route...
waitUntil(
  fetch(process.env.ACOST_BASE_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": process.env.ACOST_API_KEY! },
    body: JSON.stringify({
      event: {
        userId: user.id,
        model: "gpt-4o",
        feature: "chat-bot",
        prompt: "What is the capital of France?",
        responseContent: "The capital of France is Paris.",
        inputTokens: result.usage.prompt_tokens,
        outputTokens: result.usage.completion_tokens,
        latency: 850,
        rawResponse: result // Required: Always include full provider JSON
      }
    })
  }).catch(() => {})
);
```

**Python**
```python
import requests
import os

payload = {
    "event": {
        "userId": "user_123",
        "model": "gpt-4o",
        "feature": "chat-bot",
        "prompt": "What is the capital of France?",
        "responseContent": "The capital of France is Paris.",
        "inputTokens": 1200,
        "outputTokens": 280,
        "latency": 842,
        "rawResponse": {"id": "chatcmpl-123", "object": "chat.completion"}
    }
}

requests.post(
    os.environ.get("ACOST_BASE_URL"),
    json=payload,
    headers={"x-api-key": os.environ.get("ACOST_API_KEY")}
)
```

**Go**
```go
payload := map[string]interface{}{
    "event": map[string]interface{}{
        "userId":          "user_123",
        "model":           "gpt-4o",
        "feature":         "chat-bot",
        "prompt":          "What is the capital of France?",
        "responseContent": "The capital of France is Paris.",
        "inputTokens":     1200,
        "outputTokens":    280,
        "latency":         842,
        "rawResponse":     map[string]interface{}{"id": "chatcmpl-123"},
    },
}
// ... execute standard http POST request ...
```

#### 2. Batch Mode (Up to 100 events)
Use this for background workers or high-volume ingestion.

**JavaScript (Node.js / Vercel)**
```ts
import { waitUntil } from "@vercel/functions";

// In your background worker...
waitUntil(
  fetch(process.env.ACOST_BASE_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": process.env.ACOST_API_KEY! },
    body: JSON.stringify({
      events: [
        {
          userId: "user_1",
          model: "gpt-4o",
          feature: "chat-bot",
          prompt: "Hello",
          responseContent: "Hi!",
          inputTokens: 900,
          outputTokens: 240,
          latency: 710,
          rawResponse: { id: "chatcmpl-1" }
        },
        {
          userId: "user_2",
          model: "claude-3-5-sonnet",
          feature: "summarizer",
          prompt: "Summarize this...",
          responseContent: "Summary...",
          inputTokens: 1500,
          outputTokens: 420,
          latency: 1240,
          rawResponse: { id: "chatcmpl-2" }
        }
      ]
    })
  }).catch(() => {})
);
```

**Python**
```python
import requests
import os

payload = {
    "events": [
        {
            "userId": "user_1",
            "model": "gpt-4o",
            "feature": "chat-bot",
            "prompt": "Hello",
            "responseContent": "Hi!",
            "inputTokens": 900,
            "outputTokens": 240,
            "latency": 710,
            "rawResponse": {"id": "chatcmpl-1"}
        },
        {
            "userId": "user_2",
            "model": "claude-3-5-sonnet",
            "feature": "summarizer",
            "prompt": "Summarize this...",
            "responseContent": "Summary...",
            "inputTokens": 1500,
            "outputTokens": 420,
            "latency": 1240,
            "rawResponse": {"id": "chatcmpl-2"}
        }
    ]
}

requests.post(
    os.environ.get("ACOST_BASE_URL"),
    json=payload,
    headers={"x-api-key": os.environ.get("ACOST_API_KEY")}
)
```

**Go**
```go
payload := map[string]interface{}{
    "events": []map[string]interface{}{
        {
            "userId":          "user_1",
            "model":           "gpt-4o",
            "feature":         "chat-bot",
            "prompt":          "Hello",
            "responseContent": "Hi!",
            "inputTokens":     900,
            "outputTokens":    240,
            "latency":         710,
            "rawResponse":     map[string]interface{}{"id": "chatcmpl-1"},
        },
        {
            "userId":          "user_2",
            "model":           "claude-3-5-sonnet",
            "feature":         "summarizer",
            "prompt":          "Summarize this...",
            "responseContent": "Summary...",
            "inputTokens":     1500,
            "outputTokens":    420,
            "latency":         1240,
            "rawResponse":     map[string]interface{}{"id": "chatcmpl-2"},
        },
    },
}
// ... execute standard http POST request ...
```

## Guardrails & Constraints
- **Negative Constraint**: Do NOT block the main user request while waiting for `acost`. Always use `void` or a background task.
- **Batch Limit**: Never exceed 100 events in a single `events` array.

## Decision Rules
1. **If** `ACOST_API_KEY` is missing **Then** skip telemetry entirely to prevent application crashes.
2. **If** token usage is missing from the provider response **Then** set `inputTokens` and `outputTokens` to `0` (do not guess).
3. **If** `feature` is unknown **Then** default to `api-integration`.
4. **If** any required field (`userId`, `model`, `feature`, `prompt`, `responseContent`, `rawResponse`, `inputTokens`, `outputTokens`) is missing **Then** the tracker will return a `400 Bad Request` error. Ensure these "Core Eight" fields are always captured.

5. **Reasoning Models**: For models like DeepSeek v3/v4 or OpenAI o1 where the output may be in `reasoning_content`, you can pass an empty string to `responseContent` if `content` is null, but ensure the `rawResponse` contains the full object for auditing.

## Output Template for Agents
When proposing an integration to a user:
1. Identify the file and function being wrapped.
2. Provide the code patch using the **Non-Blocking Pattern**.
3. List the environment variables that must be added.
