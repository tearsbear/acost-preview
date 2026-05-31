# acost Tracker API

A lightweight, high-performance REST API built with [Hono](https://hono.dev/) for ingesting AI telemetry events.

## Features

- **Decoupled Architecture**: Separates high-frequency ingestion from the main dashboard.
- **Vercel Edge Ready**: Optimized for ultra-low latency deployments.
- **REST API**: Simple `POST /v1/track` endpoint for any backend environment.
- **Shared Logic**: Uses `@acost/telemetry` for unified authentication and validation.

## API Usage

### Track Event

**Endpoint**: `POST /v1/track`

**Headers**:
- `x-api-key`: `YOUR_ACOST_API_KEY`
- `Content-Type`: `application/json`

**Payload**:
```json
{
  "events": [
    {
      "userId": "user_123",
      "feature": "chat-bot",
      "model": "gpt-4o",
      "prompt": "Hello world",
      "responseContent": "Hi there!",
      "inputTokens": 100,
      "outputTokens": 50,
      "latency": 850
    }
  ]
}
```

## Local Development

```bash
pnpm dev
```

Runs on [http://localhost:3001](http://localhost:3001).

## Tech Stack

- **Framework**: Hono
- **Runtime**: Node.js / Vercel Edge
- **Database**: Supabase (via Shared Package)
