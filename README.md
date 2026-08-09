# NicheMaster 2026

NicheMaster is a digital-ebook storefront and content-generation workspace. This repository is being organized as a small monorepo so the storefront, ebook-generation agent, catalog data, and release archives have clear ownership.

## Repository layout

```text
.
├── apps/
│   ├── storefront/          # Customer-facing static storefront
│   └── ebook-agent/         # Ebook generation / catalog tooling
├── packages/
│   ├── catalog/             # Canonical niche and product metadata
│   └── content/             # Generated ebook content and export artifacts
├── assets/
│   ├── covers/              # Book cover assets
│   └── downloads/           # EPUB / HTML / Markdown customer downloads
├── scripts/                 # Build, import, validation, and maintenance scripts
├── docs/                    # Architecture, deployment, and operating notes
└── archive/                 # Legacy packaged releases kept for recovery
```

## Source package used for this organization

The supplied NicheMaster workspace contains three logical projects:

- `storefront/` — the expanded storefront and release assets
- `nichemaster-2026/` — the earlier storefront package and batch data
- `niche_ebook_agent/` — the repeatable ebook-generation agent and 100-book starter catalog

The repository currently retains its existing release ZIPs. The organization branch adds the structure and tooling needed to migrate those archives without destroying the original release artifacts.

## Local development

For the static storefront, no build framework is required. After the storefront files have been extracted into `apps/storefront/`:

```bash
cd apps/storefront
python -m http.server 8080
```

Then open `http://localhost:8080`.

For the ebook agent:

```bash
cd apps/ebook-agent
python scripts/generate_ebooks.py
```

## Important payment configuration

Payment configuration is intentionally kept in a separate storefront config file. Do not commit private API credentials, webhook secrets, or other server-side secrets. The legacy storefront uses a PayPal merchant email for its simple checkout flow; review that configuration before production deployment.

## Deployment target

The storefront is designed for static hosting such as Cloudflare Pages. Keep the customer-facing app dependency-light so it can be deployed without a server build step.

## Organization workflow

Use `scripts/organize_nichemaster.py` to unpack a supplied NicheMaster release into the monorepo layout. The script is deliberately non-destructive: it copies files, preserves the original archive, and reports conflicts instead of silently overwriting files.

See `docs/ARCHITECTURE.md` for the intended ownership of each directory.
