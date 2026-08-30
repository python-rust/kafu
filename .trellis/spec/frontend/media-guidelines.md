# Media Guidelines

> Executable contracts for KAF artwork provenance, responsive delivery,
> derivatives, thumbnails, attribution, and lightbox inspection.

---

## Scope and Owners

Read this file before changing any KAF image import, media type, `<img>`
attribute, Gallery thumbnail, Hero crop, source link, derivative file, or
lightbox image behavior.

The owners are:

- `src/assets/kaf/` — immutable verified preview inputs and provenance;
- `src/assets/kaf/generated/` — reproducible display derivatives and manifest;
- `scripts/generate_kaf_media_variants.py` — derivative generation/checking;
- `src/content/kaf.ts` — typed media records and source/license metadata;
- `src/pages/HomePage/components/ResponsiveArtwork.tsx` — the only homepage
  `<img>` contract;
- `src/pages/HomePage/components/MediaSources.tsx` — page-bottom source index;
- `src/pages/HomePage/sections/GalleryLightbox.tsx` — lazy lightbox/Zoom adapter.

Do not bypass these owners with section-local image attributes or copied source
metadata.

---

## Typed Media Contract

```ts
interface KafMediaVariant {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

interface KafMedia {
  readonly id: string;
  readonly title: string;
  readonly preview: KafMediaVariant;
  readonly display: KafMediaVariant;
  readonly highDensity: KafMediaVariant;
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

Field meaning:

- `preview` — unchanged public Piapro preview used as the provenance input;
- `display` — conservative 2× derivative used as the `1x` page candidate;
- `highDensity` — conservative 4× derivative used as the `2x` page candidate
  and full lightbox source;
- `thumbnail` — longest-edge 480px derivative used only for thumbnail/backdrop
  roles;
- source/license fields — retained regardless of where attribution is rendered.

All variants preserve the preview aspect ratio exactly. `display` dimensions
are 2× preview dimensions and `highDensity` dimensions are 4× preview
dimensions.

---

## Derivative Pipeline

The public work page may report a larger original while exposing only a smaller
preview without authentication. Never bypass source authentication or replace a
verified work with an unverified repost.

The approved local derivative process is:

```text
tool: waifu2x-ncnn-vulkan 20250915 (official portable macOS build)
model: models-cunet
noise: -1 (no denoise)
master scale: 4
output: WebP quality 90
display: Lanczos downsample from 4× to 2×
thumbnail: Lanczos downsample, longest edge 480px
```

Run generation with an external tool path; do not commit the binary or models:

```bash
WAIFU2X_BIN=/path/to/waifu2x-ncnn-vulkan \
WAIFU2X_MODEL_DIR=/path/to/models-cunet \
python3 scripts/generate_kaf_media_variants.py
```

Verify committed files without regenerating:

```bash
python3 scripts/generate_kaf_media_variants.py --check
```

The script must:

1. verify every preview SHA-256 before processing;
2. never overwrite a preview;
3. verify output dimensions and aspect ratio;
4. write derivative SHA-256 and byte size to `generated/manifest.json`;
5. generate and verify `generated/mediaVariants.ts` from the same dimensions so
   runtime imports cannot drift from the manifest.

Upscaling improves delivery density; it does not restore inaccessible source
pixels. Documentation and UI must never call a derivative an “original” or
claim recovered detail.

---

## Responsive Rendering Contract

All homepage images use `ResponsiveArtwork`. Raw `<img>` markup is confined to
that component.

Default output:

```tsx
<img
  src={media.display.src}
  srcSet={`${media.display.src} 1x, ${media.highDensity.src} 2x`}
  width={media.display.width}
  height={media.display.height}
  alt={media.alt}
