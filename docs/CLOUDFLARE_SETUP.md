# NicheMaster 2026 — Cloudflare setup

The uploaded deployment configuration targets Cloudflare Pages for the static storefront and optionally Cloudflare Worker/KV/D1 services.

## Pages

Set the Pages build output directory to `.` when deploying the static storefront.

## D1

Create a database named `nichemaster-db`, then apply:

```bash
npx wrangler d1 create nichemaster-db
npx wrangler d1 migrations apply nichemaster-db --remote
```

The production `database_id` must be placed in `wrangler.toml` before enabling the D1 binding.

## KV

Create the namespace used for wishlist data:

```bash
npx wrangler kv namespace create NICHEMASTER_KV
```

The returned namespace ID must be placed in `wrangler.toml` before enabling the binding.

## Secrets

Do not commit PayPal credentials, webhook secrets, API keys, or Cloudflare credentials. Configure them through the Cloudflare dashboard or Wrangler secrets.

## Current state

The repository contains the deployment configuration and initial D1 migration, but production KV/D1 IDs are intentionally not filled in because the uploaded files do not provide those IDs.
