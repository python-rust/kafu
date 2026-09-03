#!/usr/bin/env python3
"""Validate the root-hosted Vite artifact used for production deployment."""

from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


MAX_ENTRY_CSS_BYTES = 64 * 1024
MAX_ENTRY_JAVASCRIPT_BYTES = 400 * 1024
EXPECTED_WEBP_COUNT = 50
MAX_WEBP_BYTES = 4_500_000


class ResourceParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.resources: list[str] = []
        self.image_preloads: list[dict[str, str]] = []

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        values = {name: value for name, value in attrs}

        if tag == "script" and values.get("src"):
            self.resources.append(values["src"] or "")
            return

        if tag != "link" or not values.get("href"):
            return

        relations = set((values.get("rel") or "").split())
        if relations.intersection(
            {"stylesheet", "icon", "preload", "modulepreload"}
        ):
            self.resources.append(values["href"] or "")

        if "preload" in relations and values.get("as") == "image":
            self.image_preloads.append(
                {
                    "href": values.get("href") or "",
                    "imagesrcset": values.get("imagesrcset") or "",
                    "imagesizes": values.get("imagesizes") or "",
                    "fetchpriority": values.get("fetchpriority") or "",
                }
            )


def resolve_resource(resource: str, *, artifact_dir: Path, source_file: Path) -> Path:
    parsed = urlsplit(resource)
    if parsed.scheme or parsed.netloc:
        raise ValueError(f"External runtime resource is not allowed: {resource}")

    decoded_path = unquote(parsed.path)
    if decoded_path.startswith("/"):
        return artifact_dir / decoded_path.lstrip("/")

    return source_file.parent / decoded_path


