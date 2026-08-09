# NicheMaster 2026 — Next Phase

## Goal
Turn the organized repository into one maintainable product pipeline.

## Migration order
1. Extract and classify storefront source.
2. Extract and classify ebook-agent source.
3. Consolidate niche/product catalog data.
4. Move product assets out of application source.
5. Wire storefront product discovery to the canonical catalog.
6. Add validation/build checks.
7. Prepare deployment configuration.

## Safety rules
- Preserve original release archives until migration is verified.
- Do not delete legacy source until its replacement is confirmed.
- Keep generated EPUB/JPG files out of normal source directories.
- Keep secrets and environment files out of Git.

## Definition of done
A new product can be represented in the canonical catalog, associated with its cover/download asset, and surfaced by the storefront without manually editing multiple unrelated files.