/>
```

The density descriptors are intentional. Desktop/landscape Hero uses
`object-fit: cover`; portrait mobile uses the same responsive candidate as a
contained foreground. Source-pixel demand therefore depends on the rendered
role and device density, not CSS width alone.

### Role matrix

| Role | Variant | Loading | Priority |
| --- | --- | --- | --- |
| Hero foreground | responsive display/high-density | eager | high |
| Hero portrait ambience | thumbnail | lazy | normal |
| Journey stage and linear media | responsive display/high-density | lazy | normal |
| Works media | responsive display/high-density | lazy | normal |
| Gallery active stage | responsive display/high-density | lazy | normal |
| Gallery backdrop | thumbnail | lazy | normal |
| Gallery rail | thumbnail | lazy | normal |
| Gallery lightbox | high-density | interaction-only | lazy chunk |

Only the Hero foreground may set `fetchPriority="high"`. The portrait ambience
is decorative (`alt=""`, `aria-hidden`) and never receives a `srcset`. Every
rendered image keeps explicit intrinsic width and height.

### Wrong vs correct

```tsx
// Wrong: an 860px preview is stretched into a full-viewport Hero.
<img src={media.preview.src} className={styles.heroImage} />

// Correct: shared density candidates and intrinsic dimensions.
<ResponsiveArtwork
  source={media}
  loading="eager"
  fetchPriority="high"
/>
```

```tsx
// Wrong: every Gallery thumbnail downloads the display candidate.
<ResponsiveArtwork source={media} />

// Correct: fixed small role.
<ResponsiveArtwork source={media} variant="thumbnail" alt="" />
```

---

## Hero Quality Contract

- Desktop and landscape retain the full-bleed composition and intentional
  `cover` crop.
- Portrait mobile preserves the complete landscape artwork as a contained
  responsive foreground. Reuse the generated 480px thumbnail as a subordinate
  blurred ambience so unused space feels intentional without acquiring or
  inventing another asset.
- Do not add a portrait `<picture>` source until a reviewed alternate crop with
  verified provenance exists. Resolution switching is not art direction.
- Keep exactly one eager/high-priority image. The ambience is lazy and
  decorative.
- Do not add a fractional image scale to hide seams; it unnecessarily resamples
  the artwork.
- At the 1440×900 reference viewport, DPR 1 selects the 1720×968 Hero and DPR 2
  selects the 3440×1936 Hero.
- Keep Japanese title glyphs, face detail, and color balance free of obvious
  halos or aggressive denoising.
- A different image requires verified provenance and product approval; larger
  pixel dimensions alone are not sufficient.

---

## Attribution Contract

The image-led page remains clean by consolidating attribution at the bottom:

- Hero, Journey, Works, and Gallery do not render per-image credit rows;
- required creator names remain visibly present in the footer source line;
- `MediaSources` provides one native `<details>` list with all nine titles,
  credits, work pages, and license references;
- source and license metadata remain in `KafMedia` even when the disclosure is
  closed;
- the unofficial/non-commercial disclaimer remains once in the footer.

Do not delete provenance to simplify composition. Do not repeat “non-commercial
use” beside every image when the single footer disclaimer and source index own
that legal/source context.

---

## Lightbox and Zoom Contract

Use the existing `yet-another-react-lightbox` dependency and its bundled Zoom
plugin. The lazy `GalleryLightbox` adapter owns package imports and settings.

Required behavior:

- high-density slide source and intrinsic dimensions;
- finite previous/next navigation;
- Escape close and focus management;
- touch/swipe navigation;
- Zoom toolbar control;
- keyboard `+` / `-`, double-click/tap, pinch, and modifier-wheel zoom supplied
  by the plugin;
- `scrollToZoom: false` so normal wheel/trackpad scrolling is not hijacked;
- active Gallery selection remains synchronized through `on.view`.

Do not implement custom pan/zoom math, focus trapping, or body scroll locking.

---

## Required Tests

Automated checks must assert:

- source preview hashes and 27 derivative dimensions/hashes;
- variant dimensions and filenames in typed content;
- Hero current source at DPR 1 and DPR 2;
- one eager/high-priority Hero foreground, one lazy thumbnail ambience on
  portrait mobile, and lazy offscreen images;
- mobile Hero equals or exceeds the stable initial viewport, does not expose
  `#about`, and uses `contain` for the portrait foreground;
- responsive `srcset` on display images;
- thumbnail-only sources for Gallery rail/backdrop;
- no Piapro work-page credit links inside `<main>`;
- nine bottom source links and visible required creator names;
- lightbox high-density source, Zoom control, previous/next, synchronization,
  and Escape close;
- existing viewport, 200% text, reduced-motion, contrast, and overflow gates.
