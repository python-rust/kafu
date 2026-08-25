# Design — KAF six-stage scroll journey

## 1. Component boundary

Expected additive files:

```text
src/pages/HomePage/sections/JourneySection.tsx
src/pages/HomePage/sections/JourneySection.module.css
src/pages/HomePage/sections/journey/**     # only for independently testable lifecycle/mapping complexity
tests/JourneySection.test.tsx
```

The branch must not create a demo route or edit final page composition. Fixtures belong in the focused test or a journey-local test fixture.

## 2. Prop contract

Use a narrow local structural contract equivalent to:

```ts
interface JourneyVisual {
  src: string;
  alt: string;
  width: number;
  height: number;
  credit: string;
  sourceUrl: string;
  objectPosition?: string;
}

interface JourneyMilestone {
  date: string;
  label: string;
  sourceUrl: string;
}

interface JourneyChapter {
  id: string;
  period: string;
  yearLabel: string;
  titleJa: string;
  titleEn: string;
  summary: string;
  theme: string;
  milestones: readonly JourneyMilestone[];
  primaryVisual: JourneyVisual;
  secondaryVisual?: JourneyVisual;
}

interface JourneySectionProps {
  chapters: readonly JourneyChapter[];
}
```

Do not export a broad global domain model from this presentation module. Structural typing lets integration pass the richer content records.

## 3. DOM and accessibility architecture

Recommended hierarchy:

```text
section#journey
├── section heading / introduction
├── progress navigation (ordered sequence)
├── desktop visual stage
└── chapter article list
    └── article#chapter-...
        ├── period + h3
        ├── summary
        ├── milestone list with source links
        └── media credit/source
```

All semantic chapter text exists once in DOM order. Desktop visual duplicates used only for choreography are decorative or have their inactive copies excluded from the accessibility tree. Do not announce active-chapter changes continuously unless user testing proves a live region is useful; visual progress is not an urgent status update.

## 4. Desktop choreography

### Scroll source

Use one section/container ref:

```ts
const { scrollYProgress } = useScroll({
  target: journeyRef,
  offset: ['start start', 'end end'],
});
```

Exact offsets may change after browser testing. Avoid independent document scroll listeners.

### Progress and transforms

- Map journey progress to a progress rail/number with Motion values.
- Divide normalized progress into six stable ranges.
- Crossfade primary visual layers around range boundaries, keeping the current/adjacent layers mounted as needed without decoding an unbounded stack aggressively.
- Use small bounded translate/scale/crop changes to express movement between chapters.
- Use chapter trigger refs/`useInView` for discrete active chapter state and data attributes.

Do not store raw `scrollYProgress` in React state.

### Sticky geometry

- Sticky stage stays inside the journey section and releases naturally at its end.
- Chapter trigger blocks provide real document height and readable copy.
- Use `svh`/`dvh` carefully with fallback; avoid hard-coding a single screen height.
- Enable sticky mode only when both width and height are sufficient.

## 5. Theme contract

Map the chapter's semantic theme to local custom properties on the journey root/stage:

```css
--journey-accent;
--journey-accent-secondary;
--journey-surface;
--journey-line;
```

The component may define local fallback values, but it must not mutate global document tokens. Wave 2 can tune mappings against the approved assets.

## 6. Mobile/linear mode

- Every chapter becomes a normal article with visible image, text, milestones, and credit.
- Remove sticky positioning and overlapping image layers.
- Preserve intentional image aspect ratios and configurable object position.
- Optional entry reveals use low-distance opacity/transform only and must settle to the visible state immediately under reduced motion.

## 7. Reduced motion

Use `useReducedMotion` for structural choreography decisions when CSS alone is insufficient. A reduced-motion user receives:

- normal document order;
- no parallax or large translation;
- no long pinned crossfade sequence;
- immediate active styling;
- all source links and images visible.

`MotionConfig reducedMotion="user"` may be supplied by integration; the component must still be safe when rendered alone in tests.

## 8. Performance design

- Transform/opacity first.
- No continuously animated blur/filter/backdrop-filter.
- No RAF loop or high-frequency event listener.
- Use `loading="lazy"` below the fold and explicit dimensions.
- Avoid `will-change` everywhere; add it only to a measured small layer set.
- Keep layout reads out of animation callbacks.

## 9. Focused test strategy

Use Testing Library to verify:

- section/heading and exactly six chapter headings;
- milestone/source and credit links;
- image alt/dimensions/loading attributes;
- deterministic linear DOM order;
- reduced-motion path keeps all content present;
- no requirement for scroll-event timing to render content.

Do not assert precise pixel transforms or animation durations. Browser choreography is finalized by Wave 2 Playwright/manual evidence.

## 10. Rollback

This task is additive. Revert its section/helper/test files without touching current route composition, content, assets, or global styles.
