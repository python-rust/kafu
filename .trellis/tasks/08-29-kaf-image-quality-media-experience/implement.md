# Implementation plan

## Ordered work

1. Persist the measured source/display density audit and tool comparison.
2. Add a reproducible media-derivative script and generate 2×, 4×, and thumbnail
   WebP variants for all nine images.
3. Update `ATTRIBUTION.md` with derivative hashes, tool/version/settings, and the
   distinction between source previews and generated display files.
4. Extend `KafMedia` / gallery types and import the derivative variants.
5. Add `ResponsiveArtwork` and migrate Hero, Journey, Works, Gallery stage,
   Gallery backdrop, and Gallery thumbnails.
6. Remove inline media credits and add the bottom source index beside the
   existing footer disclaimer.
7. Enable the existing lightbox Zoom plugin with high-density slides.
8. Update unit and E2E tests for density selection, thumbnails, zoom, attribution,
   lazy loading, reduced motion, and responsive reflow.
9. Update frontend SPEC with the measured density budget and source-index rules.
10. Run complete quality gates, inspect bundle output, commit, archive, and record
    the session.

## Validation commands

```bash
python3 scripts/generate_kaf_media_variants.py --check
python3 ./.trellis/scripts/task.py validate 08-29-kaf-image-quality-media-experience
mise run format-check
mise run lint
mise run typecheck
mise run test
mise run build
mise run e2e
mise run check
git diff --check
```

## Browser assertions

- Hero `currentSrc` is the 1720 candidate at DPR 1 and 3440 candidate at DPR 2.
- Hero natural dimensions meet or exceed the measured device-pixel demand within
  the documented 2× density ceiling.
- Only Hero is eager/high-priority.
- Gallery rail and backdrop use thumbnail filenames.
- Main sections contain no inline source-credit links.
- Footer source area contains all nine source links and required creator names.
- Lightbox exposes zoom controls and still supports next/previous/Escape.
- Existing viewport, 200% text, reduced-motion, and overflow checks remain green.

## Review gates

- Do not proceed if generated images alter aspect ratio or source previews.
- Do not use a third-party repost as a replacement source.
- Do not add another runtime dependency.
- Do not hide required creator names only inside a closed disclosure.
- Do not allow the Gallery rail to load display/high-density assets.

## Commit shape

1. `feat: improve KAF media quality and inspection`
2. `docs: define responsive media and attribution contracts`
3. Trellis archive commit
4. Trellis journal commit

## Completion record

- Generated and verified 27 WebP derivatives plus the runtime TypeScript variant
  module from nine unchanged preview inputs; committed derivative set is about
  3.6MB.
- Hero delivery changed from the 860×484 JPEG preview to 1720×968 (`1x`) and
  3440×1936 (`2x`) WebP candidates.
- `ResponsiveArtwork` is now the only homepage component that emits `<img>`.
- Hero, Journey, Works, Gallery stage, Gallery backdrop, and Gallery rail use
  the documented role matrix.
- Inline media-credit rows were removed and replaced with one bottom source
  index containing nine work-page links and nine license links.
- Existing lazy lightbox now uses 4× slides and the bundled Zoom plugin.
- Validation completed:
  - media manifest check: 9 sources / 27 derivatives;
  - Vitest: 22 passed;
  - Playwright Chromium: 12 passed;
  - formatting, lint, type-check, production build, task context, and diff check:
    passed.
