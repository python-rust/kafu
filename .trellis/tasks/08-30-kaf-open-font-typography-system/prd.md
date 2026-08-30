# Refine KAF typography with open web fonts

## Goal

Replace the platform-dependent Chinese typography baseline with a licensed,
self-hosted variable-font system that gives long-form Chinese copy a calm
reading face and gives titles a distinct editorial character. Keep Japanese
proper names source-faithful, preserve all responsive/mobile contracts, avoid
external font CDNs, and document redistribution requirements.

## Confirmed baseline

- The page currently relies on system stacks such as PingFang SC, Microsoft
  YaHei, Songti SC, and Japanese Mincho fallbacks. This is fast but gives
  noticeably different hierarchy and metrics across macOS and Windows.
- Major headings already share `--font-display-zh`; body/UI copy already shares
  `--font-sans`. The typography can therefore be improved through global roles
  instead of editing every component independently.
- The homepage is Chinese-first but contains authoritative Japanese names.
  Chinese reading copy and Japanese proper nouns require separate fallback
  roles.
- CJK webfonts are large. Package size is not a sufficient performance measure;
  the browser must be tested against the actual Unicode-range fragments used by
  the page.

## Research decision

### Selected

- `@fontsource-variable/noto-sans-sc@5.3.0`
  - SIL Open Font License 1.1;
  - Simplified Chinese sans-serif family;
  - variable weight range 100–900;
  - Fontsource self-hosted, version-pinned Unicode-range packaging.
- `@fontsource-variable/noto-serif-sc@5.3.0`
  - SIL Open Font License 1.1;
  - Simplified Chinese serif family;
  - variable weight range 200–900;
  - editorial display contrast without introducing a novelty font.

### Reviewed but not selected

- Klee One: OFL-licensed and suitable for Japanese accents, but the Fontsource
  Japanese file is approximately 1.8 MB per static weight. That cost is not
  proportionate to a small number of Japanese labels.
- LXGW WenKai / Screen: OFL-licensed and useful for Chinese reading, but upstream
  reserves names and limits the webfont-subsetting exception to approved
  platforms unless the author confirms another platform. It is unnecessary
  when direct, versioned Noto packages satisfy this iteration.
- Remote font/CDN delivery: rejected because deployment should remain
  same-origin, privacy-preserving, and reliable in constrained networks.

## Requirements

### R1. Role-based typography

- Body copy, navigation, controls, metadata, and factual descriptions use
  `Noto Sans SC Variable` through `--font-sans`.
- The Chinese Hero title, section headings, Journey titles, and major
  official-link identity use `Noto Serif SC Variable` through
  `--font-display-zh` / `--font-display`.
- The original Japanese identity plus album and Gallery work titles use
  `--font-display-ja`, keeping native Japanese Mincho fonts ahead of the SC
  serif fallback.
- Prominent years use the serif display role where it reinforces chronology;
  dense milestone dates remain in the readable sans role.

### R2. Self-hosting and loading

- Import the two variable packages once at the application root before project
  styles.
- Do not add a Google Fonts stylesheet, third-party font CDN, runtime loader, or
  JavaScript font manager.
- Preserve Fontsource's `font-display: swap` behavior.
- Use Fontsource's default Unicode-range declarations so the browser requests
  only fragments needed by page text.
- Keep exact package versions in `package.json` and `pnpm-lock.yaml`.

### R3. Typography tuning

- Re-tune negative tracking for Noto Serif SC instead of inheriting values
  calibrated for system Songti fonts.
- Preserve existing font-size floors, heading ceilings, line heights, action
  sizes, and semantic hierarchy.
- Use variable numeric weights; do not add separate files for every weight.
- Disable synthetic faces at the document level.

### R4. Licensing and notices

- Keep the complete SIL OFL 1.1 text in deployed static output.
- Add a repository notice naming packages, versions, upstream project, and
  license location.
- Do not expose font downloads as a product feature or sell font files alone.

### R5. Performance and regression safety

- Measure real font resource requests after `document.fonts.ready` on production
  preview rather than comparing unpacked NPM package sizes.
- At the current homepage baseline, same-origin font transfer remains at or
  below 3.5 MB and no more than 60 WOFF2 fragment requests.
- Preserve the viewport matrix, 200% text reflow, mobile Hero/Journey, Gallery,
  reduced-motion, and horizontal-overflow contracts.

## Acceptance Criteria

- [x] Noto Sans SC Variable and Noto Serif SC Variable are pinned at 5.3.0.
- [x] Body/UI computed typography uses Noto Sans SC Variable.
- [x] Chinese Hero, section, and Journey display typography uses Noto Serif SC
      Variable.
- [x] The Hero original name plus Japanese album/Gallery titles use the
      Japanese-first proper-name role.
- [x] Fontsource CSS is imported once from `src/main.tsx` and uses swap / Unicode
      ranges.
- [x] No external font host is contacted.
- [x] Both selected faces report loaded through the browser FontFaceSet.
- [x] Real homepage font resources are same-origin, <=60 requests, and <=3.5 MB
      transfer at the current static-content baseline.
- [x] `THIRD_PARTY_NOTICES.md` and deployed OFL text are present.
- [x] Existing responsive, 200% text, mobile interaction, and media tests remain
      green.
- [x] `mise run check`, `mise run e2e`, `git diff --check`, and Trellis context
      validation pass.
- [x] Frontend SPEC records role ownership, loading, licensing, and performance
      boundaries.

## Out of Scope

- Changing copy, content hierarchy, images, scroll interactions, colors, or
  section layout.
- Creating or modifying glyph data or generating a project-specific subset.
- Adding Klee One, LXGW WenKai, a remote CDN, or a third font family.

