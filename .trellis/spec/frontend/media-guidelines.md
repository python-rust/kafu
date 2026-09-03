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
  readonly placeholderDataUrl: string;
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

- `preview` — unchanged verified local provenance input;
- `display` — normal page candidate appropriate to the verified source;
- `highDensity` — larger page/lightbox candidate appropriate to the verified
  source;
- `thumbnail` — longest-edge 480px derivative used only for thumbnail/backdrop
  roles;
- `placeholderDataUrl` — generated longest-edge 32px WebP embedded inline for
  immediate weak-network feedback without another request;
- source/license fields — retained regardless of where attribution is rendered.

All variants preserve the preview aspect ratio exactly. The nine Piapro preview
inputs keep the established 2× display / 4× high-density contract. A reviewed
source-native asset may instead downsample the verified source; the current
`狂想β` cover uses 800px display, 1600px high-density, and 480px thumbnail
variants rather than artificial upscaling.

---

## Derivative Pipeline

The public work page may report a larger original while exposing only a smaller
preview without authentication. Never bypass source authentication or replace a
verified work with an unverified repost.

The approved Piapro-preview derivative process is:

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
6. generate and verify a tiny inline WebP placeholder for every media record.

Reviewed source-native images use the same manifest/type pipeline without
waifu2x. Generate those independently with:

```bash
python3 scripts/generate_kaf_media_variants.py --refresh-native-sources
```

The current source-native exception is the official 1600×1600 `狂想β` album
cover. Only technical resize/format derivatives are permitted for that asset;
its provenance and non-commercial usage boundary remain explicit in
`src/assets/kaf/ATTRIBUTION.md`.

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
  srcSet={`${media.thumbnail.src} 480w, ${media.display.src} 1720w, ${media.highDensity.src} 3440w`}
  sizes="...layout-specific CSS width..."
  width={media.display.width}
  height={media.display.height}
  alt={media.alt}
/>
```

Responsive images use width descriptors plus an explicit caller-owned `sizes`
expression. This allows the browser to combine layout width, DPR, connection,
and available candidates rather than assuming every DPR 2/3 device must fetch
the largest file. At 390px/DPR 3, the 1720px Hero is sufficient; at
1440px/DPR 2, the 3440px candidate remains available.

### Role matrix

| Role | Variant | Loading | Priority |
| --- | --- | --- | --- |
| Hero foreground | responsive display/high-density | eager | high |
| Profile | responsive width candidates | lazy | auto |
| Active Journey stage | responsive width candidates | lazy | auto |
| Linear/reduced-motion Journey media | responsive width candidates | lazy | low |
| Works media | responsive width candidates | lazy | low |
| Gallery active stage | responsive width candidates | lazy | low |
| Gallery backdrop | thumbnail | lazy | low |
| Gallery rail | thumbnail | lazy | low |
| Gallery lightbox | high-density | interaction-only | lazy chunk |

Only the Hero foreground may set `fetchPriority="high"`. Portrait ambience is
the foreground shell's existing inline placeholder; it is not a second network
image. Every rendered image keeps explicit intrinsic width and height.

The Hero foreground additionally has one responsive `<link rel="preload"
as="image">` in `index.html`. The preload `href`, `imagesrcset`, `imagesizes`,
and `fetchpriority="high"` must describe the same candidates as the rendered
Hero image and remain valid when production is served from the Cloudflare Pages root.

### Wrong vs correct

```tsx
// Wrong: an 860px preview is stretched into a full-viewport Hero.
<img src={media.preview.src} className={styles.heroImage} />

// Correct: shared density candidates and intrinsic dimensions.
<ResponsiveArtwork
  source={media}
  loading="eager"
  fetchPriority="high"
  sizes="100vw"
/>
```

```tsx
// Wrong: every Gallery thumbnail downloads the display candidate.
<ResponsiveArtwork source={media} />

// Correct: fixed small role.
<ResponsiveArtwork source={media} variant="thumbnail" alt="" />
```

---

## Weak-Network Loading Contract

Every `ResponsiveArtwork` renders one semantic `<img>` inside one progressive
shell. The shell must:

- reserve the final aspect ratio before transfer completes;
- paint `placeholderDataUrl` immediately as a blurred same-bundle background;
- expose `data-artwork-status=loading|loaded|error`;
- use `aria-busy="true"` only while loading;
- show an honest indeterminate line and delayed `图片加载中` text for normal
  artwork surfaces;
- keep compact thumbnail feedback visual-only to avoid repeated labels;
- reveal the final image immediately on the native `load` event;
- never gate visibility on `HTMLImageElement.decode()` settling;
- recognize `complete && naturalWidth > 0` images in a layout effect before
  paint;
- retain a page-session record keyed by the exact source role, `srcset`,
  `sizes`, viewport width, and DPR so an equivalent keyed remount starts loaded;
- retain the placeholder and show `图片加载失败` on error;
- suppress indeterminate animation under `prefers-reduced-motion`.

Do not display fake percentages. Do not replace native responsive image loading
with a fetch/blob pipeline merely to calculate byte progress. Do not render a
second network-backed `<img>` as the placeholder.

---

## Hero Quality Contract

- Desktop and landscape retain the full-bleed composition and intentional
  `cover` crop.
- Portrait mobile preserves the complete landscape artwork as a contained
  responsive foreground. Reuse the generated inline placeholder behind that
  same image shell as subordinate ambience; do not issue a second thumbnail
  request.
- Do not add a portrait `<picture>` source until a reviewed alternate crop with
  verified provenance exists. Resolution switching is not art direction.
- Keep exactly one network-backed Hero image. It is eager/high priority; the
  preserved ambience is inline and request-free.
- Preload the responsive foreground from HTML so discovery does not wait for
  React execution on a slow route.
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
- `MediaSources` provides one native `<details>` list with all ten titles,
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

- ten source hashes, 30 derivative dimensions/hashes, and ten inline
  placeholder payloads;
- variant dimensions and filenames in typed content;
- Hero current source at desktop DPR 1/DPR 2 and 390px mobile DPR 3;
- one same-origin responsive Hero preload whose candidates all exist in the
  Pages artifact;
- one eager/high-priority Hero foreground, no second Hero image request, and
  lazy offscreen images;
- mobile Hero equals or exceeds the stable initial viewport, does not expose
  `#about`, and uses `contain` for the portrait foreground;
- width-descriptor `srcset` plus realistic `sizes` on responsive images;
- delayed-response loading/loaded states, an unresolved-`decode()` regression,
  inline placeholder visibility, and stable element geometry;
- exact-request cached remounts start loaded while a changed viewport/DPR
  selection context does not reuse an incompatible state record;
- an uncached Journey transition keeps the previous clear image while loading,
  and already-seen forward/backward transitions record no loading/LQIP state;
- an offscreen browser-lazy load of the initial Journey image does not trigger
  adjacent speculative downloads before Scrollama entry;
- thumbnail-only sources for Gallery rail/backdrop;
- no Piapro work-page credit links inside `<main>`;
- ten bottom source/license records and visible required creator names;
- the `狂想β` work card uses the verified local official cover and its
  source-native 480/800/1600 candidates;
- lightbox high-density source, Zoom control, previous/next, synchronization,
  and Escape close;
- existing viewport, 200% text, reduced-motion, contrast, and overflow gates.
