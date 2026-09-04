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
- `src/pages/HomePage/sections/GalleryLightbox.tsx` — lazy lightbox/Zoom adapter;
- `src/content/kafAvatar.json` and `src/content/kafAvatar.ts` — immutable VRM
  asset lock plus typed public-manifest projection;
- `src/assets/kaf/avatar/poster/` — the small local model-loading fallback;
- `functions/assets/models/kaf/[[path]].ts` — public same-origin R2 model proxy;
- `scripts/kaf-avatar/` — local-only VRM publication and poster extraction.

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
  readonly thumbnail: KafMediaVariant;
  readonly medium: KafMediaVariant;
  readonly display: KafMediaVariant;
  readonly large: KafMediaVariant;
  readonly highDensity: KafMediaVariant;
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

- `thumbnail` — longest-edge 480px derivative used only for thumbnail/backdrop
  roles;
- `medium` — longest-edge 960px responsive candidate;
- `display` — longest-edge 1280px normal responsive fallback;
- `large` — longest-edge 1920px responsive candidate;
- `highDensity` — longest-edge 2560px candidate, capped by the verified 4×
  master and used by large/high-DPR layouts and the lightbox;
- `placeholderDataUrl` — generated longest-edge 32px WebP embedded inline for
  immediate weak-network feedback without another request;
- source/license fields — retained regardless of where attribution is rendered.

The immutable previews remain generation/provenance inputs under `src/assets/`
and in `generated/manifest.json`; they are not imported into the browser bundle.
All variants preserve the preview aspect ratio. The nine Piapro previews use a
verified 4× master only as the source for the responsive ladder; browsers do not
receive that full master. A reviewed source-native asset may instead downsample
the verified source. The current `狂想β` cover uses longest edges
480/960/1200/1440/1600 rather than artificial upscaling.

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
outputs: Lanczos-downsampled 480/960/1280/1920/2560 responsive WebP candidates
WebP quality: 78 for thumbnails, 82 for all larger candidates
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
7. reject stale derivative filenames, policy drift, or more than 4.5 MB across
   the full generated candidate set.

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

## R2-backed VRM and poster contract

The interactive avatar is a different media role from the editorial image
ladder:

- the 49,911,472-byte `.vrm` is a local-only authoring/runtime input and is
  published to the immutable, content-addressed R2 object declared by
  `src/content/kafAvatar.json`;
- the Pages static artifact and Git history must contain no `.vrm`, `.blend`,
  source archive, or original model texture;
- `KafAvatarSection` links the public same-origin Function route for both the
  runtime loader and explicit visitor download;
- the generated public manifest exposes model id, author, format, version, byte
  size, SHA-256, and absolute download URL;
- public accessibility supports reproducibility and download, but does not
  convert the model into an MIT/CC/open-licensed asset or grant rights beyond
  the creator's permission and the underlying character boundary.

The local poster is the only avatar binary shipped by Vite. It is generated
from the VRM's embedded metadata thumbnail by:

```bash
mise run avatar-poster
```

The poster contract is:

- fixed 960×1200 WebP with locked byte size and SHA-256;
- explicit intrinsic width/height and `loading="lazy"`;
- visible before model activation, during transfer, on WebGL/load failure, and
  for the reduced-motion/manual-load path;
- hidden visually after the canvas is ready, with an empty alt value so it does
  not duplicate the ready canvas label;
- excluded from the responsive artwork candidate ladder and page-wide artwork
  warmup queue.

`KafAvatarSection` may render this one raw poster `<img>` because it is the
fallback shell for a WebGL model, not a responsive editorial-artwork role.
Every other homepage image remains owned by `ResponsiveArtwork`. Do not broaden
this exception to ordinary section media.

The model itself is activation-only:

- do not request it in HTML preload, Hero loading, or page artwork warmup;
- auto-activate only when the avatar section enters the bounded preload margin;
- reduced-motion users receive the poster until they explicitly request the
  model;
- loading progress may be derived from the same-origin `Content-Length`, but the
  model still remains one browser request and is parsed only after transfer;
- model size optimization is independent deferred work; R2 storage is not a
  reason to put a 47.6 MiB request on the initial critical path.

Provenance for the model and poster lives in `src/assets/kaf/ATTRIBUTION.md`.
Private permission conversations stay outside Git; the public record includes
only the creator, date, confirmed website scope, URLs, hashes, and applicable
usage boundary.

---

## Responsive Rendering Contract

All homepage images use `ResponsiveArtwork`. Raw `<img>` markup is confined to
that component.

Default output:

```tsx
<img
  src={media.display.src}
  srcSet={`${media.thumbnail.src} 480w, ${media.medium.src} 960w, ${media.display.src} 1280w, ${media.large.src} 1920w, ${media.highDensity.src} 2560w`}
  sizes="...layout-specific CSS width..."
  width={media.display.width}
  height={media.display.height}
  alt={media.alt}
/>
```

Responsive images use width descriptors plus an explicit caller-owned `sizes`
expression. This lets the browser combine layout width, DPR, connection, and
available candidates. The candidate ladder deliberately closes the former
480px-to-1720px gap: a 390px/DPR 2 Hero selects 960px, 390px/DPR 3 selects
1280px, 1440px/DPR 1 selects 1920px, and 1440px/DPR 2 uses the capped 2560px
high-density candidate.

### Role matrix

| Role | Variant | Loading | Priority |
| --- | --- | --- | --- |
| Hero foreground | responsive display/high-density | eager | high |
| Profile | responsive width candidates | eager | auto |
| Initial active Journey stage | responsive width candidates | lazy | low |
| First linear/reduced-motion Journey media | responsive width candidates | lazy | low |
| Later linear/reduced-motion Journey media | responsive width candidates | lazy | auto |
| Works media | responsive width candidates | lazy | auto |
| Gallery active stage | responsive width candidates | lazy | auto |
| Gallery backdrop | thumbnail | lazy | low |
| Gallery rail | thumbnail | lazy | low |
| Gallery lightbox | high-density | interaction-only | lazy chunk |
| Avatar poster | fixed 960×1200 WebP | lazy | auto |
| Avatar VRM | R2-backed binary | viewport/manual activation | auto |

Only the Hero foreground may set `fetchPriority="high"`. The Profile is the
only non-Hero eager image. The initial Journey image stays lazy/low so it cannot
compete as a peer with the closer Profile; the after-load warmup queue discovers
it before more distant sections. Portrait ambience is the foreground shell's
existing inline placeholder; it is not a second network image. Every rendered
image keeps explicit intrinsic width and height.

The Hero foreground additionally has one responsive `<link rel="preload"
as="image">` in `index.html`. The preload `href`, `imagesrcset`, `imagesizes`,
and `fetchpriority="high"` must describe the same candidates as the rendered
Hero image and remain valid when production is served from the Cloudflare Pages root.

### Ordered after-load warmup

Native `loading="lazy"` remains on distant DOM images so the browser can react
immediately when the reader jumps or scrolls. It is supplemented—not replaced—
by one page-owned background warmup queue:

```text
window load / Hero preload complete
  -> Profile
  -> Journey chapters in chronological order
  -> Works in rendered order
  -> active Gallery stage
  -> Gallery thumbnails in rail order
  -> remaining Gallery stage images
```

Ownership is split deliberately:

- `HomePage.tsx` starts and cancels the lifecycle;
- `homeArtworkWarmup.ts` maps typed page content into the ordered groups above;
- `components/artworkSizes.ts` is the single source of the `sizes` expressions
  shared by rendered images and detached warmup requests;
- `components/artworkWarmupQueue.ts` owns scheduling, concurrency, visibility,
  failure continuation, and performance marks;
- `artworkLoadCache.ts` owns exact-request deduplication and the detached
  `Image` request itself.

The queue contract is:

- wait until `window.load` so the HTML-discovered Hero resource keeps the first
  network opportunity;
- yield through `requestIdleCallback` with a bounded timeout between groups,
  falling back to `setTimeout` where idle callbacks are unavailable;
- create detached `Image` requests with `loading="eager"`,
  `decoding="async"`, and `fetchPriority="low"`;
- finish one group before starting the next, preserving top-to-bottom section
  priority; allow at most two requests inside a group on the normal path;
- reduce concurrency to one when the optional Network Information API reports
  Save-Data, slow-2g, 2g, or 3g; unsupported browsers use the conservative
  two-request default and must still work;
- pause new work while the document is hidden and resume when visible;
- deduplicate by source role + `srcset` + `sizes` + viewport/DPR context;
- continue after an individual preload failure so one asset cannot strand all
  later assets; a later visible `<img>` remains able to retry normally;
- expose `kafu-artwork-warmup-start` and
  `kafu-artwork-warmup-complete` performance marks for browser verification;
- cancel future scheduling on page unmount. An already-issued browser request
  may finish and populate the HTTP cache.

“Warm every page image” means every logical page visual at the candidate the
browser selects for its actual role, plus Gallery thumbnails. It does **not**
mean downloading all five responsive encodings or every lightbox-only
high-density alternative. Loading all alternatives would waste bytes without
making the rendered page more ready.

