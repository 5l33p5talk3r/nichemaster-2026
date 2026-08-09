#!/usr/bin/env python3
"""Build a deterministic product index from JSON catalog files."""
from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, nargs="?", default=Path("packages/catalog/metadata"))
    parser.add_argument("--output", type=Path, default=Path("packages/catalog/products.index.json"))
    args = parser.parse_args()

    records = []
    for path in sorted(args.source.rglob("*.json")):
        if path.name == args.output.name:
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        if isinstance(data, list):
            records.extend(x for x in data if isinstance(x, dict))
        elif isinstance(data, dict):
            if isinstance(data.get("products"), list):
                records.extend(x for x in data["products"] if isinstance(x, dict))
            else:
                records.append(data)

    deduped = {}
    for item in records:
        key = str(item.get("id") or item.get("slug") or item.get("title") or "").strip().lower()
        if key:
            deduped[key] = item

    result = sorted(deduped.values(), key=lambda x: str(x.get("title") or x.get("name") or "").lower())
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps({"version": 1, "count": len(result), "products": result}, indent=2), encoding="utf-8")
    print(f"Indexed {len(result)} products -> {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
