# Design

## Decision summary

The blur is primarily a source-density mismatch, not a CSS smoothing bug. The
Hero preview is enlarged far beyond its intrinsic size, especially on Retina
and mobile devices. The design therefore keeps the current successful
composition and changes the media delivery contract beneath it.

The chosen solution has four parts:

1. preserve the nine verified previews as immutable provenance inputs;
2. generate conservative 2× / 4× WebP derivatives and small thumbnails;
3. route every page artwork through one `ResponsiveArtwork` component;
4. move all visible attribution to a single footer source index and enable the
   existing lightbox's Zoom plugin for high-resolution inspection.

## Media model

```ts
interface KafMediaVariant {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

interface KafMedia {
  readonly id: string;
  readonly preview: KafMediaVariant;
  readonly display: KafMediaVariant;   // 2× derivative
  readonly highDensity: KafMediaVariant; // 4× derivative
  readonly thumbnail: KafMediaVariant;
  readonly alt: string;
  readonly credit: string;
  readonly sourceUrl: string;
  readonly licenseSummary: string;
  readonly licenseUrl: string;
  readonly canModify: boolean;
  readonly retrievedAt: string;
}
```

The preview remains the traceable source input. UI code renders `display.src`
with `highDensity.src 2x`. The Gallery rail and atmospheric backdrop render the
thumbnail only. Lightbox slides use the high-density source and dimensions.

## Shared component boundary

`src/pages/HomePage/components/ResponsiveArtwork.tsx` owns:

- `<img>` attributes and density `srcset`;
- intrinsic width/height from the display candidate;
- eager/lazy and fetch-priority policy supplied by the owner;
- optional `objectPosition` style;
- optional source override for thumbnail-only usage.

It does not own layout, cropping, captions, animation, or source links. Those
remain with the section that owns the composition.

## Hero behavior

Hero keeps a single full-bleed image and existing overlay. The source candidates
become:

- 1×: 1720×968 WebP;
- 2×: 3440×1936 WebP.

The CSS `scale: 1.002` is removed. `object-fit: cover` and existing desktop /
mobile object positions remain. This is intentionally a delivery fix rather
than another visual redesign.

## Gallery and lightbox

The stage uses responsive display/high-density candidates. The blurred backdrop
and thumbnail rail use thumbnail files. Lightbox slides use 4× candidates and
load the official Zoom plugin from the same lazy chunk as the lightbox core.

The Zoom plugin is configured conservatively:

- finite carousel remains;
- max zoom is bound to available image pixels;
- scroll-to-zoom remains disabled to avoid hijacking normal wheel behavior;
- keyboard `+` / `-`, double-click/tap, pinch, and modifier-wheel support remain
  provided by the library.

## Attribution architecture

Inline `MediaCredit` rendering is removed from page sections. A new footer
source block receives `kafMedia` and renders:

- one always-visible creator line containing required names;
- one native `<details>` disclosure with nine image entries;
- each entry contains title/identifier, actual credit string, source page, and
  license reference.

The existing legal disclaimer remains once. This makes the artwork presentation
cleaner without deleting source traceability or required creator names.

## Generated asset pipeline

The pipeline is documented and reproducible through a project script that
expects an external `WAIFU2X_BIN` path. It:

1. verifies source SHA-256;
2. invokes waifu2x with `-n -1 -s 4`;
3. writes the 4× WebP at quality 90;
4. downsamples a 2× WebP using Lanczos;
5. writes a longest-edge 480px thumbnail;
6. verifies aspect ratios and dimensions;
7. never overwrites source previews.

The waifu2x binary and models are not committed.

## Rollback

The original images remain untouched. Rollback consists of restoring the prior
typed media fields and section `<img>` calls, then removing the derivative
imports/files. No content URL, route, or data migration is involved.
