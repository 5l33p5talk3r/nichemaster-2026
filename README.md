# NicheMaster 2026

NicheMaster is a digital-product storefront and ebook-generation system. The repository is organized as a small monorepo so the storefront, ebook-generation agent, catalog data, product assets, and release archives have clear ownership.

## Repository layout

```text
.
├── apps/
│   ├── storefront/          # Customer-facing storefront
│   └── ebook-agent/         # Ebook generation / catalog tooling
├── packages/
│   ├── catalog/             # Canonical niche and product metadata
│   └── content/             # Generated ebook content and exports
├── assets/
│   ├── covers/              # Book cover assets
│   └── downloads/           # Customer downloads
├── migrations/              # Cloudflare D1 migrations
├── scripts/                 # Build, import, validation, maintenance
├── docs/                    # Architecture and deployment notes
├── archive/                 # Legacy packaged releases
├── worker.js                # Cloudflare Worker API
└── wrangler.toml            # Cloudflare configuration
```

## Cloudflare architecture

- Cloudflare Pages hosts the static storefront.
- Cloudflare Workers provides the server-side API.
- Cloudflare D1 stores purchase records.
- Cloudflare KV is reserved for wishlist data once the production namespace is created.

`GET /api/health` provides a basic API health check.

`POST /api/purchases` records a completed purchase in D1. It requires `book_id`, `user_email`, `amount_cents`, and `payment_id`; `currency` defaults to `USD`.

The API returns a configuration error until the production D1 binding is enabled.

## Local development

For the static storefront, after the storefront files have been extracted into `apps/storefront/`:

```bash
cd apps/storefront
python -m http.server 8080
```

For the ebook agent, use its project-specific instructions under `apps/ebook-agent/`.

## Production configuration

See `docs/CLOUDFLARE_SETUP.md`. Do not commit Cloudflare credentials, payment secrets, webhook secrets, or production resource IDs.

The original release archives are retained until the actual source migration is verified.
