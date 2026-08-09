# Uploaded Workspace Import Plan

The supplied workspace was inspected before changing the repository.

## Inventory

| Source directory | Files | Main contents |
|---|---:|---|
| `storefront/` | 1,427 | 804 JPG, 203 HTML, 200 EPUB, 175 Markdown, JSON/JS/Python and release ZIPs |
| `nichemaster-2026/` | 1,151 | 749 JPG, 174 Markdown, 103 HTML, 100 EPUB, JSON/JS/config and release ZIPs |
| `niche_ebook_agent/` | 108 | 102 Markdown, JSON metadata, 2 JPG, Python generator |

## Target mapping

- `storefront/` → `apps/storefront/`
- `nichemaster-2026/` → `apps/storefront/legacy/`
- `niche_ebook_agent/` → `apps/ebook-agent/`
- canonical niche metadata → `packages/catalog/`
- generated book source → `packages/content/`
- reusable covers → `assets/covers/`
- reusable downloads → `assets/downloads/`

## Why the import is scripted

The uploaded workspace is substantially larger than a normal source-code change and contains many binary release assets. A scripted, non-destructive import is safer than flattening thousands of files into the repository in one opaque commit. The organizer reports conflicts and never silently overwrites existing files unless `--force` is explicitly supplied.

The repository's existing ZIP releases are intentionally preserved as recovery artifacts.
