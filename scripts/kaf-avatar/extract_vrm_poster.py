#!/usr/bin/env python3
"""Extract the embedded VRM thumbnail into a web poster.

The source VRM remains in the local-only asset directory. The generated WebP is
small enough to ship with the static page and acts as the loading/error fallback.
"""

from __future__ import annotations

import argparse
import json
import struct
from io import BytesIO
from pathlib import Path
from typing import Final

from PIL import Image

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[2]
DEFAULT_INPUT: Final = (
    REPOSITORY_ROOT
    / ".local-assets/kaf-avatar/original/kaf_fukuro_hatdown.vrm"
)
DEFAULT_OUTPUT: Final = (
    REPOSITORY_ROOT
    / "src/assets/kaf/avatar/poster/kaf-fukuro-hatdown.webp"
)
GLB_JSON_CHUNK: Final = 0x4E4F534A
GLB_BINARY_CHUNK: Final = 0x004E4942
OUTPUT_SIZE: Final = (960, 1200)


def read_glb(path: Path) -> tuple[dict[str, object], bytes]:
    with path.open("rb") as file:
        magic, version, declared_length = struct.unpack("<4sII", file.read(12))
        if magic != b"glTF" or version != 2:
            raise ValueError(f"{path} is not a GLB 2.0 / VRM file")
        if declared_length != path.stat().st_size:
            raise ValueError("GLB declared length does not match the file size")

        json_chunk: bytes | None = None
        binary_chunk: bytes | None = None
        while file.tell() < declared_length:
            chunk_length, chunk_type = struct.unpack("<II", file.read(8))
            chunk = file.read(chunk_length)
            if chunk_type == GLB_JSON_CHUNK:
                json_chunk = chunk
            elif chunk_type == GLB_BINARY_CHUNK:
                binary_chunk = chunk

    if json_chunk is None or binary_chunk is None:
        raise ValueError("VRM must contain JSON and binary GLB chunks")

    document = json.loads(json_chunk.rstrip(b"\x00 ").decode("utf-8"))
    if not isinstance(document, dict):
        raise ValueError("GLB JSON root must be an object")
    return document, binary_chunk


def embedded_thumbnail(document: dict[str, object], binary: bytes) -> Image.Image:
    extensions = document.get("extensions")
    if not isinstance(extensions, dict):
        raise ValueError("VRM extension is missing")
    vrm = extensions.get("VRM")
    if not isinstance(vrm, dict):
        raise ValueError("VRM 0.x metadata is missing")
    meta = vrm.get("meta")
    if not isinstance(meta, dict) or not isinstance(meta.get("texture"), int):
        raise ValueError("VRM metadata thumbnail index is missing")

    images = document.get("images")
    buffer_views = document.get("bufferViews")
    if not isinstance(images, list) or not isinstance(buffer_views, list):
        raise ValueError("VRM image tables are missing")

    image = images[meta["texture"]]
    if not isinstance(image, dict) or not isinstance(image.get("bufferView"), int):
        raise ValueError("VRM thumbnail is not embedded in a bufferView")
    view = buffer_views[image["bufferView"]]
    if not isinstance(view, dict):
        raise ValueError("VRM thumbnail bufferView is invalid")

    offset = int(view.get("byteOffset", 0))
    length = int(view["byteLength"])
    return Image.open(BytesIO(binary[offset : offset + length])).convert("RGBA")


def create_poster(source: Image.Image) -> Image.Image:
    alpha_bounds = source.getchannel("A").getbbox()
    if alpha_bounds is None:
        raise ValueError("VRM thumbnail is fully transparent")

    left, top, right, bottom = alpha_bounds
    subject_width = right - left
    subject_height = bottom - top

    # The first web view is a bust portrait. Preserve the face and shoulders,
    # while cropping the lower body that would make the loading poster too small.
    crop_height = max(1, round(subject_height * 0.72))
    crop_width = max(1, round(crop_height * OUTPUT_SIZE[0] / OUTPUT_SIZE[1]))
    center_x = (left + right) // 2
    crop_left = max(0, center_x - crop_width // 2)
    crop_right = min(source.width, crop_left + crop_width)
    crop_left = max(0, crop_right - crop_width)
    crop_top = max(0, top - round(subject_height * 0.03))
    crop_bottom = min(source.height, crop_top + crop_height)

    cropped = source.crop((crop_left, crop_top, crop_right, crop_bottom))
    return cropped.resize(OUTPUT_SIZE, Image.Resampling.LANCZOS)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    document, binary = read_glb(args.input)
    poster = create_poster(embedded_thumbnail(document, binary))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    poster.save(args.output, "WEBP", quality=86, method=6, exact=True)
    print(f"Wrote {args.output} ({poster.width}x{poster.height})")


if __name__ == "__main__":
    main()
