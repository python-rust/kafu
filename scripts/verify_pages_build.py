#!/usr/bin/env python3
"""Validate a Vite artifact intended for a GitHub Pages project subpath."""

from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


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


def normalize_base_path(value: str) -> str:
    stripped = value.strip().strip("/")
    return f"/{stripped}/" if stripped else "/"


def resolve_resource(
    resource: str, *, artifact_dir: Path, base_path: str, source_file: Path
) -> Path:
    parsed = urlsplit(resource)
    if parsed.scheme or parsed.netloc:
        raise ValueError(f"External runtime resource is not allowed: {resource}")

    decoded_path = unquote(parsed.path)
    if decoded_path.startswith("/"):
        if not decoded_path.startswith(base_path):
            raise ValueError(
                f"Root resource does not use Pages base {base_path}: {resource}"
            )
        relative_path = decoded_path[len(base_path) :]
        return artifact_dir / relative_path

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
    if len(sys.argv) != 3:
        print(
            "usage: verify_pages_build.py <artifact-directory> <base-path>",
            file=sys.stderr,
        )
        return 2

    artifact_dir = Path(sys.argv[1]).resolve()
    base_path = normalize_base_path(sys.argv[2])
    index_file = artifact_dir / "index.html"

    if not index_file.is_file():
        raise SystemExit(f"Missing Pages entry file: {index_file}")

    parser = ResourceParser()
    parser.feed(index_file.read_text(encoding="utf-8"))
    if not parser.resources:
        raise SystemExit("index.html does not reference any deployable resources")

    checked_resources: list[str] = []
    for resource in parser.resources:
        resolved = resolve_resource(
            resource,
            artifact_dir=artifact_dir,
            base_path=base_path,
            source_file=index_file,
        )
        if not resolved.is_file():
            raise SystemExit(f"Missing referenced resource: {resource} -> {resolved}")
        checked_resources.append(resource)

    if len(parser.image_preloads) != 1:
        raise SystemExit(
            "Pages entry must contain exactly one responsive Hero image preload"
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

    candidate_urls = {resource for resource, _ in preload_candidates}
    if image_preload["href"] not in candidate_urls:
        raise SystemExit("Hero preload href must be present in imagesrcset")

    for resource, _ in preload_candidates:
        resolved = resolve_resource(
            resource,
            artifact_dir=artifact_dir,
            base_path=base_path,
            source_file=index_file,
        )
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
            resolved = resolve_resource(
                resource,
                artifact_dir=artifact_dir,
                base_path=base_path,
                source_file=css_file,
            )
            if not resolved.is_file():
                raise SystemExit(
                    f"Missing CSS resource: {resource} from {css_file.name}"
                )
            checked_css_resources += 1

    if not any(resource.endswith(".js") for resource in checked_resources):
        raise SystemExit("index.html does not reference a JavaScript bundle")
    if not any(resource.endswith(".css") for resource in checked_resources):
        raise SystemExit("index.html does not reference a stylesheet")
    if not list(artifact_dir.rglob("*.woff2")):
        raise SystemExit("Pages artifact does not contain the self-hosted WOFF2 fonts")

    print(
        "Verified GitHub Pages artifact: "
        f"base={base_path}, html_resources={len(checked_resources)}, "
        f"css_resources={checked_css_resources}, "
        f"image_preload_candidates={len(preload_candidates)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
