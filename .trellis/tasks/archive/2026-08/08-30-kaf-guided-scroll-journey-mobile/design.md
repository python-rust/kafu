# Technical design

## Decision summary

Journey becomes a Scrollama-driven sticky-graphic story. React owns the active
chapter state, Scrollama owns viewport step detection/resize observation, Motion
owns the low-frequency image transition, and CSS owns sticky positioning and
responsive composition.

## Review rounds

### Round 1 — Interaction model

Considered:

1. Keep Radix Tabs and add automatic advance.
2. Horizontal swipe carousel.
3. GSAP ScrollTrigger pinned timeline.
4. Motion `useScroll` continuous progress mapping.
5. Scrollama step-driven sticky graphic.

Rejected 1 because it keeps the chronology click-centric. Rejected 2 because a
horizontal gesture is less discoverable for a vertically scrolling page and
does not naturally support reversing chronology. Rejected 3 because it is a
large animation/runtime expansion for a discrete six-state story and mobile pin
behavior needs more tuning. Rejected 4 because the product needs discrete era
activation rather than frame-by-frame interpolation. Selected 5 because it
matches the narrative state model and preserves native scroll.

### Round 2 — Mobile pattern

Considered:

1. Disable sticky behavior and show six full cards.
2. Put text directly over a full-screen image.
3. Sticky top image with opaque in-flow story surfaces.

Rejected 1 for normal-motion users because it removes the guided visual
continuity requested by the user. Rejected 2 because busy artwork creates
unpredictable contrast and long Chinese paragraphs would obscure the image.
Selected 3: a compact sticky image remains visible while solid story surfaces
move through the lower reading area.

### Round 3 — Package boundary

Compared direct Scrollama, `react-scrollama`, another Scrollama wrapper, and a
local IntersectionObserver implementation. Direct Scrollama is selected because
it is the canonical package, ships TypeScript definitions, has built-in
ResizeObserver support, exposes `destroy()`, and documents a mobile pixel-offset
pattern. The popular React wrapper currently has an open maintainer request;
another wrapper describes itself as early-stage. A local observer would recreate
the exact behavior the user asked us not to hand-build.

## Component contract

```ts
interface JourneyChapter {
  id: string;
  period: string;
  yearLabel: string;
  titleZh: string;
  summary: readonly string[];
  theme: JourneyTheme;
  milestones: readonly JourneyMilestone[];
  primaryVisual: JourneyVisual;
}
```

`secondaryVisual` is removed from the Journey contract. Existing media records
remain available to Gallery/Works; only the chronology collage is removed.

## Render structure

```text
section#journey
└── inner
    ├── SectionHeading
    └── scrolly
        ├── sticky stage
        │   ├── one keyed ResponsiveArtwork
        │   ├── active year/title
        │   └── six-segment progress indicator
        └── ordered step list
            └── article[data-journey-step] × 6
                ├── year + h3
                ├── factual paragraphs
                └── milestones + source links
```

The sticky stage is visual context. The ordered articles are authoritative
content and remain the screen-reader/document order.

## Scrollama lifecycle

1. Collect actual step elements from a section ref.
2. Create one `scrollama()` instance.
3. Configure:
   - wide layout: numeric `0.52` offset;
   - compact layout: fixed pixel offset derived from the initial stable layout
     viewport, approximately 72% of `window.innerHeight`.
4. `onStepEnter` validates the index and updates active index/direction only
   when the chapter changes.
5. Listen to the compact-layout media query and `orientationchange`; update the
   offset through Scrollama's runtime `offset()` method and call `resize()`.
6. Destroy Scrollama and remove listeners on cleanup.

Do not subscribe to `scroll`, `wheel`, touchmove, or visual-viewport resize.

## Responsive geometry

### Wide (`>= 64rem`)

- Two-column grid.
- Stage is sticky below the fixed header and approximately 64 `svh` high.
- Steps are at least approximately 68 `svh`, but natural content may be taller.
- Active state uses accent border/opacity; all text remains readable.

### Compact portrait (`< 64rem`)

- One-column story.
- Stage is sticky under the header, approximately 42–45 `svh` high.
- Steps have an opaque warm-dark surface and scroll through the remaining
  reading area.
- The first step begins after the stage's normal-flow footprint; later steps
  retain enough vertical separation for deterministic Scrollama triggers.

### Short landscape

- Stage height is reduced to approximately 34–38 `svh`.
- Stage metadata and progress spacing tighten without dropping content.
- Steps remain naturally taller than their text rather than using full-screen
  snap panels.

### Reduced motion

- Hide the sticky changing stage.
- Render each chapter's primary visual once inside its own article.
- Disable state-transition animation; Scrollama is unnecessary in this mode.

## Motion

- Key by chapter id.
- Enter: opacity 0 → 1 and scale 1.012 → 1.
- Exit: opacity 1 → 0 and scale 1 → 0.995.
- Metadata uses a short opacity/y transition.
- No scroll-linked MotionValue, parallax, blur animation, or continuous React
  updates.

## Mobile-wide audit

Browser tests cover:

- 320×800, 360×800, 390×844, 430×932;
- 844×390 short landscape;
- 768×1024, 1024×768, 1440×900;
- 640×900 with 200% root text;
- reduced motion at desktop and mobile.

For every viewport:

- document scroll width;
- essential text/control bounds, excluding deliberate internal horizontal rails;
- fixed-nav target size;
- Journey sticky top/height and visible reading area;
- one Journey stage image and no secondary visual;
- final step activation and reverse activation.

## Dependency plan

```text
- @radix-ui/react-tabs 1.1.21
+ scrollama 3.2.0
```

No other package or asset changes are expected.
