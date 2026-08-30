# Responsive scrollytelling research

Research date: 2026-08-30

## Primary sources

### Scrollama

- Repository: `https://github.com/russellsamora/scrollama`
- Current package: `3.2.0`, MIT, bundled TypeScript declarations.
- Uses IntersectionObserver for step entry/exit rather than application-level
  element-position polling. The installed source retains one lightweight
  document-scroll position read internally to infer `up` / `down` direction.
- Version 3 includes built-in ResizeObserver handling.
- Official examples include sticky side-by-side, sticky overlay, custom offset,
  and a mobile pattern.
- The mobile example recommends a pixel offset rather than a percentage to avoid
  jumps when scrolling direction changes.
- `destroy()` disconnects observers and resets callbacks.
- The README warns against legacy `vh` because mobile browser chrome can resize
  it while scrolling.

Reviewing the installed 3.2.0 source also exposed a stale declaration-file
boundary:

- runtime `parseOffset` accepts pixel strings such as `"608px"`;
- the runtime update API is `offset(value)`;
- the bundled `index.d.ts` still describes an obsolete `offsetTrigger` method
  and does not model the pixel-string setup value.

The integration therefore uses a narrow local runtime interface based on the
installed source and browser behavior instead of adding `any` or depending on a
React wrapper.

Decision: selected. Use stable `svh` layout units and a pixel trigger offset on
compact layouts.

### The Pudding / Scrollama introduction

- `https://pudding.cool/process/introducing-scrollama/`
- Defines the sticky graphic pattern as a visual that remains in view while
  narrative steps trigger state changes.
- Emphasizes that scrollytelling monitors normal scrolling rather than changing
  browser scroll mechanics.

Decision: use the side-by-side pattern on wide screens and a compact sticky-top
variant on mobile.

### Motion

- `https://motion.dev/docs/react-scroll-animations`
- Distinguishes scroll-triggered discrete changes from scroll-linked continuous
  animations.
- Existing Motion can animate state changes through opacity/transform.

Decision: Scrollama chooses the active era; Motion only renders the transition.
Do not add `useScroll`/continuous progress because six eras are discrete states.

### GSAP ScrollTrigger

- `https://gsap.com/docs/v3/Plugins/ScrollTrigger/`
- Provides pin, scrub, snap, and arbitrary scroll animation timelines.

Decision: not selected. It is substantially broader than the required step
activation, would duplicate Motion, and mobile pinning/refresh introduces more
surface than this static chronology needs.

### React wrappers

- `react-scrollama` currently supports React 19 at the peer-dependency level,
  but its repository has an open call for maintainers and no package test suite.
- Another Scrollama wrapper describes itself as early-stage with incomplete
  functionality.

Decision: do not add a wrapper. Keep direct Scrollama behind one section-owned
effect with explicit cleanup.

### Responsive layout and mobile viewports

- `https://web.dev/articles/responsive-web-design-basics`
  - Content must fit the viewport; overflowing media/fixed widths create poor
    mobile behavior.
- `https://web.dev/blog/viewport-units`
  - Mobile browser toolbars make legacy viewport sizing unreliable; small,
    large, and dynamic viewport units solve different needs.
- `https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/CSSOM_view/Viewport_concepts`
  - Layout and visual viewports differ on mobile and during zoom/keyboards.

Decision: use `svh` for stable sticky-story dimensions, avoid `dvh` resizing
during scroll, and test portrait plus short landscape.

### Reduced motion

- `https://www.w3.org/WAI/WCAG22/Techniques/css/C39`
- `https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion`

Decision: reduced-motion mode presents all six images and text in normal flow;
it does not rely on a changing sticky visual.

## Review conclusion

The best fit is not a carousel, tab interface, full ScrollTrigger timeline, or
custom observer. It is native vertical scrolling plus Scrollama step activation,
one sticky image, factual in-flow chapters, Motion crossfades, and a mobile pixel
trigger offset. This restores guided chronology while preserving performance,
reverse scrolling, accessibility, and maintainable ownership.
