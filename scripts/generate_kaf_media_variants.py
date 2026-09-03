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
WEBP_QUALITY: Final = 82
THUMBNAIL_WEBP_QUALITY: Final = 78
THUMBNAIL_LONG_EDGE: Final = 480
MEDIUM_LONG_EDGE: Final = 960
DISPLAY_LONG_EDGE: Final = 1280
LARGE_LONG_EDGE: Final = 1920
HIGH_DENSITY_LONG_EDGE: Final = 2560
PLACEHOLDER_LONG_EDGE: Final = 32
PLACEHOLDER_WEBP_QUALITY: Final = 35
MAX_GENERATED_BYTES: Final = 4_500_000

RUNTIME_VARIANT_ROLES: Final = (
    "thumbnail",
    "medium",
    "display",
    "large",
    "highDensity",
)
FILE_ROLE_BY_RUNTIME_ROLE: Final = {
    "thumbnail": "thumb",
    "medium": "medium",
    "display": "display",
    "large": "large",
    "highDensity": "high",
}
TYPESCRIPT_SUFFIX_BY_RUNTIME_ROLE: Final = {
    "thumbnail": "Thumbnail",
    "medium": "Medium",
    "display": "Display",
    "large": "Large",
    "highDensity": "HighDensity",
}


@dataclass(frozen=True)
class MediaSource:
    media_id: str
    relative_path: str
    sha256: str
    strategy: str = "upscale"
    medium_long_edge: int = MEDIUM_LONG_EDGE
    display_long_edge: int = DISPLAY_LONG_EDGE
    large_long_edge: int = LARGE_LONG_EDGE
    high_density_long_edge: int = HIGH_DENSITY_LONG_EDGE

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
        medium_long_edge=960,
        display_long_edge=1200,
        large_long_edge=1440,
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
    *,
    maximum_scale: int,
) -> tuple[int, int]:
    width, height = source_size
    scale = min(maximum_scale, long_edge / max(width, height))
    return (max(1, round(width * scale)), max(1, round(height * scale)))


def variant_roles() -> dict[str, str]:
    return dict(FILE_ROLE_BY_RUNTIME_ROLE)


def expected_dimensions(
    source: MediaSource,
    source_size: tuple[int, int],
) -> dict[str, tuple[int, int]]:
    roles = variant_roles()
    maximum_scale = 1 if source.strategy == "native" else 4
    targets = {
        roles["thumbnail"]: THUMBNAIL_LONG_EDGE,
        roles["medium"]: source.medium_long_edge,
        roles["display"]: source.display_long_edge,
        roles["large"]: source.large_long_edge,
        roles["highDensity"]: source.high_density_long_edge,
    }
    dimensions = {
        role: resized_dimensions(
            source_size,
            long_edge,
            maximum_scale=maximum_scale,
        )
        for role, long_edge in targets.items()
    }

    if len(set(dimensions.values())) != len(dimensions):
        raise RuntimeError(
            f"Responsive candidate dimensions must be unique for {source.media_id}: "
            f"{dimensions}"
        )

    return dimensions


def typescript_identifier(media_id: str) -> str:
    first, *rest = media_id.split("-")
    return first + "".join(part[:1].upper() + part[1:] for part in rest)


def typescript_property(media_id: str) -> str:
    return media_id if "-" not in media_id else f"'{media_id}'"


