# KAF visual and motion audit

Research date: 2026-08-29

## Repository baseline

Measured in Chromium at 1440×900 before implementation:

| Metric | Baseline |
| --- | ---: |
| Document height | 15,693px |
| Viewport equivalents | 17.4 screens |
| Hero 花譜 title | 144px |
| Journey section heading | 100.8px |
| Works section heading | 108px |
| Gallery section heading | 108px |
| Primary nav label | 9.6px |
| Body base | 16px |

Code audit findings:

- `HeroSection.module.css`, `JourneySection.module.css`,
  `WorksSection.module.css`, `GallerySection.module.css`, and
  `OfficialLinksSection.module.css` each define their own neon gradients and
  microtype, producing visual repetition without a shared hierarchy.
- Journey uses `useScroll` + multiple `useTransform` mappings for adjacent image
  layers and gives every chapter an 82svh desktop minimum. This is visually and
  computationally disproportionate to the content.
- Existing assets already cover portrait, landscape, album, stage, and current
  chapter needs. Adding more assets would increase rights/provenance work without
  solving hierarchy or scroll rhythm.

## Official visual references

### KAMITSUBAKI STUDIO official site

- Source: https://kamitsubaki.jp/
- Observed role: restrained black/white brand skeleton, direct navigation,
  typography and imagery used as the primary identity rather than repeated glow
  decoration.
- Applied decision: use a neutral editorial skeleton and reserve color for
  meaningful KAF signals.

### KAF 5th album “Transcendent Love / 深愛” special site

- Source: https://kaf.kamitsubaki.jp/transcendent-love/
- Production credit: https://dotmp.jp/work/89047
- Observed role: high-key pink/blue atmosphere, vivid KAF pink, image-led layout,
  and system-text fragments integrated into the artwork rather than applied as a
  generic dark dashboard theme.
- Applied decision: use paper/fog, KAF pink, mist blue, and lilac as the homepage
  palette; keep one night contrast band instead of making every section dark.

## Typography research

- Source: https://web.dev/articles/baseline-in-action-fluid-type
- Key finding: viewport-only type weakens user zoom/default-font control.
  `clamp()` should retain `em`/`rem` anchors and keep the viewport contribution
  modest.
- Applied decision: shared `rem`-based type roles, body and label floors, reduced
  display ceilings, and explicit browser reflow/zoom verification.

## Animation/performance research

- Motion `useScroll`: https://motion.dev/docs/react-use-scroll
- Web performance guidance: https://web.dev/articles/animations-guide
- Key findings:
  - Scroll-linked animation is appropriate for genuine progress/parallax, but it
    is not free design value and should not be the default for all content.
  - `transform` and `opacity` are the safest animation properties; properties
    that trigger layout/paint should be avoided for smooth motion.
- Applied decision: remove continuous scroll-linked image-layer animation,
  retain Motion for keyed active-chapter transitions, and animate only transform
  and opacity.

## Smooth-scroll library evaluation

Lenis was reviewed as a mature native-scroll-oriented option, but it is rejected
for this task. The repository already has native smooth anchors and Motion, while
the measured defects are excessive document length, viewport-sized chapter
tracks, extreme type contrast, and layered scroll-linked transforms. Adding a
scroll wrapper would increase behavior, accessibility, and test surface without
removing those causes.

## Final decision

Refactor the existing implementation rather than replacing the stack:

1. shared semantic visual/type tokens;
2. image-led KAF editorial sections;
3. one observed active Journey state and one sticky visual;
4. compact supporting-work and section rhythms;
5. no new runtime dependencies or media.

## Implemented outcome

- The page foundation changed from full-page neon black to paper/ink with KAF
  pink, mist blue, and lilac accents; dark surfaces are now limited to
  purposeful contrast areas.
- Journey no longer uses `useScroll`, `useTransform`, or per-frame visual layer
  mappings. The active visual changes only when the observed chapter changes.
- Supporting works use a compact desktop card grid instead of three additional
  full-width editorial tracks.
- The 1440×900 document height fell from `15,693px` to `11,014px` while every
  chapter, work, gallery visual, credit, and official link remained present.
- Labels/navigation respect a `0.75rem` floor and section headings stay within
  the shared `--type-section` scale.
- Browser coverage now includes `320px`, a `200%` root font-size preference,
  reduced motion, intrinsic image sizing, touch targets, typography bounds, and
  density bounds.
- A final contrast audit darkened faint ink and chapter blue roles and changed
  the primary hero action to deep KAF pink with light text; a browser regression
  test keeps all three representative pairs at or above `4.5:1`.
