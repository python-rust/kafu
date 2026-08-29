# Technical design

## Change boundary

The smallest behavior gap is not “missing smooth scrolling”; it is an
over-scaled visual hierarchy plus a Journey implementation that performs
continuous scroll-linked animation across long viewport-sized tracks.

The behavior lives in two existing ownership layers:

- `src/styles/` owns shared palette, typography, spacing, focus, and document
  defaults.
- `src/pages/HomePage/sections/` owns section composition, responsive layout,
  and the Journey observer/sticky-stage behavior.

This task will not add a component library, global state, remote data, new media,
or a second animation runtime.

## Visual-system architecture

### Global semantic tokens

`src/styles/tokens.css` remains the single source for shared roles:

- neutral surfaces: paper, paper-soft, paper-deep, ink, ink-muted;
- KAF accents: pink, pink-deep, mist-blue, lilac;
- one night surface for contrast sections;
- shared type scale (`--type-label`, `--type-body`, `--type-lead`,
  `--type-section`, `--type-display`);
- shared page width, gutter, section spacing, border, radius, and motion timing.

Section CSS may alias those roles locally, but must not redefine a new palette.

### Section rhythm

- Header: sticky paper-glass utility bar, with readable labels and native anchor
  navigation.
- Hero: light image-led split composition; identity and statement are readable
  without the image, while the image remains the dominant visual.
- Journey: soft neutral surface, compact timeline navigation, sticky visual on
  desktop, linear media on small/reduced-motion layouts.
- Works: paper section, one editorial feature plus compact supporting-card grid.
- Gallery: blush/fog section with controlled two-column/asymmetric image rhythm.
- Official links + footer: night contrast band, using pink/blue only as signals.

## Journey interaction design

### State and observer

Retain component-local `activeIndex` and one IntersectionObserver. Each semantic
chapter article remains the observed target and anchor owner.

The observer selects an intersecting chapter near the viewport center and
updates `activeIndex` only when the chapter changes. No scroll position is stored
in React and no per-frame callback updates React state.

### Sticky stage

The desktop stage renders only the active chapter visual. A keyed Motion figure
crossfades/scales on active-chapter changes. The stage metadata and progress
indicator update on the same low-frequency state transition.

Only `opacity` and `transform` animate. The stage is absent when reduced motion
is requested; every chapter's in-flow media remains in the DOM and becomes the
visible source of truth in that mode.

### Track sizing

Desktop chapter items use a moderate minimum block size rather than an 82svh
minimum. The sticky stage remains shorter than the viewport. This preserves the
guided chronology while reducing page length and the amount of simultaneous
visual work.

## Responsive and accessibility design

- Type values are `rem`-anchored `clamp()` expressions; viewport units are a
  small interpolation term, never the only input.
- Body/metadata roles have explicit floors; primary interactive text does not
  use decorative microtype.
- At narrow widths, all editorial grids become source-ordered single-column
  flows and essential captions/links wrap rather than clip.
- Header navigation remains horizontally scrollable where needed and every link
  retains a 44px minimum hit area.
- Existing `MotionConfig reducedMotion="user"`, focus outline, semantic markup,
  image dimensions, loading attributes, and source labels remain intact.

## Dependency and reuse decision

No dependency will be added. Motion already provides the low-frequency keyed
transition needed here, and native browser scrolling/IntersectionObserver already
provide the required interaction. A smooth-scroll wrapper would change native
behavior and add integration/accessibility risk without addressing the measured
causes: 17.4 screens of content, 9.6px navigation text, 100–108px section
headings, and continuous layered Journey transforms.

## Rollback shape

The change is isolated to homepage TSX/CSS, global visual tokens/base styles,
index theme color, tests, and the frontend spec. Content/media contracts remain
unchanged, so rollback is a normal revert of the visual/motion commit without a
data migration.