def typescript_variant_identifier(media_id: str, runtime_role: str) -> str:
    return (
        typescript_identifier(media_id)
        + TYPESCRIPT_SUFFIX_BY_RUNTIME_ROLE[runtime_role]
    )


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
        roles = variant_roles()
        for runtime_role in RUNTIME_VARIANT_ROLES:
            lines.append(
                f"import {typescript_variant_identifier(source.media_id, runtime_role)} "
                f"from './{source.media_id}-{roles[runtime_role]}.webp';"
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
            "  readonly thumbnail: GeneratedVariant;",
            "  readonly medium: GeneratedVariant;",
            "  readonly display: GeneratedVariant;",
            "  readonly large: GeneratedVariant;",
            "  readonly highDensity: GeneratedVariant;",
            "  readonly placeholderDataUrl: string;",
            "}",
            "",
            "export const generatedMediaVariants = {",
        ]
    )

    for source in MEDIA_SOURCES:
        roles = variant_roles()
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
        placeholder_data_url = placeholder["dataUrl"]
        lines.append(f"  {typescript_property(source.media_id)}: {{")
        for runtime_role in RUNTIME_VARIANT_ROLES:
            variant = variants[roles[runtime_role]]
            lines.append(
                f"    {runtime_role}: {{ src: "
                f"{typescript_variant_identifier(source.media_id, runtime_role)}, "
                f"width: {variant['width']}, height: {variant['height']} }},"
            )
        lines.extend(
            [
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


def save_webp(image: Image.Image, path: Path, *, quality: int) -> None:
    if image.mode not in {"RGB", "RGBA"}:
        image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
    image.save(path, "WEBP", quality=quality, method=6)


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
    thumbnail_role = variant_roles()["thumbnail"]
    placeholder = create_inline_placeholder(variants[thumbnail_role])

    for role, image in variants.items():
        path = output_path(source.media_id, role)
        quality = (
            THUMBNAIL_WEBP_QUALITY
            if role == thumbnail_role
            else WEBP_QUALITY
        )
        save_webp(image, path, quality=quality)
        output_metadata[role] = {
            "path": str(path.relative_to(REPOSITORY_ROOT)),
            "width": image.width,
            "height": image.height,
            "sha256": sha256(path),
            "bytes": path.stat().st_size,
            "quality": quality,
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
    roles = variant_roles()

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

        expected_master_size = (source_size[0] * 4, source_size[1] * 4)
        if master.size != expected_master_size:
            raise RuntimeError(
                f"Unexpected 4x dimensions for {source.media_id}: {master.size}"
            )

        variants = {
            roles[runtime_role]: master.resize(
                dimensions[roles[runtime_role]],
                Image.Resampling.LANCZOS,
            )
            for runtime_role in RUNTIME_VARIANT_ROLES
        }

    return generated_item(source, source_size, variants)


def generate_native_source(source: MediaSource) -> dict[str, object]:
    source_size = verify_source(source)
    dimensions = expected_dimensions(source, source_size)
    roles = variant_roles()

    with Image.open(source.path) as source_image:
        master = source_image.copy()

    variants = {
        roles[runtime_role]: master.resize(
            dimensions[roles[runtime_role]],
            Image.Resampling.LANCZOS,
        )
        for runtime_role in RUNTIME_VARIANT_ROLES
    }
    return generated_item(source, source_size, variants)


def expected_derivative_paths() -> set[Path]:
    return {
        output_path(source.media_id, file_role)
        for source in MEDIA_SOURCES
        for file_role in variant_roles().values()
    }


def prune_obsolete_derivatives() -> None:
    expected_paths = expected_derivative_paths()
    for path in OUTPUT_DIRECTORY.glob("*.webp"):
        if path not in expected_paths:
            path.unlink()


def generator_metadata(model_name: str) -> dict[str, object]:
    return {
        "tool": "waifu2x-ncnn-vulkan",
        "release": "20250915",
        "model": model_name,
        "noiseLevel": -1,
        "scale": 4,
        "webpQuality": WEBP_QUALITY,
        "thumbnailWebpQuality": THUMBNAIL_WEBP_QUALITY,
        "thumbnailLongEdge": THUMBNAIL_LONG_EDGE,
        "mediumLongEdge": MEDIUM_LONG_EDGE,
        "displayLongEdge": DISPLAY_LONG_EDGE,
        "largeLongEdge": LARGE_LONG_EDGE,
        "highDensityLongEdge": HIGH_DENSITY_LONG_EDGE,
        "placeholderLongEdge": PLACEHOLDER_LONG_EDGE,
        "placeholderWebpQuality": PLACEHOLDER_WEBP_QUALITY,
    }


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
    prune_obsolete_derivatives()
    manifest = {
        "generator": generator_metadata(model_directory.name),
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
            variant_roles()["thumbnail"],
        )
        if not thumbnail_path.is_file():
            raise RuntimeError(f"Missing generated thumbnail: {thumbnail_path}")
        with Image.open(thumbnail_path) as thumbnail_image:
            item["placeholder"] = create_inline_placeholder(thumbnail_image.copy())

    current_generator = manifest.get("generator")
    model_name = (
        current_generator.get("model", "models-cunet")
        if isinstance(current_generator, dict)
        else "models-cunet"
    )
    manifest["generator"] = generator_metadata(str(model_name))
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

    prune_obsolete_derivatives()
    manifest["items"] = [
        items_by_id[source.media_id]
        for source in MEDIA_SOURCES
    ]
    current_generator = manifest.get("generator")
    model_name = (
        current_generator.get("model", "models-cunet")
        if isinstance(current_generator, dict)
        else "models-cunet"
    )
    manifest["generator"] = generator_metadata(str(model_name))
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
    generator = manifest.get("generator")
    if not isinstance(generator, dict):
        raise RuntimeError("Generated manifest is missing generator metadata")
    expected_generator_policy = {
        "webpQuality": WEBP_QUALITY,
        "thumbnailWebpQuality": THUMBNAIL_WEBP_QUALITY,
        "thumbnailLongEdge": THUMBNAIL_LONG_EDGE,
        "mediumLongEdge": MEDIUM_LONG_EDGE,
        "displayLongEdge": DISPLAY_LONG_EDGE,
        "largeLongEdge": LARGE_LONG_EDGE,
        "highDensityLongEdge": HIGH_DENSITY_LONG_EDGE,
        "placeholderLongEdge": PLACEHOLDER_LONG_EDGE,
        "placeholderWebpQuality": PLACEHOLDER_WEBP_QUALITY,
    }
    for key, expected_value in expected_generator_policy.items():
        if generator.get(key) != expected_value:
            raise RuntimeError(
                f"Generator policy mismatch for {key}: expected "
                f"{expected_value}, received {generator.get(key)}"
            )

    actual_paths = set(OUTPUT_DIRECTORY.glob("*.webp"))
    expected_paths = expected_derivative_paths()
    if actual_paths != expected_paths:
        missing = sorted(str(path) for path in expected_paths - actual_paths)
        obsolete = sorted(str(path) for path in actual_paths - expected_paths)
        raise RuntimeError(
            "Generated derivative set is out of sync: "
            f"missing={missing}, obsolete={obsolete}"
        )

    generated_bytes = 0

    for source in MEDIA_SOURCES:
        source_size = verify_source(source)
        dimensions = expected_dimensions(source, source_size)
        item = items_by_id.get(source.media_id)
        if not item:
            raise RuntimeError(f"Manifest is missing {source.media_id}")
        if item.get("strategy") != source.strategy:
            raise RuntimeError(f"Strategy mismatch for {source.media_id}")
        manifest_variants = item.get("variants")
        if not isinstance(manifest_variants, dict):
            raise RuntimeError(f"Manifest variants are missing for {source.media_id}")
        if set(manifest_variants) != set(dimensions):
            raise RuntimeError(
                f"Variant role mismatch for {source.media_id}: "
                f"expected {sorted(dimensions)}, received {sorted(manifest_variants)}"
            )
        thumbnail_role = variant_roles()["thumbnail"]
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
            manifest_variant = manifest_variants[role]
            expected_relative_path = str(path.relative_to(REPOSITORY_ROOT))
            if manifest_variant.get("path") != expected_relative_path:
                raise RuntimeError(f"Path mismatch for generated variant: {path}")
            if manifest_variant["sha256"] != sha256(path):
                raise RuntimeError(f"Hash mismatch for generated variant: {path}")
            if manifest_variant.get("bytes") != path.stat().st_size:
                raise RuntimeError(f"Byte-count mismatch for generated variant: {path}")
            expected_quality = (
                THUMBNAIL_WEBP_QUALITY
                if role == thumbnail_role
                else WEBP_QUALITY
            )
            if manifest_variant.get("quality") != expected_quality:
                raise RuntimeError(f"Quality mismatch for generated variant: {path}")
            generated_bytes += path.stat().st_size

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
    if generated_bytes > MAX_GENERATED_BYTES:
        raise RuntimeError(
            f"Generated media budget exceeded: {generated_bytes} > "
            f"{MAX_GENERATED_BYTES} bytes"
        )
    print(
        f"Verified {len(MEDIA_SOURCES)} KAF media sources, "
        f"{derivative_count} derivatives, "
        f"{len(MEDIA_SOURCES)} inline placeholders, and the generated "
        f"TypeScript module ({generated_bytes} derivative bytes)."
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
