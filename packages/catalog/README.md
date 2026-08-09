# Canonical Catalog

This package is the single source of truth for niches, products, pricing metadata, and generated-product references.

## Rules

- Do not maintain separate storefront-only product definitions.
- Preserve legacy catalog files during migration.
- Normalize duplicate records before deleting anything.
- Product IDs must remain stable once published.

Expected core files:

- `niches_master.json`
- `niches_master_expanded.json`
- `ebooks_master_metadata.json`
- `products.json`