def parse_width_srcset(value: str) -> list[tuple[str, int]]:
    candidates: list[tuple[str, int]] = []
    for raw_candidate in value.split(","):
        parts = raw_candidate.strip().split()
        if len(parts) != 2 or not parts[1].endswith("w"):
            raise ValueError(
                f"Image preload must use width descriptors: {raw_candidate}"
            )
        try:
            width = int(parts[1][:-1])
        except ValueError as error:
            raise ValueError(
                f"Invalid image preload width descriptor: {raw_candidate}"
            ) from error
        if width <= 0:
            raise ValueError(
                f"Image preload width must be positive: {raw_candidate}"
            )
        candidates.append((parts[0], width))

    if len(candidates) < 2:
        raise ValueError("Responsive image preload requires multiple candidates")
    widths = [width for _, width in candidates]
    if widths != sorted(set(widths)):
        raise ValueError("Image preload widths must be unique and ascending")
    return candidates


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: verify_static_build.py <artifact-directory>", file=sys.stderr)
        return 2

    artifact_dir = Path(sys.argv[1]).resolve()
    index_file = artifact_dir / "index.html"

    if not index_file.is_file():
        raise SystemExit(f"Missing deployment entry file: {index_file}")

    parser = ResourceParser()
    parser.feed(index_file.read_text(encoding="utf-8"))
    if not parser.resources:
        raise SystemExit("index.html does not reference any deployable resources")

    checked_resources: list[str] = []
    checked_resource_paths: list[Path] = []
    for resource in parser.resources:
        try:
            resolved = resolve_resource(
                resource,
                artifact_dir=artifact_dir,
                source_file=index_file,
            )
        except ValueError as error:
            raise SystemExit(str(error)) from error
        if not resolved.is_file():
            raise SystemExit(f"Missing referenced resource: {resource} -> {resolved}")
        checked_resources.append(resource)
        checked_resource_paths.append(resolved)

    if len(parser.image_preloads) != 1:
        raise SystemExit(
            "Deployment entry must contain exactly one responsive Hero image preload"
        )
    image_preload = parser.image_preloads[0]
    if image_preload["fetchpriority"] != "high":
        raise SystemExit("Hero image preload must set fetchpriority=high")
    if not image_preload["imagesizes"]:
        raise SystemExit("Hero image preload must declare imagesizes")

    try:
        preload_candidates = parse_width_srcset(image_preload["imagesrcset"])
    except ValueError as error:
        raise SystemExit(str(error)) from error

    preload_widths = [width for _, width in preload_candidates]
    expected_preload_widths = [480, 960, 1280, 1920, 2560]
    if preload_widths != expected_preload_widths:
        raise SystemExit(
            "Hero preload candidate ladder differs from the initial-load policy: "
            f"expected {expected_preload_widths}, received {preload_widths}"
        )

    candidate_urls = {resource for resource, _ in preload_candidates}
    if image_preload["href"] not in candidate_urls:
        raise SystemExit("Hero preload href must be present in imagesrcset")

    for resource, _ in preload_candidates:
        try:
            resolved = resolve_resource(
                resource,
                artifact_dir=artifact_dir,
                source_file=index_file,
            )
        except ValueError as error:
            raise SystemExit(str(error)) from error
        if not resolved.is_file():
            raise SystemExit(
                f"Missing responsive preload candidate: {resource} -> {resolved}"
            )

    css_url_pattern = re.compile(r"url\((?P<quote>['\"]?)(?P<url>.+?)(?P=quote)\)")
    checked_css_resources = 0
    for css_file in artifact_dir.rglob("*.css"):
        css = css_file.read_text(encoding="utf-8")
        for match in css_url_pattern.finditer(css):
            resource = match.group("url").strip()
            if resource.startswith("data:"):
                continue
            try:
                resolved = resolve_resource(
                    resource,
                    artifact_dir=artifact_dir,
                    source_file=css_file,
                )
            except ValueError as error:
                raise SystemExit(str(error)) from error
            if not resolved.is_file():
                raise SystemExit(
                    f"Missing CSS resource: {resource} from {css_file.name}"
                )
            checked_css_resources += 1

    if not any(resource.endswith(".js") for resource in checked_resources):
        raise SystemExit("index.html does not reference a JavaScript bundle")
    if not any(resource.endswith(".css") for resource in checked_resources):
        raise SystemExit("index.html does not reference a stylesheet")

    entry_css_bytes = sum(
        path.stat().st_size
        for path in checked_resource_paths
        if path.suffix == ".css"
    )
    if entry_css_bytes > MAX_ENTRY_CSS_BYTES:
        raise SystemExit(
            f"Entry CSS budget exceeded: {entry_css_bytes} > "
            f"{MAX_ENTRY_CSS_BYTES} bytes"
        )

    entry_javascript_bytes = sum(
        path.stat().st_size
        for path in checked_resource_paths
        if path.suffix == ".js"
    )
    if entry_javascript_bytes > MAX_ENTRY_JAVASCRIPT_BYTES:
        raise SystemExit(
            f"Entry JavaScript budget exceeded: {entry_javascript_bytes} > "
            f"{MAX_ENTRY_JAVASCRIPT_BYTES} bytes"
        )

    font_files = [
        path
        for pattern in ("*.woff", "*.woff2", "*.ttf", "*.otf")
        for path in artifact_dir.rglob(pattern)
    ]
    if font_files:
        raise SystemExit(
            "Initial-load policy forbids bundled webfonts: "
            + ", ".join(str(path.relative_to(artifact_dir)) for path in font_files)
        )

    source_format_images = [
        path
        for pattern in ("*.jpg", "*.jpeg", "*.png")
        for path in artifact_dir.rglob(pattern)
    ]
    if source_format_images:
        raise SystemExit(
            "Immutable provenance inputs must not enter the runtime artifact: "
            + ", ".join(
                str(path.relative_to(artifact_dir)) for path in source_format_images
            )
        )

    webp_files = list(artifact_dir.rglob("*.webp"))
    if len(webp_files) != EXPECTED_WEBP_COUNT:
        raise SystemExit(
            f"Responsive WebP set differs from policy: expected "
            f"{EXPECTED_WEBP_COUNT}, received {len(webp_files)}"
        )
    webp_bytes = sum(path.stat().st_size for path in webp_files)
    if webp_bytes > MAX_WEBP_BYTES:
        raise SystemExit(
            f"Responsive WebP budget exceeded: {webp_bytes} > "
            f"{MAX_WEBP_BYTES} bytes"
        )

    print(
        "Verified static deployment artifact: "
        f"html_resources={len(checked_resources)}, "
        f"css_resources={checked_css_resources}, "
        f"entry_css_bytes={entry_css_bytes}, "
        f"entry_javascript_bytes={entry_javascript_bytes}, "
        f"image_preload_candidates={len(preload_candidates)}, "
        f"webp_files={len(webp_files)}, webp_bytes={webp_bytes}, webfonts=0"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
