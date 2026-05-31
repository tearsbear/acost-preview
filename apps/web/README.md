# acost Dashboard

The central hub for AI cost intelligence. Manage your workspace, generate API keys, and visualize your AI spending in real-time.

## Features

- **Real-time Analytics**: Pre-aggregated metrics for cost, tokens, and latency.
- **Playground**: Test LLM calls with different providers and track costs instantly.
- **API Key Management**: Securely create and revoke credentials (hashed via SHA-256).
- **Log Explorer**: Deep dive into every tracked AI request with metadata.
- **AI Insights**: Automated cost-saving recommendations based on usage patterns.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React + Apple Minimalist Design
- **Database & Auth**: Supabase
- **Visuals**: Recharts

## Local Development

```bash
pnpm dev
```

Runs on [http://localhost:3000](http://localhost:3000).

## Environment Variables

Required keys:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_ACOST_BASE_URL` (Points to the tracker service)
