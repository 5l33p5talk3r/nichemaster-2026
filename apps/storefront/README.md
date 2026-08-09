# NicheMaster Storefront

Customer-facing static storefront.

## Development

From the repository root:

```bash
python -m http.server 8080 --directory apps/storefront
```

The storefront should consume product metadata from `packages/catalog/` after the source migration is complete.

## Rules

- Keep secrets out of this directory.
- Keep generated EPUB/PDF files out of source unless intentionally promoted to release assets.
- Prefer relative asset paths so the app works on static hosting.
