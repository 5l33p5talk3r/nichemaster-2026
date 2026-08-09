#!/usr/bin/env python3
"""Validate NicheMaster catalog JSON files without modifying them."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "packages" / "catalog"
FILES = [
    CATALOG / "niches_master.json",
    CATALOG / "niches_master_expanded.json",
    CATALOG / "ebooks_master_metadata.json",
    CATALOG / "products.json",
]


def main() -> int:
    missing = 0
    invalid = 0
    for path in FILES:
        if not path.exists():
            print(f"MISSING  {path.relative_to(ROOT)}")
            missing += 1
            continue
        try:
            with path.open("r", encoding="utf-8") as handle:
                json.load(handle)
            print(f"OK       {path.relative_to(ROOT)}")
        except (OSError, json.JSONDecodeError) as exc:
            print(f"INVALID  {path.relative_to(ROOT)}: {exc}")
            invalid += 1
    if missing or invalid:
        print(f"\nCatalog validation failed: {missing} missing, {invalid} invalid.")
        return 1
    print("\nCatalog validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
