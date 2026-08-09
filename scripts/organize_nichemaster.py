#!/usr/bin/env python3
"""Organize a NicheMaster release archive into the repository layout.

Usage:
    python scripts/organize_nichemaster.py path/to/release.zip

The script copies files instead of moving them, preserves the source archive,
and refuses to overwrite an existing destination unless --force is supplied.
"""
from __future__ import annotations

import argparse
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PREFIX_MAP = {
    "storefront/": "apps/storefront/",
    "nichemaster-2026/": "apps/storefront/legacy/",
    "niche_ebook_agent/": "apps/ebook-agent/",
}

SPECIAL_FILES = {
    "niche_ebook_agent/niches_master.json": "packages/catalog/niches_master.json",
    "niche_ebook_agent/niches_master_expanded.json": "packages/catalog/niches_master_expanded.json",
    "niche_ebook_agent/metadata/ebooks_master_metadata.json": "packages/catalog/ebooks_master_metadata.json",
}


def destination_for(name: str) -> Path | None:
    name = name.replace("\\", "/").lstrip("/")
    if name in SPECIAL_FILES:
        return ROOT / SPECIAL_FILES[name]
    for prefix, target in PREFIX_MAP.items():
        if name.startswith(prefix):
            relative = name[len(prefix):]
            return ROOT / target / relative
    return None


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("archive", type=Path)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    archive = args.archive.expanduser().resolve()
    if not archive.is_file():
        raise SystemExit(f"Archive not found: {archive}")

    copied = skipped = conflicts = 0
    with zipfile.ZipFile(archive) as zf:
        for info in zf.infolist():
            if info.is_dir():
                continue
            dest = destination_for(info.filename)
            if dest is None:
                skipped += 1
                continue
            dest.parent.mkdir(parents=True, exist_ok=True)
            if dest.exists() and not args.force:
                conflicts += 1
                print(f"CONFLICT  {dest}")
                continue
            with zf.open(info) as src, dest.open("wb") as dst:
                shutil.copyfileobj(src, dst)
            copied += 1
            print(f"COPIED    {dest.relative_to(ROOT)}")

    print(f"\nDone: {copied} copied, {conflicts} conflicts, {skipped} unmapped files.")
    if conflicts:
        print("Re-run with --force only after reviewing the conflicts.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
