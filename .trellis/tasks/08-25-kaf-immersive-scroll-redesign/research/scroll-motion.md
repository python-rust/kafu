# Scroll and motion research

## Research objective

Select a robust scroll-story implementation that fits the current React stack, preserves native scrolling, and degrades correctly for mobile and reduced motion.

Research date: 2026-08-25.

## Primary source

Motion for React scroll animation documentation:

- https://motion.dev/docs/react-scroll-animations

The official documentation distinguishes:

- **scroll-triggered** animation for entering/leaving the viewport (`whileInView`, `useInView`);
- **scroll-linked** animation for values tied to scroll position (`useScroll`, `useTransform`).

It also documents target-relative progress, progress indicators, parallax, sticky horizontal examples, and native `ScrollTimeline` acceleration where available.

Accessibility references:

- https://motion.dev/docs/react-accessibility
- https://motion.dev/docs/react-use-reduced-motion
- https://motion.dev/docs/react-motion-config

## Decision

Use the existing `motion` dependency. Do not add GSAP, ScrollTrigger, Lenis, or another smooth-scroll/animation runtime.

### Desktop journey

- Native document scroll.
- Sticky visual stage inside a tall journey container.
- One target-relative `useScroll` progress source.
- `useTransform` for progress, restrained transforms/opacity, and chapter atmosphere.
- `useInView` or IntersectionObserver thresholds for discrete active-chapter semantics.
- No wheel/touch interception and no required scroll snap.

### Mobile and reduced motion

- Linear chapter sequence.
- Optional low-distance in-view reveal when allowed.
- No long pinned section.
- No content hidden behind animation state.

## Performance rules

- Animate transform and opacity first.
- Do not animate large full-screen blur/backdrop-filter layers.
- Avoid high-frequency React state updates.
- Keep image layer count bounded; only nearby chapter imagery should be decoded/painted aggressively.
- Give images intrinsic dimensions and lazy-load below the fold.

## Acceptance evidence

The integration task must verify:

- normal wheel/trackpad/touch scrolling remains intact;
- active chapter changes at predictable thresholds;
- no horizontal overflow;
- reduced-motion content completeness;
- mobile does not trap the user in a pinned section;
- no severe layout shift or obvious frame drops in the target browser matrix.
