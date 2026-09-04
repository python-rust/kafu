#!/usr/bin/env python3
"""Verify the R2-backed avatar lock and keep large binaries out of Git."""

from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path
from typing import Any, Final

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[1]
LOCK_PATH: Final = REPOSITORY_ROOT / "src/content/kafAvatar.json"
WRANGLER_PATH: Final = REPOSITORY_ROOT / "wrangler.toml"
FORBIDDEN_TRACKED_SUFFIXES: Final = {".vrm", ".blend"}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def require_string(lock: dict[str, Any], key: str) -> str:
    value = lock.get(key)
    if not isinstance(value, str) or not value:
        raise SystemExit(f"Avatar lock field {key!r} must be a non-empty string")
    return value


def main() -> int:
    lock = json.loads(LOCK_PATH.read_text(encoding="utf-8"))
    if not isinstance(lock, dict):
        raise SystemExit("Avatar lock root must be an object")

    digest = require_string(lock, "sha256")
    prefix = require_string(lock, "sha256Prefix")
    public_path = require_string(lock, "publicPath")
    object_key = require_string(lock, "objectKey")
    binding_name = require_string(lock, "bindingName")
    bucket_name = require_string(lock, "bucketName")

    if len(digest) != 64 or any(character not in "0123456789abcdef" for character in digest):
        raise SystemExit("Avatar SHA-256 must be 64 lowercase hexadecimal characters")
    if prefix != digest[: len(prefix)] or prefix not in public_path or prefix not in object_key:
        raise SystemExit("Avatar public path/object key must be locked to the SHA-256 prefix")
    if not public_path.startswith("/assets/models/kaf/") or not public_path.endswith(".vrm"):
        raise SystemExit("Avatar public path must be a versioned KAF VRM route")

    poster = lock.get("poster")
    if not isinstance(poster, dict):
        raise SystemExit("Avatar poster lock is missing")
    poster_path = REPOSITORY_ROOT / require_string(poster, "path")
    if not poster_path.is_file():
        raise SystemExit(f"Avatar poster is missing: {poster_path}")
    if poster_path.stat().st_size != poster.get("byteSize"):
        raise SystemExit("Avatar poster byte size differs from the lock")
    if sha256(poster_path) != poster.get("sha256"):
        raise SystemExit("Avatar poster SHA-256 differs from the lock")

    tracked = subprocess.run(
        ["git", "ls-files", "-z"],
        cwd=REPOSITORY_ROOT,
        check=True,
        capture_output=True,
    ).stdout.split(b"\x00")
    forbidden = sorted(
        path.decode("utf-8")
        for path in tracked
        if path and Path(path.decode("utf-8")).suffix.lower() in FORBIDDEN_TRACKED_SUFFIXES
    )
    if forbidden:
        raise SystemExit(
            "Large avatar binaries must be published through R2, not Git: "
            + ", ".join(forbidden)
        )

    wrangler = WRANGLER_PATH.read_text(encoding="utf-8")
    required_fragments = (
        f'binding = "{binding_name}"',
        f'bucket_name = "{bucket_name}"',
        'pages_build_output_dir = "./dist"',
    )
    missing = [fragment for fragment in required_fragments if fragment not in wrangler]
    if missing:
        raise SystemExit(f"wrangler.toml is missing avatar binding fields: {missing}")

    print(
        "Verified R2-backed avatar lock: "
        f"path={public_path}, size={lock.get('byteSize')}, poster={poster_path.name}, "
        "tracked_vrm_blend=0"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
