#!/usr/bin/env python3
"""Smoke-test the deployed R2-backed avatar proxy without downloading the VRM."""

from __future__ import annotations

import argparse
import json
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Final
from urllib.parse import urljoin

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[1]
LOCK_PATH: Final = REPOSITORY_ROOT / "src/content/kafAvatar.json"
DEFAULT_ORIGIN: Final = "https://kafu-8bd.pages.dev"
USER_AGENT: Final = "kafu-deployment-verifier/1.0"


def load_lock() -> dict[str, Any]:
    data = json.loads(LOCK_PATH.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise SystemExit("Avatar lock root must be an object")
    return data


def http_request(
    url: str,
    *,
    method: str = "GET",
    headers: dict[str, str] | None = None,
    timeout: float = 20,
) -> tuple[int, dict[str, str], bytes]:
    request_headers = {"User-Agent": USER_AGENT}
    if headers:
        request_headers.update(headers)
    req = urllib.request.Request(url, method=method, headers=request_headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return (
                response.status,
                {key.lower(): value for key, value in response.headers.items()},
                response.read(),
            )
    except urllib.error.HTTPError as error:
        return (
            error.code,
            {key.lower(): value for key, value in error.headers.items()},
            error.read(),
        )


def require_equal(actual: object, expected: object, label: str) -> None:
    if actual != expected:
        raise AssertionError(f"{label}: expected {expected!r}, got {actual!r}")


def verify_once(origin: str, lock: dict[str, Any]) -> None:
    base = origin.rstrip("/") + "/"
    manifest_url = urljoin(base, str(lock["manifestPath"]).lstrip("/"))
    model_url = urljoin(base, str(lock["publicPath"]).lstrip("/"))

    root_status, _, root_body = http_request(base)
    require_equal(root_status, 200, "site root status")
    if b'<div id="root"></div>' not in root_body:
        raise AssertionError("site root does not contain the React mount point")

    manifest_status, manifest_headers, manifest_body = http_request(manifest_url)
    require_equal(manifest_status, 200, "avatar manifest status")
    if not manifest_headers.get("content-type", "").startswith("application/json"):
        raise AssertionError("avatar manifest content type is not JSON")
    manifest = json.loads(manifest_body)
    require_equal(manifest.get("id"), lock["id"], "manifest id")
    require_equal(manifest.get("author"), lock["author"], "manifest author")
    require_equal(manifest.get("byteSize"), lock["byteSize"], "manifest byte size")
    require_equal(manifest.get("sha256"), lock["sha256"], "manifest SHA-256")
    require_equal(manifest.get("downloadUrl"), model_url, "manifest download URL")

    head_status, head_headers, head_body = http_request(model_url, method="HEAD")
    require_equal(head_status, 200, "model HEAD status")
    require_equal(head_body, b"", "model HEAD body")
    require_equal(
        head_headers.get("content-length"),
        str(lock["byteSize"]),
        "model content length",
    )
    require_equal(head_headers.get("content-type"), lock["mimeType"], "model content type")
    require_equal(head_headers.get("accept-ranges"), "bytes", "model range support")
    if "immutable" not in head_headers.get("cache-control", ""):
        raise AssertionError("model response is missing immutable caching")

    range_status, range_headers, range_body = http_request(
        model_url,
        headers={"Range": "bytes=0-3"},
    )
    require_equal(range_status, 206, "model range status")
    require_equal(range_body, b"glTF", "model GLB magic")
    require_equal(range_headers.get("content-length"), "4", "range length")
    require_equal(
        range_headers.get("content-range"),
        f"bytes 0-3/{lock['byteSize']}",
        "range content range",
    )

    missing_status, _, _ = http_request(
        urljoin(base, "assets/models/kaf/v1/not-allowlisted.vrm")
    )
    require_equal(missing_status, 404, "unlisted model status")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("origin", nargs="?", default=DEFAULT_ORIGIN)
    parser.add_argument("--attempts", type=int, default=7)
    parser.add_argument("--delay", type=float, default=5)
    args = parser.parse_args()

    if args.attempts < 1:
        raise SystemExit("--attempts must be at least 1")
    lock = load_lock()
    last_error: Exception | None = None

    for attempt in range(1, args.attempts + 1):
        try:
            verify_once(args.origin, lock)
            print(
                "Verified deployed KAF avatar proxy: "
                f"origin={args.origin.rstrip('/')}, model={lock['publicPath']}, "
                f"size={lock['byteSize']}, range_magic=glTF"
            )
            return 0
        except (AssertionError, OSError, TimeoutError, json.JSONDecodeError) as error:
            last_error = error
            if attempt == args.attempts:
                break
            print(
                f"Avatar proxy verification attempt {attempt}/{args.attempts} failed: "
                f"{error}; retrying in {args.delay:g}s"
            )
            time.sleep(args.delay)

    raise SystemExit(f"Avatar proxy verification failed: {last_error}")


if __name__ == "__main__":
    raise SystemExit(main())
