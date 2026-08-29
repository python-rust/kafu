# Image quality and media UX research

Research date: 2026-08-30

## Measured root cause

The Hero source is 860×484. Browser measurements:

| Environment | CSS render | Device-pixel demand | Enlargement from source |
| --- | ---: | ---: | ---: |
| 1440×900, DPR 1 | 1443×902 | 1443×902 | 1.68× / 1.86× |
| 1440×900, DPR 2 | 1443×902 | 2886×1804 | 3.36× / 3.73× |
| 390×844, DPR 3 | 391×770 cover box | 1172×2309 | 1.36× / 4.77× |

`object-fit: cover` preserves aspect ratio; it does not invent pixels. The blur
comes from scaling the preview above its intrinsic dimensions. CSS
`image-rendering` cannot restore missing detail and pixelated/crisp modes are
wrong for illustration/photo artwork.

## Source verification

Piapro work `邂逅` (`https://piapro.jp/t/N-95`) reports:

- source dimensions: 1920×1080;
- file size: 1.8MB;
- public display asset: 860×484 preview;
- original download is behind Piapro login.

The repository therefore used a public display preview, not the reported source
original. Other provenance entries show the same pattern: source pages report
1280×720, 1920×1080, 2122×2976, or 3000×3000 while local files are previews.

## Responsive-image guidance

Web platform guidance recommends multiple candidates through `srcset` so the
browser can select an image appropriate to display density. `picture` is most
useful when the crop/content changes; the current Hero crop remains valid, so
density candidates are sufficient. Intrinsic width and height remain required
to preserve layout stability.

Decision: use explicit 1×/2× density candidates because a full-height
`object-fit: cover` Hero can require more source pixels than its CSS width alone
suggests. The 4× derivative is the 2× candidate for the 2× derivative base.

## Upscaler evaluation

### Real-ESRGAN

The official project supplies an anime-optimized model and portable NCNN
executables. Its last macOS NCNN release is old and exited with a segmentation
fault on the current macOS 26 / Apple-Silicon environment, so it was rejected as
the production path rather than patched locally.

### waifu2x-ncnn-vulkan

The official project provides a 2025 macOS build for Apple-Silicon and bundles
the models. It ran successfully on the Apple M1 Pro.

Hero benchmark candidates:

| Candidate | Output | Downsample RMS vs source | Edge RMS at 1720×968 |
| --- | ---: | ---: | ---: |
| no denoise, 2× | 1720×968 | ~1.0/channel | 28.96 |
| noise 0, 2× | 1720×968 | ~1.3–2.8 | 29.52 |
| noise 1, 2× | 1720×968 | ~1.3–1.6 | 29.43 |
| no denoise, 4× | 3440×1936 | ~1.3–1.5 | 29.96 |
| noise 1, 4× | 3440×1936 | ~1.6–2.0 | 30.44 |

The no-denoise 4× path is selected. It increases delivery density while staying
closest to the verified preview and avoiding unnecessary denoising/hallucinated
edge treatment.

WebP quality 90 produces a 3440×1936 Hero around 425KB and a 1720×968 Hero
around 179KB in the benchmark—comparable to or smaller than the current 408KB
860px JPEG while carrying substantially more pixels.

## Lightbox functionality

Yet Another React Lightbox already supports responsive slides and bundles an
optional Zoom plugin. The plugin provides pinch, double-tap/click, keyboard
`+`/`-`, modifier-wheel zoom, and panning. It calculates useful zoom from image
dimensions, which makes high-density variants materially useful.

Decision: enable Zoom in the existing lazy lightbox chunk. Do not add download,
slideshow, comments, or another gallery dependency.

## Attribution placement

The user's design requirement is a clean image presentation with source details
at the page bottom. Piapro creator-name conditions require the creator name to
be displayed but do not require a caption adjacent to every repeated rendering.

Decision:

- remove repeated inline credit rows;
- keep required creator names always visible in the footer source line;
- place per-image source and license links in one native disclosure immediately
  below;
- retain the single unofficial/non-commercial footer disclaimer.

## Final recommendation

Keep the current art direction. Fix the delivery layer, not the aesthetic:

1. conservative high-density derivatives;
2. density-aware responsive rendering;
3. thumbnail-specific assets;
4. one bottom provenance index;
5. zoom inside the existing lightbox.

## Implemented result

- Source previews remained byte-for-byte unchanged and continue to match the
  pinned SHA-256 values.
- The generated directory contains 27 WebP files plus a manifest and occupies
  about 3.6MB in the repository.
- Hero outputs:
  - 1720×968 WebP: 178,570 bytes;
  - 3440×1936 WebP: 424,608 bytes;
  - 480×270 thumbnail: 21,102 bytes.
- Chromium selects the 1720×968 Hero at DPR 1 and the 3440×1936 Hero at DPR 2.
- The page source contains one raw `<img>` owner (`ResponsiveArtwork`) and no
  per-section image-loading implementations.
- Gallery backdrop/rail use thumbnail variants, while the lightbox opens the 4×
  source and exposes localized Zoom controls.
- The final browser suite passes the existing six-viewport matrix, 200% text,
  reduced motion, source-index, image-density, zoom, and overflow contracts.
