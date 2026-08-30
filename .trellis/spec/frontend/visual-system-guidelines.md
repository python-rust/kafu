# Visual System Guidelines

> Executable visual, typography, layout, gallery, and motion contracts for the
> KAF frontend.

---

## Scope

Read this file before changing homepage colors, typography, spacing, responsive
composition, sticky behavior, image presentation, or animation. Also read
[Interface Content Guidelines](./content-guidelines.md) when a visual change
adds or reorganizes visible copy, and [Media Guidelines](./media-guidelines.md)
when it changes an image source, density, derivative, or lightbox behavior. Read
[Chinese Localization & Storytelling](./localization-and-storytelling-guidelines.md)
for fixed navigation, onboarding, chronology, and narrative motion.

The current product goal is a KAF-specific, image-led archive. It is not a
generic AI-product landing page, a cyber dashboard, or a pale editorial template.

Shared owners:

- `src/styles/tokens.css` — semantic palette, type roles, spacing, and motion;
- `src/styles/base.css` — document background, type defaults, focus, selection;
- `src/pages/HomePage/components/` — cross-section semantic presentation that
  has at least two real consumers;
- `src/pages/HomePage/sections/*.module.css` — section-specific composition;
- the owning section component — interaction state and external integration.

---

## KAF Art-Direction Contract

The page foundation is theatrical and warm-dark:

```css
--color-bg;
--color-bg-deep;
--color-bg-soft;
--color-bg-raised;
--color-bg-warm;
--color-text;
--color-text-muted;
--color-text-faint;
--color-kaf;
--color-kaf-light;
--color-blue-light;
--color-lilac;
```

### Required behavior

- Warm near-black / plum surfaces form the page structure.
- Off-white text is primary; muted text remains WCAG-readable at its actual
  size.
- KAF pink is a limited action/active-state signal, not a full-page wash.
- Blue/lilac may distinguish real chapter states; they are not competing brand
  colors.
- Licensed KAF artwork supplies the changing color and atmosphere.
- A media-derived blurred backdrop is allowed behind that media. It must update
  from the selected image and remain subordinate to the actual artwork.
- Flat borders, whitespace, cropping, and image scale are preferred over card
  decoration.

### Forbidden visual shortcuts

- repeated radial glow fields;
- neon grids, registration corners, faux signal diagrams, and scan lines;
- glassmorphism / backdrop-filter cards;
- pills applied to ordinary links, metadata, or section containers;
- arbitrary rounded containers used to make every block look like a component;
- independent section palettes that make one page feel like several templates;
- gradients whose only purpose is to simulate “premium” visual interest.

Linear overlays are allowed for image readability and media-derived atmosphere.
They are not allowed as a replacement for composition.

### Wrong vs correct

```css
/* Wrong: generic neon atmosphere repeated by every section. */
.section {
  background:
    radial-gradient(circle at 80% 20%, #ff3f9d33, transparent 30rem),
    #060711;
}

/* Correct: stable surface; the section's artwork carries visual variation. */
.section {
  background: var(--color-bg-soft);
  color: var(--color-text);
}
```

---

## Typography Contract

Use the shared roles:

```css
--type-label;
--type-body-small;
--type-body;
--type-lead;
--type-card-title;
--type-section;
--type-display;
```

Use `--font-display-zh` for Chinese interface/display text and
`--font-display-ja` for separately rendered authoritative Japanese names. The
body/sans stack is Simplified-Chinese-first (`PingFang SC`, `Microsoft YaHei`,
or an equivalent CJK SC font) before generic Latin/system fallbacks.

### Floors and ceilings

- Normal body copy: at least `1rem` / 16px at the default root size.
- Repeated navigation, dates, credits, metadata, and control labels: at least
  `0.875rem` / 14px.
- Mobile navigation and gallery controls: at least 44px high.
- Section headings use `--type-section` and remain at or below 72px at the
  1440px reference viewport.
- Only the Hero identity may use `--type-display`.
- Do not create hierarchy by pairing a 90–110px heading with 9–11px metadata.