The native DOM image keeps its normal demand priority. If a reader reaches a
section before the background queue, the visible/lazy `<img>` may start first;
the browser and exact-request cache then coalesce or reuse the same selected
asset. Do not add scroll listeners, a fetch/blob image pipeline, a service
worker, or a second set of `<link rel="preload">` entries to implement this
policy.

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
- At the 1440×900 reference viewport, DPR 1 selects the 1920px candidate and DPR
  2 selects the 2560px candidate. At 390×844, DPR 2 selects 960px and DPR 3
  selects 1280px.
- Keep Japanese title glyphs, face detail, and color balance free of obvious
  halos or aggressive denoising.
- A different image requires verified provenance and product approval; larger
  pixel dimensions alone are not sufficient.

---

## Attribution Contract

The image-led page remains clean by consolidating attribution at the bottom:

- Hero, Journey, Works, and Gallery do not render per-image credit rows;
- required creator names remain visibly present in the footer source line;
- `MediaSources` provides one native `<details>` list with all ten editorial
  image titles, credits, work pages, and license references;
- the avatar section renders `模型制作：mme` beside its public download because
  the model is an interactive/downloadable runtime asset rather than one of the
  ten editorial images; the full record remains in `ATTRIBUTION.md`;
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
- active Gallery selection remains synchronized through `on.view`;
- selecting an inline thumbnail changes only the active media and never changes
  the document viewport;
- opening the lightbox cancels any in-flight inline Gallery transition, and
  lightbox-driven selection changes update the covered stage/backdrop without
  Motion transitions, so hidden animation cannot outlive the dialog;
- `GalleryLightbox` suppresses the package's pre-exit return-focus behavior and
  `GallerySection` restores focus to the persistent stage button only after the
  exit lifecycle, using `focus({ preventScroll: true })`;
- closing after previous/next navigation preserves the exact document viewport
  while retaining the package-owned body scroll lock.

Do not implement custom pan/zoom math, focus trapping, or body scroll locking.
Do not disable the package scroll lock or compensate for this interaction by
forcing `window.scrollTo`; fix focus timing and covered-stage stability instead.

---

## Required Tests

Automated checks must assert:

- ten source hashes, 50 editorial derivative dimensions/hashes, ten inline
  placeholder payloads, and one independently locked avatar poster;
- variant dimensions and filenames in typed content;
- Hero current source at desktop DPR 1/DPR 2 and 390px mobile DPR 3;
- one same-origin responsive Hero preload whose candidates all exist in the
  Pages artifact;
- one eager/high-priority Hero foreground, one eager/auto Profile, lazy/low
  initial Journey discovery, no second Hero image request, and lazy distant
  images;
- mobile Hero equals or exceeds the stable initial viewport, does not expose
  `#about`, and uses `contain` for the portrait foreground;
- width-descriptor `srcset` plus realistic `sizes` on responsive images;
- delayed-response loading/loaded states, an unresolved-`decode()` regression,
  inline placeholder visibility, and stable element geometry;
- exact-request cached remounts start loaded while a changed viewport/DPR
  selection context does not reuse an incompatible state record;
- an uncached Journey transition keeps the previous clear image while loading,
  and already-seen forward/backward transitions record no loading/LQIP state;
- without scrolling, background warmup requests all logical responsive visuals
  in section order and all Gallery thumbnails, while `window.scrollY` remains
  zero;
- a Journey transition reuses a warmup request already in flight rather than
  creating a second transfer, and keeps the previous clear image until it
  resolves;
- thumbnail-only sources for Gallery rail/backdrop;
- no Piapro work-page credit links inside `<main>`;
- ten bottom source/license records and visible required creator names;
- the `狂想β` work card uses the verified local official cover and its
  source-native 480/960/1200/1440/1600 candidates;
- the avatar lock, poster hash/size, R2 binding, and no-tracked/no-dist
  `.vrm`/`.blend` policy;
- the public avatar manifest and exact-path GET/HEAD/range proxy contract;
- no avatar-model request before viewport/manual activation, static poster on
  transfer/WebGL failure, and explicit reduced-motion loading;
- lightbox high-density source, Zoom control, previous/next, synchronization,
  and Escape close;
- a partially visible Gallery rail selection leaves `window.scrollY` unchanged;
- after starting an inline Gallery transition, opening a partially visible
  stage, navigating, and closing retains the package body lock while open,
  restores focus to the updated stage after close, and leaves `window.scrollY`
  unchanged after the former Motion window;
- existing viewport, 200% text, reduced-motion, contrast, and overflow gates.
