# NicheMaster 2026 migration status

## Current state

The supplied workspace has been inspected and mapped into the monorepo architecture.

- 2,686 files
- ~193 MB uncompressed
- 1,555 JPG assets
- 451 Markdown files
- 306 HTML files
- 300 EPUB files
- 32 JSON files
- 9 JavaScript files
- 2 Python files
- 29 ZIP archives

## Destination map

| Source | Destination |
|---|---|
| `storefront/` | `apps/storefront/` |
| `nichemaster-2026/` | `apps/storefront/legacy/` |
| `niche_ebook_agent/ebooks/` | `packages/content/ebooks/` |
| `niche_ebook_agent/covers/` | `assets/covers/` |
| `niche_ebook_agent/metadata/` | `packages/catalog/metadata/` |
| `niche_ebook_agent/niches_master.json` | `packages/catalog/niches_master.json` |
| `niche_ebook_agent/niches_master_expanded.json` | `packages/catalog/niches_master_expanded.json` |
| `niche_ebook_agent/metadata/ebooks_master_metadata.json` | `packages/catalog/ebooks_master_metadata.json` |
| remaining `niche_ebook_agent/` files | `apps/ebook-agent/` |

## Asset policy

The workspace contains a large amount of generated binary material. The repository should not blindly commit every EPUB, JPG, and nested release ZIP into normal source history. Source code and canonical catalog data belong in Git; generated customer downloads and packaged releases should be promoted deliberately to release storage or Git LFS when that infrastructure is enabled.

## Next implementation step

Run `scripts/organize_nichemaster.py` against the supplied release archive in a local checkout, review the conflict report, then commit the resulting source tree in logical batches. This keeps the migration reviewable and avoids a single opaque 193 MB commit.
