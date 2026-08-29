# Visual System Guidelines

> Executable visual, typography, layout, and motion contracts for the KAF
> frontend.

---

## Scope

Read this file before changing homepage colors, typography, spacing, responsive
composition, sticky behavior, or animation. The current product goal is a KAF-led
editorial experience, not a generic technology-product landing page.

The shared implementation owners are:

- `src/styles/tokens.css` — semantic palette, type roles, spacing, radii, and
  motion constants;
- `src/styles/base.css` — document-level background, text defaults, focus, and
  selection;
- `src/pages/HomePage/sections/*.module.css` — section-specific composition that
  consumes the global roles;
- the owning section component — only when real behavior/state is required.

Do not add a generic component/design-system directory until more than one route
or independent owner needs the same component behavior.

---

## KAF Palette Contract

Use the semantic roles already defined in `src/styles/tokens.css`:

```css
--color-paper;
--color-paper-soft;
--color-paper-deep;
--color-paper-clean;
--color-ink;
--color-ink-soft;
--color-ink-faint;
--color-kaf;
--color-kaf-deep;
--color-kaf-soft;
--color-blue;
--color-blue-deep;
--color-lavender;
--color-violet;
--color-night;
--color-night-soft;
--color-night-text;
--color-night-muted;
```

### Required behavior

- Paper/fog neutrals are the default page foundation.
- `--color-kaf` / `--color-kaf-deep` are the primary identity signal.
- Blue and lilac are supporting atmosphere, not competing primary accents.
- Night surfaces are reserved for deliberate contrast bands or image stages;
  they are not the default for every section.
- Licensed KAF imagery should provide most of the visual richness. Gradients may
  support an image or surface, but must not recreate a repeated neon dashboard.
- Borders, muted text, captions, and focus states must use semantic tokens rather
  than new per-section hex values unless a chapter-specific accent has a real
  content meaning.

### Wrong vs correct

```css
/* Wrong: every section invents another cyber/neon palette. */
.section {
  --cyan: #64e2f5;
  --magenta: #f451a5;
  background: radial-gradient(circle, #7b61ff55, #060711 60%);
}

/* Correct: shared brand roles, local composition. */
.section {
  background: var(--color-paper-soft);
  color: var(--color-ink);
}

.eyebrow {
  color: var(--color-kaf-deep);
}
```

---

## Typography Contract

Use the shared type roles:

```css
--type-label;
--type-body-small;
--type-body;
--type-lead;
--type-card-title;
--type-section;
--type-display;
```

### Floors and ceilings

- Normal body copy: at least `1rem`.
- Repeated labels, nav text, credits, dates, and metadata: at least `0.75rem`.
- Primary mobile navigation target: at least `2.75rem` (44px) high.
- Section headings use `--type-section`; do not introduce a section-local
  viewport-only heading that can exceed the shared ceiling.
- Only the page identity/Hero may use `--type-display`.

### Fluid type rules

- Anchor every `clamp()` in `rem`/`em`; viewport units may be a modest middle
  adjustment, never the only font-size input.
- Preserve browser zoom and user default font-size influence.
- Keep Chinese/Japanese body line-height around `1.7–1.9`; display text may be
  tighter but must not clip glyphs.
- Keep readable line lengths with `max-width` rather than shrinking body text to
  fit wide tracks.

```css
/* Wrong: viewport owns the full value and zoom influence is weak. */
.heading {
  font-size: 7.5vw;
}

/* Correct: rem floor/ceiling with a bounded viewport interpolation. */
.heading {
  font-size: var(--type-section);
}
```

---

## Layout and Reflow Contract

- `--page-max`, `--page-gutter`, `--section-space`, and
  `--section-space-compact` are the shared page rhythm.
- Editorial variation comes from grid composition, image ratio, and controlled
  contrast—not independent section spacing scales.
- Narrow layouts must preserve DOM/source order; do not use CSS ordering that
  changes reading or keyboard order.
- Essential headings, paragraphs, links, captions, dates, and credits must wrap
  without horizontal clipping at 320px.
- The page must remain usable with a 200% root/user text preference. Horizontal
  scrolling is acceptable only inside explicitly designed controls such as the
  mobile header navigation, not for the document itself.
- Sticky elements must release before the following section and must not require
  every content item to occupy a full viewport unless the product specifically
  depends on that pacing.

Current browser assertions live in `tests/e2e/home.spec.ts` and cover:

- 320, 360, 390, 768, 1024, and 1440px viewport widths;
- document overflow plus essential-content bounding boxes;
- 200% root text reflow;
- mobile 44px navigation targets;
- sticky-stage activation/release.

---

## Motion and Scrolling Contract

### Default mechanism

- Keep native document scrolling and semantic anchors.
- Reuse the installed Motion package only when CSS alone does not express the
  required state transition clearly.
- Use component-local state and native IntersectionObserver for low-frequency
  active-section/chapter transitions.
- Never send per-frame scroll values through React state.

### Animation budget

- Animate `transform` and `opacity` by default.
- Do not animate layout or paint-heavy properties without measured evidence and
  a browser performance review.
- Scroll-linked `useScroll`/`useTransform` is reserved for a requirement that
  genuinely depends on continuous progress (for example, a progress meter or
  necessary parallax). It must not be used merely to make a section feel
  “premium.”
- A sticky narrative stage should normally render one active visual and change
  only when the observer's active item changes. Avoid simultaneous previous /
  current / next layers unless a tested transition requires them.
- Respect `MotionConfig reducedMotion="user"` and provide complete in-flow
  content when motion/sticky presentation is disabled.

### Dependency escalation

Do not add Lenis, GSAP, another smooth-scroll wrapper, or another animation
runtime until all of the following are documented:

1. a measured defect that native scrolling + Motion cannot solve;
2. the exact behavior contract and supported input devices;
3. accessibility/reduced-motion/anchor implications;
4. bundle and browser-test impact;
5. why reducing content height or animation work is insufficient.

### Wrong vs correct

```tsx
// Wrong for chapter switching: continuous progress drives several layers.
const { scrollYProgress } = useScroll({ target: trackRef });
const opacity = useTransform(scrollYProgress, ranges, values);

// Correct: observer changes one semantic active chapter at low frequency.
const [activeIndex, setActiveIndex] = useState(0);

<AnimatePresence initial={false}>
  <motion.figure key={chapters[activeIndex].id}>
    {/* one active visual */}
  </motion.figure>
</AnimatePresence>;
```

---

## Required Validation

For visual, layout, or motion changes:

```bash
mise run check
mise run e2e
```

Also verify in the diff:

- `package.json` / lockfile did not change unless dependency escalation was
  explicitly approved;
- no content URL, media file, provenance record, or intrinsic dimensions changed
  accidentally;
- no `useScroll`, `useTransform`, high-frequency listener, or unbounded
  `will-change` was introduced without a real continuous-progress requirement;
- reduced-motion users receive all content and semantic anchors;
- computed body/nav/section sizes still satisfy the tested hierarchy contract.

## Common Mistakes

- Solving a long/heavy page by adding smooth scrolling instead of reducing
  viewport-sized tracks and continuous animation work.
- Making hierarchy through a 100px heading and a 10px label rather than through
  spacing, weight, line length, imagery, and contrast.
- Treating every section as an independent “hero,” which produces repeated
  gradients, giant titles, and inconsistent rhythm.
- Hiding overflow on a section and assuming the responsive layout is safe; the
  document can report no overflow while essential text is still clipped.
