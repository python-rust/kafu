#!/usr/bin/env python3
"""Generate and verify responsive KAF artwork derivatives.

The source previews remain untouched. Generation requires the official
waifu2x-ncnn-vulkan portable executable and its model directory:

    WAIFU2X_BIN=/path/to/waifu2x-ncnn-vulkan \
    WAIFU2X_MODEL_DIR=/path/to/models-cunet \
    python3 scripts/generate_kaf_media_variants.py

Verification does not require the external binary:

    python3 scripts/generate_kaf_media_variants.py --check
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import subprocess
import tempfile
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from typing import Final

try:
    from PIL import Image
except ImportError as error:  # pragma: no cover - developer environment guard
    raise SystemExit(
        "Pillow is required to generate KAF media variants. Install it in the "
        "tooling environment before running this script."
    ) from error


REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[1]
OUTPUT_DIRECTORY: Final = REPOSITORY_ROOT / "src/assets/kaf/generated"
MANIFEST_PATH: Final = OUTPUT_DIRECTORY / "manifest.json"
TYPE_SCRIPT_PATH: Final = OUTPUT_DIRECTORY / "mediaVariants.ts"
WEBP_QUALITY: Final = 90
THUMBNAIL_LONG_EDGE: Final = 480
PLACEHOLDER_LONG_EDGE: Final = 32
PLACEHOLDER_WEBP_QUALITY: Final = 35


@dataclass(frozen=True)
class MediaSource:
    media_id: str
    relative_path: str
    sha256: str
    strategy: str = "upscale"
    display_long_edge: int | None = None
    high_density_long_edge: int | None = None

    @property
    def path(self) -> Path:
        return REPOSITORY_ROOT / self.relative_path


MEDIA_SOURCES: Final = (
    MediaSource(
        "kaihou",
        "src/assets/kaf/hero-kaihou.jpg",
        "850e38af66e1f28a9ad00677d53568ea9fa52ff5a12e8317b84207e609acd516",
    ),
    MediaSource(
        "wasurete-shimae",
        "src/assets/kaf/visual-wasurete-shimae.jpg",
        "cf39ce8eefbc57ef9652bd434d1a250454b26bffa3fb960e2f2cfbb6ef01d7d8",
    ),
    MediaSource(
        "fukakai",
        "src/assets/kaf/visual-fukakai.jpg",
        "caef91a45a66d9c9a5e720446d2a81c030b9b45973e77588cca60d72beeb531a",
    ),
    MediaSource(
        "origin-ito",
        "src/assets/kaf/journey/2018-origin-ito.jpg",
        "0d2a25eae4996247ee4272ef8e29ee7ef206348d496dd2b5faf0a95c7071c44c",
    ),
    MediaSource(
        "observation-past",
        "src/assets/kaf/journey/2019-observation-past.jpg",
        "a445f01b893a93e38c7c977c00997763b160ebc0bea30fd12907916b12c6f523",
    ),
    MediaSource(
        "magic-keshiki",
        "src/assets/kaf/journey/2020-magic-keshiki.jpg",
        "5fab05560238bf1ff0e1a0bcf4fa01c21ab855086fc8004ac81c5999208d0169",
    ),
    MediaSource(
        "fable-chewing-disco",
        "src/assets/kaf/journey/2024-fable-chewing-disco.png",
        "42dd8bf80d83f2bc306f31c778d5ddbed9f5aac66779edb24daef0d4cb4c4850",
    ),
    MediaSource(
        "transcendent-ufo",
        "src/assets/kaf/journey/2025-transcendent-ufo.png",
        "72448105038392b96d68ec713cd93d758b29ee52019268daa6262d750ed38a55",
    ),
    MediaSource(
        "tori-portrait",
        "src/assets/kaf/gallery/kaf-tori-portrait.jpg",
        "0638aa003a71475dde64a6cbc7c724343aeb3eff17c2272fdea41302c549d116",
    ),
    MediaSource(
        "kyousou-beta",
        "src/assets/kaf/works/2023-kyousou-beta.png",
        "161fe38755a496e70a703a60848b385184bcca293685a781ee63d2372fd094f1",
        strategy="native",
        display_long_edge=800,
        high_density_long_edge=1600,
    ),
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def output_path(media_id: str, role: str) -> Path:
    return OUTPUT_DIRECTORY / f"{media_id}-{role}.webp"


def resized_dimensions(
    source_size: tuple[int, int],
    long_edge: int,
) -> tuple[int, int]:
    width, height = source_size
    scale = min(1, long_edge / max(width, height))
    return (max(1, round(width * scale)), max(1, round(height * scale)))


def variant_roles(source: MediaSource) -> dict[str, str]:
    if source.strategy == "native":
        return {
            "display": "display",
            "highDensity": "high",
            "thumbnail": "thumb",
        }

    return {
        "display": "2x",
        "highDensity": "4x",
        "thumbnail": "thumb",
    }


def expected_dimensions(
    source: MediaSource,
    source_size: tuple[int, int],
) -> dict[str, tuple[int, int]]:
    width, height = source_size
    scale = THUMBNAIL_LONG_EDGE / max(width, height)
    thumbnail = (max(1, round(width * scale)), max(1, round(height * scale)))

    if source.strategy == "native":
        if source.display_long_edge is None or source.high_density_long_edge is None:
            raise RuntimeError(
                f"Native media dimensions are not configured for {source.media_id}"
            )
        roles = variant_roles(source)
        return {
            roles["display"]: resized_dimensions(
                source_size,
                source.display_long_edge,
            ),
            roles["highDensity"]: resized_dimensions(
                source_size,
                source.high_density_long_edge,
            ),
            roles["thumbnail"]: thumbnail,
        }

    return {
        "2x": (width * 2, height * 2),
        "4x": (width * 4, height * 4),
        "thumb": thumbnail,
    }


def typescript_identifier(media_id: str) -> str:
    first, *rest = media_id.split("-")
    return first + "".join(part[:1].upper() + part[1:] for part in rest)


def typescript_property(media_id: str) -> str:
    return media_id if "-" not in media_id else f"'{media_id}'"


def render_typescript_module(manifest: dict[str, object]) -> str:
    items_by_id = {
        item["id"]: item
        for item in manifest.get("items", [])
        if isinstance(item, dict) and "id" in item
    }
    lines = [
        "// Generated by scripts/generate_kaf_media_variants.py. Do not edit manually.",
    ]

    for source in MEDIA_SOURCES:
        identifier = typescript_identifier(source.media_id)
        roles = variant_roles(source)
        lines.extend(
            [
                (
                    f"import {identifier}Display from "
                    f"'./{source.media_id}-{roles['display']}.webp';"
                ),
                (
                    f"import {identifier}HighDensity from "
                    f"'./{source.media_id}-{roles['highDensity']}.webp';"
                ),
                (
                    f"import {identifier}Thumb from "
                    f"'./{source.media_id}-{roles['thumbnail']}.webp';"
                ),
            ]
        )

    lines.extend(
        [
            "",
            "interface GeneratedVariant {",
            "  readonly src: string;",
            "  readonly width: number;",
            "  readonly height: number;",
            "}",
            "",
            "interface GeneratedVariantSet {",
            "  readonly display: GeneratedVariant;",
            "  readonly highDensity: GeneratedVariant;",
            "  readonly thumbnail: GeneratedVariant;",
            "  readonly placeholderDataUrl: string;",
            "}",
            "",
            "export const generatedMediaVariants = {",
        ]
    )

    for source in MEDIA_SOURCES:
        identifier = typescript_identifier(source.media_id)
        roles = variant_roles(source)
        item = items_by_id.get(source.media_id)
        if not isinstance(item, dict):
            raise RuntimeError(
                f"Manifest is missing generated metadata for {source.media_id}"
            )
        variants = item.get("variants")
        placeholder = item.get("placeholder")
        if not isinstance(variants, dict) or not isinstance(placeholder, dict):
            raise RuntimeError(
                f"Manifest metadata is incomplete for {source.media_id}"
            )
        display_width = variants[roles["display"]]["width"]
        display_height = variants[roles["display"]]["height"]
        high_width = variants[roles["highDensity"]]["width"]
        high_height = variants[roles["highDensity"]]["height"]
        thumb_width = variants[roles["thumbnail"]]["width"]
        thumb_height = variants[roles["thumbnail"]]["height"]
        placeholder_data_url = placeholder["dataUrl"]
        lines.extend(
            [
                f"  {typescript_property(source.media_id)}: {{",
                (
                    f"    display: {{ src: {identifier}Display, width: {display_width}, "
                    f"height: {display_height} }},"
                ),
                (
                    f"    highDensity: {{ src: {identifier}HighDensity, width: {high_width}, "
                    f"height: {high_height} }},"
                ),
                (
                    f"    thumbnail: {{ src: {identifier}Thumb, width: {thumb_width}, "
                    f"height: {thumb_height} }},"
                ),
                (
                    "    placeholderDataUrl: "
                    f"{json.dumps(placeholder_data_url, ensure_ascii=False)},"
                ),
                "  },",
            ]
        )

    lines.extend(
        [
            "} as const satisfies Readonly<Record<string, GeneratedVariantSet>>;",
            "",
        ]
    )
    return "\n".join(lines)


def verify_source(source: MediaSource) -> tuple[int, int]:
    if not source.path.is_file():
        raise RuntimeError(f"Missing source preview: {source.relative_path}")
    actual_hash = sha256(source.path)
    if actual_hash != source.sha256:
        raise RuntimeError(
            f"Source hash mismatch for {source.relative_path}: "
            f"expected {source.sha256}, received {actual_hash}"
        )
    with Image.open(source.path) as image:
        return image.size


def save_webp(image: Image.Image, path: Path) -> None:
    if image.mode not in {"RGB", "RGBA"}:
        image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
    image.save(path, "WEBP", quality=WEBP_QUALITY, method=6)


def create_inline_placeholder(image: Image.Image) -> dict[str, object]:
    scale = PLACEHOLDER_LONG_EDGE / max(image.size)
    dimensions = (
        max(1, round(image.width * scale)),
        max(1, round(image.height * scale)),
    )
    placeholder = image.resize(dimensions, Image.Resampling.LANCZOS)
    if placeholder.mode not in {"RGB", "RGBA"}:
        placeholder = placeholder.convert(
            "RGBA" if "A" in placeholder.getbands() else "RGB"
        )

    buffer = BytesIO()
    placeholder.save(
        buffer,
        "WEBP",
        quality=PLACEHOLDER_WEBP_QUALITY,
        method=6,
    )
    payload = buffer.getvalue()
    encoded = base64.b64encode(payload).decode("ascii")
    return {
        "dataUrl": f"data:image/webp;base64,{encoded}",
        "width": placeholder.width,
        "height": placeholder.height,
        "bytes": len(payload),
        "sha256": hashlib.sha256(payload).hexdigest(),
    }


def generated_item(
    source: MediaSource,
    source_size: tuple[int, int],
    variants: dict[str, Image.Image],
) -> dict[str, object]:
    output_metadata: dict[str, dict[str, object]] = {}
    thumbnail_role = variant_roles(source)["thumbnail"]
    placeholder = create_inline_placeholder(variants[thumbnail_role])

    for role, image in variants.items():
        path = output_path(source.media_id, role)
        save_webp(image, path)
        output_metadata[role] = {
            "path": str(path.relative_to(REPOSITORY_ROOT)),
            "width": image.width,
            "height": image.height,
            "sha256": sha256(path),
            "bytes": path.stat().st_size,
        }

    return {
        "id": source.media_id,
        "strategy": source.strategy,
        "source": {
            "path": source.relative_path,
            "width": source_size[0],
            "height": source_size[1],
            "sha256": source.sha256,
        },
        "variants": output_metadata,
        "placeholder": placeholder,
    }


def generate_upscaled_source(
    source: MediaSource,
    waifu2x_binary: Path,
    model_directory: Path,
) -> dict[str, object]:
    source_size = verify_source(source)
    dimensions = expected_dimensions(source, source_size)

    with tempfile.TemporaryDirectory(prefix=f"kafu-{source.media_id}-") as temp_dir:
        master_path = Path(temp_dir) / f"{source.media_id}-4x.png"
        subprocess.run(
            [
                str(waifu2x_binary),
                "-i",
                str(source.path),
                "-o",
                str(master_path),
                "-n",
                "-1",
                "-s",
                "4",
                "-m",
                str(model_directory),
                "-t",
                "256",
                "-j",
                "1:2:2",
                "-f",
                "png",
            ],
            check=True,
        )

        with Image.open(master_path) as master_image:
            master = master_image.copy()

        if master.size != dimensions["4x"]:
            raise RuntimeError(
                f"Unexpected 4x dimensions for {source.media_id}: {master.size}"
            )

        variants = {
            "2x": master.resize(dimensions["2x"], Image.Resampling.LANCZOS),
            "4x": master,
            "thumb": master.resize(dimensions["thumb"], Image.Resampling.LANCZOS),
        }

    return generated_item(source, source_size, variants)


def generate_native_source(source: MediaSource) -> dict[str, object]:
    source_size = verify_source(source)
    dimensions = expected_dimensions(source, source_size)
    roles = variant_roles(source)

    with Image.open(source.path) as source_image:
        master = source_image.copy()

    variants = {
        roles["display"]: master.resize(
            dimensions[roles["display"]],
            Image.Resampling.LANCZOS,
        ),
        roles["highDensity"]: master.resize(
            dimensions[roles["highDensity"]],
            Image.Resampling.LANCZOS,
        ),
        roles["thumbnail"]: master.resize(
            dimensions[roles["thumbnail"]],
            Image.Resampling.LANCZOS,
        ),
    }
    return generated_item(source, source_size, variants)


def generate() -> None:
    binary_value = os.environ.get("WAIFU2X_BIN")
    model_value = os.environ.get("WAIFU2X_MODEL_DIR")
    if not binary_value or not model_value:
        raise SystemExit(
            "Set WAIFU2X_BIN and WAIFU2X_MODEL_DIR before generating variants."
        )

    binary = Path(binary_value).expanduser().resolve()
    model_directory = Path(model_value).expanduser().resolve()
    if not binary.is_file():
        raise SystemExit(f"WAIFU2X_BIN is not a file: {binary}")
    if not model_directory.is_dir():
        raise SystemExit(f"WAIFU2X_MODEL_DIR is not a directory: {model_directory}")

    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    items = [
        generate_native_source(source)
        if source.strategy == "native"
        else generate_upscaled_source(source, binary, model_directory)
        for source in MEDIA_SOURCES
    ]
    manifest = {
        "generator": {
            "tool": "waifu2x-ncnn-vulkan",
            "release": "20250915",
            "model": model_directory.name,
            "noiseLevel": -1,
            "scale": 4,
            "webpQuality": WEBP_QUALITY,
            "thumbnailLongEdge": THUMBNAIL_LONG_EDGE,
            "placeholderLongEdge": PLACEHOLDER_LONG_EDGE,
            "placeholderWebpQuality": PLACEHOLDER_WEBP_QUALITY,
        },
        "items": items,
    }
    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    TYPE_SCRIPT_PATH.write_text(
        render_typescript_module(manifest),
        encoding="utf-8",
    )


def refresh_placeholders() -> None:
    if not MANIFEST_PATH.is_file():
        raise RuntimeError(f"Missing generated manifest: {MANIFEST_PATH}")

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    items_by_id = {item["id"]: item for item in manifest.get("items", [])}
    for source in MEDIA_SOURCES:
        item = items_by_id.get(source.media_id)
        if not item:
            raise RuntimeError(f"Manifest is missing {source.media_id}")
        thumbnail_path = output_path(
            source.media_id,
            variant_roles(source)["thumbnail"],
        )
        if not thumbnail_path.is_file():
            raise RuntimeError(f"Missing generated thumbnail: {thumbnail_path}")
        with Image.open(thumbnail_path) as thumbnail_image:
            item["placeholder"] = create_inline_placeholder(thumbnail_image.copy())

    generator = manifest.setdefault("generator", {})
    generator["placeholderLongEdge"] = PLACEHOLDER_LONG_EDGE
    generator["placeholderWebpQuality"] = PLACEHOLDER_WEBP_QUALITY
    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    TYPE_SCRIPT_PATH.write_text(
        render_typescript_module(manifest),
        encoding="utf-8",
    )
    check()


def refresh_native_sources() -> None:
    if not MANIFEST_PATH.is_file():
        raise RuntimeError(f"Missing generated manifest: {MANIFEST_PATH}")

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    items = [
        item
        for item in manifest.get("items", [])
        if isinstance(item, dict)
    ]
    items_by_id = {item["id"]: item for item in items}

    for source in MEDIA_SOURCES:
        if source.strategy != "native":
            continue
        items_by_id[source.media_id] = generate_native_source(source)

    manifest["items"] = [
        items_by_id[source.media_id]
        for source in MEDIA_SOURCES
    ]
    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    TYPE_SCRIPT_PATH.write_text(
        render_typescript_module(manifest),
        encoding="utf-8",
    )
    check()


def check() -> None:
    if not MANIFEST_PATH.is_file():
        raise RuntimeError(f"Missing generated manifest: {MANIFEST_PATH}")
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    items_by_id = {item["id"]: item for item in manifest.get("items", [])}

    for source in MEDIA_SOURCES:
        source_size = verify_source(source)
        dimensions = expected_dimensions(source, source_size)
        item = items_by_id.get(source.media_id)
        if not item:
            raise RuntimeError(f"Manifest is missing {source.media_id}")
        for role, expected_size in dimensions.items():
            path = output_path(source.media_id, role)
            if not path.is_file():
                raise RuntimeError(f"Missing generated variant: {path}")
            with Image.open(path) as image:
                if image.size != expected_size:
                    raise RuntimeError(
                        f"Dimension mismatch for {path}: expected {expected_size}, "
                        f"received {image.size}"
                    )
            manifest_variant = item["variants"][role]
            if manifest_variant["sha256"] != sha256(path):
                raise RuntimeError(f"Hash mismatch for generated variant: {path}")

        placeholder = item.get("placeholder")
        if not isinstance(placeholder, dict):
            raise RuntimeError(f"Manifest placeholder is missing for {source.media_id}")
        data_url = placeholder.get("dataUrl")
        if not isinstance(data_url, str) or not data_url.startswith(
            "data:image/webp;base64,"
        ):
            raise RuntimeError(
                f"Invalid placeholder data URL for {source.media_id}"
            )
        payload = base64.b64decode(data_url.split(",", 1)[1], validate=True)
        if placeholder.get("bytes") != len(payload):
            raise RuntimeError(
                f"Placeholder byte count mismatch for {source.media_id}"
            )
        if placeholder.get("sha256") != hashlib.sha256(payload).hexdigest():
            raise RuntimeError(f"Placeholder hash mismatch for {source.media_id}")
        with Image.open(BytesIO(payload)) as placeholder_image:
            expected_scale = PLACEHOLDER_LONG_EDGE / max(source_size)
            expected_placeholder_size = (
                max(1, round(source_size[0] * expected_scale)),
                max(1, round(source_size[1] * expected_scale)),
            )
            if placeholder_image.size != expected_placeholder_size:
                raise RuntimeError(
                    f"Placeholder dimensions mismatch for {source.media_id}: "
                    f"expected {expected_placeholder_size}, "
                    f"received {placeholder_image.size}"
                )

    expected_type_script = render_typescript_module(manifest)
    if not TYPE_SCRIPT_PATH.is_file():
        raise RuntimeError(f"Missing generated TypeScript module: {TYPE_SCRIPT_PATH}")
    if TYPE_SCRIPT_PATH.read_text(encoding="utf-8") != expected_type_script:
        raise RuntimeError(
            "Generated TypeScript module is out of sync; regenerate media variants."
        )

    derivative_count = sum(
        len(expected_dimensions(source, verify_source(source)))
        for source in MEDIA_SOURCES
    )
    print(
        f"Verified {len(MEDIA_SOURCES)} KAF media sources, "
        f"{derivative_count} derivatives, "
        f"{len(MEDIA_SOURCES)} inline placeholders, and the generated "
        "TypeScript module."
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    action = parser.add_mutually_exclusive_group()
    action.add_argument(
        "--check",
        action="store_true",
        help="Verify source hashes, generated dimensions, and derivative hashes.",
    )
    action.add_argument(
        "--refresh-placeholders",
        action="store_true",
        help=(
            "Refresh inline placeholder metadata from existing verified "
            "thumbnail derivatives without invoking waifu2x."
        ),
    )
    action.add_argument(
        "--refresh-native-sources",
        action="store_true",
        help=(
            "Generate source-native responsive derivatives and update the "
            "manifest without invoking waifu2x for existing preview media."
        ),
    )
    arguments = parser.parse_args()
    if arguments.check:
        check()
    elif arguments.refresh_placeholders:
        refresh_placeholders()
    elif arguments.refresh_native_sources:
        refresh_native_sources()
    else:
        generate()
        check()


if __name__ == "__main__":
    main()
