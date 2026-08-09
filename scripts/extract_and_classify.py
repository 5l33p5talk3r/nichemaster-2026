#!/usr/bin/env python3
"""Safely extract the legacy NicheMaster release and classify source files.

Usage:
    python scripts/extract_and_classify.py path/to/nichemaster_COMPLETE_2026.zip

The script never deletes the archive. It rejects unsafe ZIP paths and writes
an import manifest so the migration can be reviewed before committing files.
"""
from __future__ import annotations

import argparse
import json
import shutil
import zipfile
from pathlib import Path

SOURCE_ROOTS = {
    "storefront": {".html", ".css", ".js", ".jsx", ".tsx", ".ts", ".vue"},
    "ebook-agent": {".py"},
    "catalog": {".json", ".csv"},
    "docs": {".md", ".txt"},
    "assets": {".jpg", ".jpeg", ".png", ".webp", ".epub", ".pdf"},
}
SKIP_DIRS = {"node_modules", ".git", "__pycache__", ".venv", "venv", "dist", "build"}


def classify(path: Path) -> str:
    if any(part in SKIP_DIRS for part in path.parts):
        return "ignored"
    suffix = path.suffix.lower()
    for category, extensions in SOURCE_ROOTS.items():
        if suffix in extensions:
            return category
    return "legacy"


def safe_members(zf: zipfile.ZipFile):
    for member in zf.infolist():
        target = Path(member.filename)
        if target.is_absolute() or ".." in target.parts:
            raise ValueError(f"Unsafe ZIP path: {member.filename}")
        yield member


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("archive", type=Path)
    parser.add_argument("--output", type=Path, default=Path(".migration/workspace"))
    args = parser.parse_args()

    if not args.archive.exists():
        raise SystemExit(f"Archive not found: {args.archive}")

    if args.output.exists():
        shutil.rmtree(args.output)
    args.output.mkdir(parents=True)

    manifest = []
    with zipfile.ZipFile(args.archive) as zf:
        for member in safe_members(zf):
            if member.is_dir():
                continue
            relative = Path(member.filename)
            category = classify(relative)
            if category == "ignored":
                continue
            destination = args.output / category / relative.name
            destination.parent.mkdir(parents=True, exist_ok=True)
            with zf.open(member) as src, destination.open("wb") as dst:
                shutil.copyfileobj(src, dst)
            manifest.append({
                "source": member.filename,
                "category": category,
                "destination": str(destination),
                "size": member.file_size,
            })

    manifest_path = args.output / "import-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Extracted {len(manifest)} files to {args.output}")
    print(f"Manifest: {manifest_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
