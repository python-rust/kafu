# Build KAF scroll journey

## Goal

Build the prop-driven six-stage journey that turns normal downward scrolling into a chronological KAF experience. Desktop should use a bounded sticky visual stage and scroll-linked chapter progression; mobile and reduced-motion users must receive the same content as a stable linear sequence.

This task owns journey behavior and journey-local presentation only. It must compile and test independently with fixtures, without importing the media/content branch or composing the homepage route.

## User Value

- Scrolling reveals distinct periods of KAF's development rather than a static list of sections.
- Year, imagery, theme, milestones, and progress change together in a comprehensible sequence.
- Native wheel, trackpad, touch, keyboard, and browser scroll behavior remain intact.
- Mobile, reduced-motion, and assistive-technology users can read every chapter without relying on choreography.

## Confirmed Facts

- `motion` is already installed and provides `useScroll`, `useTransform`, `useInView`/`whileInView`, and `useReducedMotion`.
- The current page has no scroll-triggered or scroll-linked journey behavior.
- The parent task fixes six chapter groups and a structural content contract, but the media/content branch is developed in parallel.
- High-frequency animation values must not be pushed through React state when Motion values/CSS can own them.
- `HomePage.tsx` and legacy `HomePage.module.css` are reserved for Wave 2 integration.

## Requirements

### R1 — Prop-driven journey contract

Create a `JourneySection` that accepts a readonly six-chapter array through narrow typed props. It must not import `src/content/kaf.ts`.

Each chapter prop must support:

- stable ID and anchor target;
- period/year label;
- Japanese and English title;
- concise summary;
- semantic theme ID;
- milestone labels/dates/source URLs;
- primary visual with src, alt, intrinsic dimensions, credit, and source URL;
- optional secondary visual.

Use local fixture data in focused tests so the branch is independently buildable.

### R2 — Semantic chapter structure

- Render one journey section with a stable `#journey` anchor and heading.
- Render all six chapters in chronological DOM order.
- Each chapter must expose its heading, period, summary, milestones, official source links, and media credit in semantic markup.
- A progress indicator must communicate sequence without making color the only cue.
- Avoid duplicate accessible text/media when desktop sticky layers mirror chapter content; inactive/decorative duplicates must not pollute the accessibility tree.

### R3 — Desktop scroll-linked behavior

On viewports where available width/height make it usable:

- preserve a normal tall document-flow journey container;
- keep a visual stage sticky only within that container;
- use one target-relative `useScroll` progress source for continuous journey progress;
- use `useTransform` for bounded opacity/translation/scale/progress changes;
- use `useInView`, IntersectionObserver, or equivalent discrete thresholds for active-chapter semantics;
- crossfade only a bounded number of nearby image layers;
- change chapter-local atmosphere through CSS custom properties/data attributes rather than global theme mutation.

Do not intercept `wheel`, `touchmove`, arrow keys, Page Up/Down, or space. Do not replace browser scrolling, force snap, or require a smooth-scroll runtime.

### R4 — Mobile and reduced-motion fallback

- At small/narrow viewports, render a normal linear chapter sequence with each visual adjacent to its copy.
- Do not make mobile users traverse a long pinned viewport.
- Under `prefers-reduced-motion: reduce`, disable parallax, long translations, pinned crossfade choreography, and non-essential reveals.
- All chapters and source links must remain present and understandable when Motion returns final/static states.
- A low-distance opacity reveal is optional only when it cannot hide content if JavaScript or observation does not run.

### R5 — Performance contract

- Prefer transform and opacity; avoid animated full-screen blur, backdrop-filter, shadows, or filter stacks.
- Do not run a perpetual particle/RAF loop.
- Do not create one global scroll listener per chapter.
- Keep React state changes to discrete active-chapter changes, not per-frame progress.
- Provide intrinsic image dimensions; below-the-fold chapter images default to intentional lazy loading.
- Do not add dependencies.

### R6 — Responsive and accessible behavior

- Component-level layout must remain free of horizontal overflow at 360px, 390px, 768px, 1024px, and 1440px.
- Heading hierarchy, links, focus indication, image alt text, credits, and reading order must remain coherent.
- Essential chapter information must not depend on hover, color, or active animation state.
- Sticky mode must have a conservative breakpoint and viewport-height guard; linear mode is the safe fallback.

### R7 — Exclusive file ownership

This task may edit only:

- `src/pages/HomePage/sections/JourneySection.tsx`;
- `src/pages/HomePage/sections/JourneySection.module.css`;
- narrowly scoped journey helper/hook modules colocated under `src/pages/HomePage/sections/journey/` only when complexity justifies them;
- uniquely named focused tests such as `tests/JourneySection.test.tsx`;
- this Trellis task's own artifacts.

It must not edit:

- `src/pages/HomePage/HomePage.tsx`;
- `src/pages/HomePage/HomePage.module.css`;
- `src/styles/**`;
- `src/content/**`;
- `src/assets/**`;
- header/hero, works/gallery/outbound/footer section files;
- existing integration/E2E tests.

## Acceptance Criteria

- [ ] **AC-01**: `JourneySection` renders exactly six fixture chapters in chronological semantic order through typed props and does not import future content modules.
- [ ] **AC-02**: Each chapter exposes period, titles, summary, milestones, official source links, primary visual metadata, and credit.
- [ ] **AC-03**: Desktop-capable mode uses a bounded sticky stage and one target-relative scroll progress source to change active year/visual/progress/atmosphere.
- [ ] **AC-04**: The component never intercepts native wheel/touch/keyboard scrolling and uses no forced scroll snap or smooth-scroll replacement.
- [ ] **AC-05**: Mobile mode is a stable linear sequence with no long pinned viewport.
- [ ] **AC-06**: Reduced-motion mode exposes all content without parallax, large translations, or required crossfade choreography.
- [ ] **AC-07**: Animation primarily uses transform/opacity, avoids high-frequency React state and large filter/blur animation, and adds no dependency.
- [ ] **AC-08**: Focused tests cover six-chapter rendering, semantic headings/links/media, linear fallback, and reduced-motion content completeness without brittle timing assertions.
- [ ] **AC-09**: Component CSS has no horizontal overflow at the supported viewport widths and essential behavior does not depend on hover.
- [ ] **AC-10**: Only files inside the documented ownership boundary are changed.
- [ ] **AC-11**: `mise run check` passes.

## Out of Scope

- Global tokens/base, header/hero, works/gallery/outbound/footer components.
- Factual content/media acquisition or attribution changes.
- Homepage route composition, legacy CSS removal, Playwright integration, or final visual tuning against approved assets.
- Audio/video, scroll-jacking, WebGL/3D, or a new animation library.

## Dependencies

None for Wave 1 implementation. Wave 2 will pass the approved media/content records and integrate final breakpoints/tokens.

## Blocking Open Questions

None.
