# Refine KAF visual system and scrolling experience

## Goal

Make the KAF Observatory homepage feel intentionally designed for 花譜 rather
than like a generic AI-product landing page. The result must use a restrained,
image-led editorial system, maintain readable hierarchy at every supported
viewport, and make the long-form journey feel materially lighter to scroll.

The redesign must preserve the existing verified content, local media,
provenance, semantic section order, direct anchors, and accessibility behavior.

## Background and confirmed evidence

- The current 1440×900 page measures 15,693px tall (17.4 viewport heights).
- At that viewport, the Journey heading renders at 100.8px, the Works and
  Gallery headings at 108px, the main 花譜 title at 144px, while primary nav
  labels render at 9.6px. This creates the oversized-title / undersized-detail
  contrast called out by the user.
- The desktop Journey currently binds image opacity, scale, and translation to
  continuous `scrollYProgress`, renders adjacent visual layers, and gives every
  chapter an approximately viewport-height track.
- The project already depends on Motion and already provides reduced-motion,
  semantic, intrinsic-image, navigation, and responsive-overflow tests.
- Existing local KAF media is rights-tracked and sufficient. No new third-party
  media is required.

## Requirements

### R1. KAF-led visual language

- Replace the full-page dark neon/cyan/magenta treatment with a high-key
  editorial foundation derived from official KAF/KAMITSUBAKI references:
  paper/fog neutrals, ink text, KAF pink as the main signal, and restrained
  mist-blue/lilac support.
- Let licensed KAF imagery carry the visual emphasis. Remove or reduce generic
  AI-dashboard motifs such as glowing grids, registration corners, ornamental
  signal geometry, and repeated radial neon fields.
- Preserve sufficient contrast, visible focus states, and the existing fan-site
  disclaimer.

### R2. Coherent, accessible typography

- Introduce shared global type roles instead of independently scaling each
  section to extreme values.
- Keep normal body copy at or above `1rem` and recurring metadata/labels at or
  above `0.75rem` unless a specific non-essential decorative mark is smaller.
- Use `rem`-based `clamp()` values with only a modest viewport contribution;
  typography must still respond to browser zoom and user font preferences.
- Reduce display-size ceilings so headings no longer dominate an entire screen,
  and keep readable line length and line-height for Chinese, Japanese, and
  English text.

### R3. Lighter scrolling and motion

- Keep native document scrolling and the existing Motion dependency. Do not add
  Lenis, GSAP, or another smooth-scroll/animation runtime without measured need.
- Replace Journey's continuous scroll-linked multi-layer transforms with a
  low-frequency active-chapter transition driven by the existing observer.
- Preserve a desktop sticky visual stage, but shorten the chapter tracks and
  ensure the stage releases before Works.
- Animate only compositor-friendly properties (`transform` and `opacity`) and
  retain a complete linear experience for reduced-motion users.

### R4. Editorial layout and responsive rhythm

- Rebalance Hero, Journey, Works, Gallery, Official Links, and Footer so spacing
  follows one shared section rhythm rather than each section behaving like a
  separate landing-page template.
- Make supporting works substantially more compact on desktop while preserving
  source order on narrow screens.
- Preserve all existing section IDs, chapter IDs, image credits, official
  destinations, intrinsic dimensions, and lazy/eager loading contracts.
- Maintain at least 44px mobile navigation hit targets and prevent essential
  text or links from clipping at 320px+ widths.

### R5. Reuse and scope discipline

- Reuse CSS Modules, existing global tokens, Motion, native IntersectionObserver,
  and the existing typed content/media model.
- Centralize genuinely shared visual values in global tokens; do not create a
  speculative design-system package or generic component directory.
- Do not change editorial facts, media files, licensing/provenance records,
  routing, or introduce remote data fetching.

## Acceptance Criteria

- [x] The homepage uses a light editorial foundation with KAF pink and
      blue/lilac accents; no section reads as a repeated dark-neon AI template.
- [x] At 1440×900, the primary nav label is at least 12px, body copy is at least
      16px, and section-heading ceilings are materially below the former 108px.
- [x] Journey no longer imports or uses `useScroll`, `useTransform`, or
      scroll-progress-bound visual layers.
- [x] Desktop Journey still exposes a sticky stage that changes with the active
      chapter and releases before Works; mobile and reduced-motion modes retain
      all six chapters in source order.
- [x] The full desktop document is materially shorter than the 15,693px baseline
      without hiding content.
- [x] No new runtime dependency is added.
- [x] Existing semantic, image-priority, source-link, anchor, focus, reduced
      motion, and responsive-overflow contracts remain covered by tests.
- [x] `mise run check` and `mise run e2e` pass.
- [x] The new visual/type/motion conventions are captured under
      `.trellis/spec/frontend/`.

## Out of Scope

- New KAF artwork, font files, audio/video, WebGL, canvas effects, or remote
  content loading.
- Rewriting factual content or changing official outbound URLs.
- A reusable multi-brand design system, theme switcher, or generalized animation
  framework.
- Replacing React, CSS Modules, Motion, or the current route architecture.

## Risks and mitigations

- **Risk:** Reducing track height can make chapter activation unstable.
  **Mitigation:** Keep observed semantic articles, verify center-scrolling for
  early/middle/final chapters in Playwright, and retain explicit anchors.
- **Risk:** A light palette can reduce image-caption contrast.
  **Mitigation:** Use semantic ink/muted tokens and preserve focus/contrast checks
  in browser validation.
- **Risk:** CSS-only visual changes can conceal responsive clipping.
  **Mitigation:** Retain the existing bounding-box clipping assertions across
  the viewport matrix and add typography/layout assertions where useful.

## Blocking questions

None. The user explicitly requested independent research, planning, execution,
spec update, and archival; repository evidence resolves the implementation
boundaries without requiring a product-choice follow-up.

## Completion Evidence

- 1440×900 document height: `15,693px` → `11,014px` (`-29.8%`).
- Navigation text: `9.6px` → `12.832px`.
- Journey / Works / Gallery section headings: `100.8–108px` → `69.52px`.
- Primary body copy: `16px / 27.2px` line box.
- Horizontal overflow: `0px` in the measured desktop output.
- Validation: 22 Vitest tests and 9 Chromium Playwright tests pass.
- Contrast regressions are covered for faint ink, chapter blue, and the primary
  hero action; each tested pair remains at or above `4.5:1`.
