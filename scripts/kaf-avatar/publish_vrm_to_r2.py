#!/usr/bin/env python3
"""Publish and verify the locked KAF VRM object in Cloudflare R2.

Wrangler owns authentication. The binary remains under `.local-assets/` and is
never copied into Git or the Pages build artifact.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from typing import Any, Final

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[2]
LOCK_PATH: Final = REPOSITORY_ROOT / "src/content/kafAvatar.json"
READ_SIZE: Final = 1024 * 1024


def load_lock() -> dict[str, Any]:
    data = json.loads(LOCK_PATH.read_text(encoding="utf-8"))
    required = {
        "bucketName",
        "objectKey",
        "sourcePath",
        "byteSize",
        "sha256",
        "mimeType",
        "cacheControl",
        "downloadFilename",
    }
    missing = sorted(required.difference(data))
    if missing:
        raise SystemExit(f"Avatar lock is missing fields: {', '.join(missing)}")
    return data


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(READ_SIZE), b""):
            digest.update(chunk)
    return digest.hexdigest()


def verify_local(path: Path, lock: dict[str, Any]) -> None:
    if not path.is_file():
        raise SystemExit(f"Missing local VRM: {path}")
    with path.open("rb") as file:
        if file.read(4) != b"glTF":
            raise SystemExit(f"Not a binary glTF/VRM file: {path}")
    actual_size = path.stat().st_size
    actual_hash = sha256(path)
    if actual_size != lock["byteSize"]:
        raise SystemExit(
            f"Local size mismatch: expected {lock['byteSize']}, got {actual_size}"
        )
    if actual_hash != lock["sha256"]:
        raise SystemExit(
            f"Local SHA-256 mismatch: expected {lock['sha256']}, got {actual_hash}"
        )


def wrangler(*arguments: str, capture: bool = False) -> subprocess.CompletedProcess[str]:
    command = ["pnpm", "exec", "wrangler", *arguments]
    return subprocess.run(
        command,
        cwd=REPOSITORY_ROOT,
        check=True,
        text=True,
        capture_output=capture,
    )


def ensure_bucket(bucket_name: str) -> None:
    listing = wrangler("r2", "bucket", "list", capture=True).stdout
    if bucket_name not in listing:
        wrangler("r2", "bucket", "create", bucket_name)


def upload(path: Path, lock: dict[str, Any]) -> None:
    object_path = f"{lock['bucketName']}/{lock['objectKey']}"
    wrangler(
        "r2",
        "object",
        "put",
        object_path,
        "--file",
        str(path),
        "--content-type",
        lock["mimeType"],
        "--content-disposition",
        f'inline; filename="{lock["downloadFilename"]}"',
        "--cache-control",
        lock["cacheControl"],
        "--remote",
        "--force",
    )


def verify_remote(lock: dict[str, Any]) -> None:
    object_path = f"{lock['bucketName']}/{lock['objectKey']}"
    process = subprocess.Popen(
        [
            "pnpm",
            "exec",
            "wrangler",
            "r2",
            "object",
            "get",
            object_path,
            "--pipe",
            "--remote",
        ],
        cwd=REPOSITORY_ROOT,
        stdout=subprocess.PIPE,
        stderr=None,
    )
    if process.stdout is None:
        process.kill()
        raise SystemExit("Wrangler did not expose a download stream")

    digest = hashlib.sha256()
    size = 0
    for chunk in iter(lambda: process.stdout.read(READ_SIZE), b""):
        size += len(chunk)
        digest.update(chunk)
    exit_code = process.wait()
    if exit_code != 0:
        raise SystemExit(f"Wrangler R2 download failed with exit code {exit_code}")

    actual_hash = digest.hexdigest()
    if size != lock["byteSize"]:
        raise SystemExit(
            f"Remote size mismatch: expected {lock['byteSize']}, got {size}"
        )
    if actual_hash != lock["sha256"]:
        raise SystemExit(
            f"Remote SHA-256 mismatch: expected {lock['sha256']}, got {actual_hash}"
        )
    print(
        json.dumps(
            {
                "bucket": lock["bucketName"],
                "key": lock["objectKey"],
                "byteSize": size,
                "sha256": actual_hash,
                "verified": True,
            },
            ensure_ascii=False,
            indent=2,
        )
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--verify-only",
        action="store_true",
        help="skip bucket creation/upload and verify the locked remote object",
    )
    args = parser.parse_args()

    lock = load_lock()
    source = REPOSITORY_ROOT / lock["sourcePath"]
    if not args.verify_only:
        verify_local(source, lock)
        ensure_bucket(lock["bucketName"])
        upload(source, lock)
    verify_remote(lock)


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as error:
        print(f"Command failed: {' '.join(error.cmd)}", file=sys.stderr)
        raise SystemExit(error.returncode) from error
