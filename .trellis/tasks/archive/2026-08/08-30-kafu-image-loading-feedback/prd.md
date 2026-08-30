# Improve weak-network image loading UX

## Goal

Make the GitHub Pages site understandable and usable while same-origin images
are still transferring over a slow mainland-China connection. Images must show
an immediate low-quality visual placeholder and an honest indeterminate loading
state, while network hints and responsive candidates favor content in reading
order and avoid unnecessarily large DPR downloads.

## Requirements

### Runtime ownership

- Keep every shipping image same-origin under the deployed `/kafu/assets/`
  path. Do not introduce a Japanese image origin, OSS bucket, external image
  CDN, or runtime image proxy.
- Extend the existing page-local `ResponsiveArtwork` boundary instead of adding
  another image component or a second lazy-loading runtime.
- Do not add a new runtime dependency. Native `<img>`, `load`/`error`, responsive
  image attributes, existing generated derivatives, and CSS are sufficient.

### Loading feedback

- Every responsive artwork reserves its current layout space and displays an
  inline, same-bundle low-quality placeholder before the requested image has
  decoded.
- The placeholder must not require a network request. Generate a tiny WebP data
  URL from the verified local thumbnail and include it in typed media metadata.
- Large artwork surfaces show a visible indeterminate loading treatment and the
  text `图片加载中` after a short anti-flash delay.
- Thumbnail controls may use a compact visual loading treatment without adding
  repeated text over every small thumbnail.
- Do not display a fake percentage or byte count. `<img>` does not expose
  reliable transfer progress without replacing native responsive-image loading
  with a fetch/blob pipeline.
- A failed image keeps the placeholder and exposes a clear `图片加载失败` state;
  the rest of the page remains usable.
- Cached images must resolve immediately without leaving a stale loading state.

### Bandwidth and request priority

- Replace density-only `1x`/`2x` candidates with width descriptors using the
  existing thumbnail, display, and high-density derivatives.
- Every responsive image role supplies an explicit `sizes` contract matching
  its real layout. A narrow high-DPR phone must not download a 3440px image when
  the 1720px derivative already exceeds the required source width.
- Preserve one eager, `fetchpriority="high"` image: the Hero foreground.
- The small Hero ambience remains lazy/low priority so it cannot compete with
  the responsive foreground preload.
- Profile and current Journey imagery remain lazy/automatic priority because
  they are the next reading surfaces.
- Works, Gallery, decorative backdrops, and thumbnail rails remain lazy and use
  low fetch priority.
- Preserve DOM/source order and native scrolling. Do not intercept scrolling or
  force an artificial download queue that blocks a currently visible image.

### Third-album cover

- Replace the `狂想β` typographic fallback with its verified official
  1600×1600 cover from the KAF discography page.
- Keep the original official PNG as a local provenance input and generate
  source-native 480px thumbnail, 800px display, and 1600px high-density WebP
  variants. Do not apply AI upscaling or creative modification.
- Document the direct official URL, jacket credit, SHA-256, technical
  derivative boundary, and personal non-commercial KAMITSUBAKI guideline basis.
- The cover must be same-origin at runtime and participate in the same loading
  feedback, width-candidate, priority, and bottom-source contracts.

### Accessibility and motion

- Preserve alt text, intrinsic width/height, semantic links/buttons, and
  existing responsive layout contracts.
- Mark the visual loading decoration as non-semantic; use `aria-busy` on the
  image wrapper without announcing dozens of repeated live-region messages.
- Disable shimmer/indeterminate animation under `prefers-reduced-motion`.

### Deployment

- Keep the manual-only GitHub Pages workflow.
- After local validation, commit, push `main`, manually dispatch the Pages
  workflow, and verify the public `/kafu/` deployment.

## Acceptance Criteria

- [x] All ten production media records contain a generated inline placeholder
      data URL derived from verified same-origin thumbnail content.
- [x] `ResponsiveArtwork` visibly distinguishes loading, loaded, and failed
      states and handles already-cached images.
- [x] The component renders one semantic `<img>` per artwork; the placeholder is
      an inline CSS/data-URL layer rather than a second network image.
- [x] Large images show `图片加载中`; thumbnail controls do not repeat the text.
- [x] Responsive `srcset` uses `w` descriptors and callers provide realistic
      `sizes` values.
- [x] At 390px / DPR 3, Hero selects the 1720px derivative rather than the
      3440px derivative; at 1440px / DPR 2 it can still select 3440px.
- [x] Exactly one image remains eager/high priority.
- [x] Below-fold Works/Gallery images remain lazy/low priority, while Profile
      and active Journey imagery retain automatic priority.
- [x] The Hero has one same-origin responsive preload whose 480/1720/3440
      candidates are verified in the `/kafu/` Pages artifact.
- [x] `狂想β` renders the verified official cover using source-native
      480/800/1600 candidates and no longer uses the typographic fallback.
- [x] Under a deterministic delayed-image browser test, the Hero and a
      below-fold artwork show a stable placeholder/loading state before the
      response and reveal the image after load without layout shift.
- [x] Existing viewport, reduced-motion, Gallery, Journey, image-loading,
      typography, and GitHub Pages tests remain green.
- [x] `mise run check`, `mise run e2e`, media verification, Pages artifact
      verification, workflow verification, `git diff --check`, and Trellis
      context validation pass.
- [x] Frontend media/quality SPEC documents weak-network placeholders,
      width-based candidates, role priority, and honest loading feedback.
- [x] The task is committed, manually deployed, publicly verified, and
      archived.