### Fluid type rules

- Anchor every `clamp()` in `rem`; viewport units may only interpolate between
  the accessible floor and ceiling.
- Preserve browser zoom and user default-font influence.
- Keep Chinese/Japanese body line-height around `1.7–1.9`.
- Control line length with width and composition, never by shrinking body text.
- Use weight, grouping, image scale, and contrast before adding another size.

---

## Layout and Reflow Contract

- `--page-max`, `--page-gutter`, `--section-space`, and
  `--section-space-compact` define the shared page rhythm.
- The portrait mobile Hero is a stable `100svh` scene. It must not use a fixed
  `rem` height that exposes the following section on tall phones or creates an
  oversized first scene on short phones.
- The landscape Hero artwork uses mobile art direction: one contained
  high-density foreground over an existing generated-thumbnail ambience. A
  portrait-specific `<picture>` source is preferred only after a deliberate,
  verified alternate crop exists.
- Source/DOM order remains the reading and keyboard order at every viewport.
- Essential headings, paragraphs, links, credits, dates, and actions wrap
  without horizontal clipping at 320px.
- The document remains usable with a 200% root/user text preference.
- Horizontal scrolling is allowed only inside an explicit control such as the
  header navigation or gallery thumbnail rail; it must not widen the document.
- The fixed header uses `--header-offset`; every section/anchor scroll margin and
  document scroll padding must account for it.
- Sticky narrative elements release before the following section.
- Do not make every content item a viewport-height scene. Full-viewport pacing
  must be justified by the actual narrative, not by a desire to look cinematic.

---

## Gallery and Lightbox Contract

The KAF visual archive uses one focal stage and one selectable thumbnail rail.
It must not regress to eight equally weighted irregular cards.

### Inline gallery

- Render exactly one active stage image.
- Preserve the active artwork's intrinsic aspect ratio with `object-fit: contain`.
- Thumbnails may use a consistent crop with `object-fit: cover`.
- Keep thumbnail controls in source order with `aria-pressed` and explicit
  image-title names.
- Minimum thumbnail/control target height is 44px.
- Selecting a thumbnail updates stage image, title, selected state, and lightbox
  starting index. Attribution itself remains in the bottom source index rather
  than beside the stage.
- Only opacity and transform animate during active-image changes.
- A media-derived backdrop may crossfade; blur remains static rather than being
  animated per frame.

### Lightbox boundary

- Use `yet-another-react-lightbox` for portal, focus, keyboard, Escape, swipe,
  no-scroll, and finite-carousel behavior. Do not reimplement those concerns.
- Keep the package behind `GalleryLightbox.tsx` and load it with `React.lazy` so
  the lightbox JavaScript/CSS ships as a separate chunk.
- The section owns product state (`activeIndex`, open/closed) and visual
  composition. The dependency owns dialog mechanics only.
- Supply intrinsic width/height and alt text for every lightbox slide.
- Supply the high-density derivative as the lightbox slide source and enable the
  bundled Zoom plugin through the same lazy adapter.
- Keep inline selection synchronized through `on.view`.
- Localize visible/accessibility controls for the page language.

### Dependency constraints

- Do not add a masonry/rows package when the required design is one focal image.
- Do not add another animation runtime, icon library, or design-system package
  for this gallery.
- A different lightbox requires evidence that the current package cannot meet a
  concrete accessibility, format, or performance contract.

---

## Motion and Scrolling Contract

- Keep native document scrolling and semantic anchors.
- Reuse Motion for keyed, low-frequency state transitions.
- Use native IntersectionObserver for fixed-header page-location state.
- Use `scrollama` as the single Journey-specific step-observation boundary; it
  owns IntersectionObserver/ResizeObserver setup and teardown for that section.
- Never send per-frame scroll values through React state.
- Animate transform and opacity by default.
- `useScroll` / `useTransform` requires a genuine continuous-progress product
  requirement; it is not a general “premium” effect.
- The factual profile remains normal document flow and does not activate from
  scroll position.
