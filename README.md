# acost Monorepo

The high-performance AI cost intelligence platform. Track, analyze, and optimize your AI usage across multiple providers with a single REST API.

## Project Structure

This is a `pnpm` monorepo containing the following workspaces:

- **[apps/web](apps/web)**: Next.js dashboard for visualizing AI costs, managing API keys, and exploring models.
- **[apps/tracker](apps/tracker)**: High-performance Hono REST API for high-frequency telemetry ingestion.
- **[packages/telemetry](packages/telemetry)**: Shared core logic for authentication, validation, and database operations.

## Architecture

```txt
[User App] -> [tracker.domain.com] -> [Supabase DB] <- [domain.com]
                  (Ingestion)                              (Dashboard)
```

- **Dashboard**: `domain.com` (Next.js + Tailwind)
- **API Tracker**: `tracker.domain.com` (Hono + Vercel Edge/Serverless)
- **Database**: Shared Supabase instance with atomic aggregation via Postgres RPC.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+
- Supabase Project

### Installation

```bash
pnpm install
```

### Environment Setup

Both `apps/web` and `apps/tracker` require their own `.env` file:

```bash
cp apps/web/.env.local.example apps/web/.env
cp apps/tracker/.env.example apps/tracker/.env
```

### Local Development

Run both services concurrently:

```bash
pnpm dev
```

- **Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Tracker API**: [http://localhost:3001](http://localhost:3001)

## Deployment

Both applications are optimized for **Vercel**.

1. Create two separate projects in Vercel.
2. Point one to `apps/web` (Dashboard).
3. Point one to `apps/tracker` (Tracker API).
4. Configure environment variables in both projects.

## License

Private / Internal.
