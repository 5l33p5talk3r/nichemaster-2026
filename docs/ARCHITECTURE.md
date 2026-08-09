# NicheMaster 2026 Architecture

## 1. Storefront

`apps/storefront/` is the customer-facing static web application. It owns:

- `index.html` — catalog landing page
- `product.html` — product detail page
- `thank-you.html` — post-checkout page
- `store.js` — product catalog and UI behavior
- `config.js` — public storefront configuration
- `covers/` — visual product assets
- `downloads/` — customer-facing ebook files

The storefront should remain deployable as static files.

## 2. Ebook agent

`apps/ebook-agent/` contains the repeatable content-generation workflow. It owns the generator code, templates, research notes, and source ebook Markdown.

Generated products should ultimately be promoted into `packages/content/` or the storefront's download area rather than becoming mixed with application code.

## 3. Catalog package

`packages/catalog/` is the canonical machine-readable product catalog. It should contain normalized niche definitions, product metadata, prices, IDs, and publication status.

The storefront should consume catalog data rather than maintaining multiple independent copies whenever practical.

## 4. Content package

`packages/content/` is the canonical location for generated ebook source and release-ready content. Recommended grouping:

```text
packages/content/
├── markdown/
├── epub/
└── html/
```

## 5. Assets

`assets/` is reserved for reusable assets that are not tightly coupled to a single application. Storefront-specific assets can remain under `apps/storefront/` when the static deployment requires them to travel with the app.

## 6. Archive policy

Existing ZIP releases are treated as immutable recovery artifacts. Do not delete them merely to make the repository look cleaner. New organized files should be derived from a release archive and committed separately.

## 7. Security

Do not store server-side secrets, PayPal API credentials, webhook secrets, private keys, or production tokens in the static storefront. Public merchant identifiers may still need review before release.
