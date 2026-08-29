# Improve KAF image quality and media experience

## Goal

Remove visible blur from the Hero and other large artwork presentations without
changing the successful dark, image-led editorial direction. Build a measured,
responsive media pipeline from the existing licensed image set, keep the page
visually clean by moving credits to one bottom source index, and add only media
features that materially improve inspection of the artwork.

## Confirmed evidence

- `hero-kaihou.jpg` is only 860×484, while its Piapro work page reports a
  1920×1080 source.
- At 1440×900 the current Hero renders at about 1443×902 CSS pixels. At DPR 2,
  the display demand is about 2886×1804, so the local preview is enlarged by
  roughly 3.4–3.7× per source dimension.
- At 390×844 and DPR 3, the full-height mobile cover requires about 1172×2309
  device pixels; the 860×484 preview is especially under-resolved vertically.
- Most landscape assets are 860×484 even when their source pages report
  1280×720 or 1920×1080 originals. The portrait is 428×600 while its source is
  2122×2976, and the square image is 600×600 while its source is 3000×3000.
- Public Piapro pages expose the 860px preview but require login for original
  download. Replacing the asset with an unverified third-party repost is not
  acceptable.
- A conservative waifu2x-ncnn-vulkan benchmark runs successfully on the local
  Apple M1 Pro. The no-denoise 4× path preserves the original preview closely
  when downsampled while providing 3440×1936 output for 860×484 sources.
- The installed lightbox already bundles an official Zoom plugin; no second
  gallery or modal dependency is required.

## Requirements

### R1. Responsive high-density artwork

- Preserve the existing local preview files as provenance inputs.
- Generate 2× and 4× WebP display variants from each of the nine verified local
  images using the official waifu2x-ncnn-vulkan Apple-Silicon build, no denoise,
  and a visually conservative WebP quality setting.
- Generate dedicated lightweight thumbnail variants for the Gallery rail and
  blurred Gallery backdrop.
- Store all derived files under the owning `src/assets/kaf/` tree with names
  that identify their role and density.
- Do not claim that AI upscaling restores unavailable original detail. Record
  the tool, model, scale, settings, output dimensions, and source hashes in the
  provenance document.

### R2. One reusable responsive-image contract

- Extend the typed media model with explicit display, high-density, and
  thumbnail variants.
- Introduce one page-local responsive artwork component reused by Hero,
  Journey, Works, and Gallery.
- The component must preserve alt text, intrinsic dimensions, loading,
  decoding, fetch priority, object fit, object position, and CSS class control.
- Use density-aware `srcset` so DPR 2+ displays select the 4× variant instead of
  upscaling the 860px preview.
- Hero remains the only eager/high-priority image. Offscreen images stay lazy.

### R3. Hero clarity and stable art direction

- Keep the existing full-bleed Hero composition and text hierarchy.
- Remove the unnecessary fractional `scale` applied to the Hero image.
- Serve the Hero from 1720×968 and 3440×1936 variants so desktop Retina demand
  is covered without the current 3.7× browser enlargement.
- Preserve existing crop intent at desktop and mobile; do not introduce a
  different unrelated banner image merely because it is larger.
- Verify the selected candidate preserves the Japanese title glyphs, facial
  features, and color balance without obvious halos or over-sharpening.

### R4. Clean page-level attribution

- Remove visible per-image credit rows from Hero, Journey, Works, and Gallery.
- Keep alt text and source metadata in the typed content model.
- Add one bottom `画像出典` area adjacent to the footer. Creator names required
  by source terms must remain visibly present at the bottom of the page.
- Provide a compact native disclosure for the per-image title, creator/credit,
  Piapro work page, and license reference.
- Keep the existing unofficial/non-commercial footer disclaimer once. Do not
  repeat `non-commercial use` beside individual images.

### R5. Useful media functionality, not feature clutter

- Reuse the installed Yet Another React Lightbox Zoom plugin.
- Enable keyboard, mouse/trackpad, double-click/tap, and pinch zoom for the
  high-density Gallery slides.
- Keep finite previous/next navigation, Escape close, touch navigation, and
  selected-slide synchronization.
- Do not add downloads, autoplay, comments, likes, accounts, remote APIs, a
  second carousel, or decorative media controls.

### R6. Performance and accessibility

- Gallery thumbnails must use dedicated small assets rather than loading every
  4× display image for the rail.
- The blurred Gallery backdrop must use a thumbnail-sized source.
- Preserve semantic heading order, direct anchors, keyboard focus, 44px touch
  targets, reduced motion, 320px reflow, and 200% text reflow.
- Keep the lightbox code split and lazy-loaded.
- Update tests to assert responsive candidates, Hero density coverage,
  consolidated attribution, absence of inline credits, and zoom availability.

## Acceptance Criteria

- [x] Hero no longer uses the 860×484 preview as its rendered `currentSrc` at
      desktop DPR 1 or DPR 2.
- [x] Hero provides at least 1720×968 at DPR 1 and 3440×1936 at DPR 2+.
- [x] Every verified artwork has 2×, 4×, and Gallery-thumbnail WebP derivatives
      with matching aspect ratio and documented provenance.
- [x] Hero, Journey, Works, and Gallery use one shared responsive artwork
      component and no longer duplicate raw `<img>` loading contracts.
- [x] Only the Hero image is eager/high-priority; all other inline images remain
      lazy and retain intrinsic sizing.
- [x] No visible per-image credit row remains in the main page sections.
- [x] The bottom source area visibly names `花譜`, `PALOW.`, `川サキケンジ`,
      and `とり`, and exposes all nine source pages through one native details
      disclosure.
- [x] The Gallery lightbox uses the 4× slides and supports zoom via toolbar,
      keyboard shortcuts, mouse/touch gestures, and pinch gestures provided by
      the installed Zoom plugin.
- [x] Gallery thumbnail and blurred-backdrop images use thumbnail variants.
- [x] No unrelated image, runtime gallery dependency, animation framework, or
      image-CDN dependency is added.
- [x] The page remains free of horizontal overflow at the existing viewport
      matrix and at 200% root text.
- [x] `mise run check` and `mise run e2e` pass.
- [x] Frontend SPEC and `ATTRIBUTION.md` record the responsive-image,
      derivative, source-index, and zoom contracts.

## Out of Scope

- Authenticating into the user's Piapro account or bypassing Piapro's download
  controls.
- Claiming generated pixels are equivalent to the unavailable source original.
- Replacing the KAF visual set with scraped official-site or social-media images.
- Audio playback, embedded videos, playlists, user accounts, CMS features, or
  social engagement features.
- A general-purpose image build system for arbitrary future projects.

## Risks and mitigations

- **Upscaling artifacts:** use the no-denoise model path, preserve original
  files, compare downsample fidelity, and keep derivatives separately named.
- **Bundle growth:** use WebP quality 90, two density candidates, small Gallery
  thumbnails, and lazy loading outside the Hero.
- **Attribution becoming too hidden:** keep required creator names visible in
  the footer line and put per-image links in a native disclosure immediately
  below it.
- **Overbuilding the media experience:** add only Zoom from the already-installed
  lightbox and reject unrelated content or account features.

## Blocking questions

None. The user delegated research, design, implementation, SPEC updates, and
task archival, and the source/licensing constraints determine a conservative
implementation path.