- Journey follows six semantic document-flow steps. Downward/upward native
  scrolling activates the corresponding sticky-stage image without intercepting
  browser scroll.
- Journey renders one active image only. Do not restore an overlapping
  secondary image or keep previous/current/next image layers alive.
- Wide layouts use a side-by-side sticky stage. Compact layouts use a top sticky
  full-bleed media dock flush with the fixed header and opaque story surfaces
  below it.
- Compact stage sizing uses stable `svh`; its Scrollama activation line uses a
  pixel offset derived from measured header + stage geometry. A local
  ResizeObserver may refresh that geometry for font/layout changes. Do not use
  a generic percentage, continuously recalculate from `visualViewport`, or
  animate stage geometry.
- The compact header/stage seam is <=1px, the dock has no floating-card shadow
  or side gutter, portrait layouts leave >=180px of viewport reading space, and
  short landscape leaves >=120px.
- Short landscape layouts reduce the stage height and must leave readable space
  below it.
- Respect `MotionConfig reducedMotion="user"`; all chapters, images, sources,
  gallery controls, and lightbox actions remain available without motion.
- In reduced motion, omit the changing Journey stage and render one full image
  inside every chapter article.

Do not add Lenis, GSAP/ScrollTrigger, another Scrollama wrapper, or a second
animation runtime while the current Scrollama + Motion split satisfies the
requirement.

---

## Required Validation

For visual, gallery, responsive, or motion changes:

```bash
mise run check
mise run e2e
```

The browser suite must cover:

- 320×568, 360×640, 360×800, 390×844, 430×932, 768×1024,
  844×390, 1024×768, and 1440×900;
- document overflow and essential-content bounding boxes;
- 200% root text reflow;
- 14px recurring-text and 16px body floors;
- section-heading ceiling;
- dark-system contrast roles and primary-action contrast;
- fixed-header worst-case contrast and five `aria-current` locations;
- stable mobile Hero viewport coverage, no next-section exposure, contained
  foreground/ambient-thumbnail roles, and short-screen content fit;
- factual profile layout with no sticky/observer state;
- six Journey steps, downward/upward activation, sticky release before Works,
  one active image, full-bleed compact media dock, <=1px header seam, measured
  pixel-offset geometry, portrait/short-landscape reading space, and six-image
  reduced-motion flow;
- eight source-ordered gallery selectors;
- active gallery selection, lightbox open, keyboard navigation, and Escape close;
- intrinsic media sizing and one eager/high-priority Hero image.
- DPR 1 / DPR 2 Hero source selection, Gallery thumbnail roles, consolidated
  bottom attribution, and lightbox Zoom.

Also inspect the diff for:

- accidental content URL, media, dimension, or provenance changes;
- reintroduced eyebrow/template copy;
- extra runtime dependencies;
- `useScroll`, `useTransform`, high-frequency listeners, or unbounded
  `will-change` without measured need.

---

## Common Mistakes

- Changing a generic light template into a generic dark template while keeping
  the same eyebrows, filler prose, cards, and numbering.
- Solving a long/heavy page by adding smooth scrolling instead of removing
  viewport-sized tracks and continuous animation work.
- Reusing the Journey sticky-scroll treatment in the factual Profile or another
  adjacent section.
- Adding small original-title/change-label rows around an era title when the
  factual paragraph already provides the necessary context.
- Treating eight images as eight independent cards when the product needs one
  focal visual path.
- Hiding overflow and assuming responsive layout is safe; essential content can
  still be clipped while document scroll width reports no overflow.
- Using dynamic viewport units for a sticky mobile stage so browser toolbar
  changes move the trigger line while the reader scrolls.
- Using a fixed `48rem` or similar mobile Hero height instead of the stable
  visible viewport.
- Stretching a landscape Hero through a portrait `cover` box and assuming
  `object-position` restores the discarded composition.
- Sending Scrollama progress callbacks through React state when only discrete
  step-entry changes are needed.
- Writing a custom modal/lightbox despite an installed, tested open-source
  dialog/gesture implementation.
