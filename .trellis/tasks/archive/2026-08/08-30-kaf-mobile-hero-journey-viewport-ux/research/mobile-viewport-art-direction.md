# Research: mobile viewport, Hero art direction, and sticky scrollytelling

## Primary references

### MDN responsive images

- `https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images`
- Separates resolution switching from art direction. A portrait-specific source
  should use `<picture>` when a deliberate alternative crop exists.

### MDN / web.dev image fitting

- `https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit`
- `https://web.dev/learn/design/responsive-images`
- `cover` necessarily removes parts of an image when aspect ratios differ;
  `contain` preserves the complete artwork and leaves unused space.

### MDN viewport units

- `https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length`
- `svh` is stable and corresponds to the small viewport. `dvh` follows dynamic
  browser UI and can resize during scrolling, which can degrade UX.

### Scrollama

- `https://github.com/russellsamora/scrollama`
- Provides CSS-sticky side/overlay patterns, ResizeObserver integration, and a
  mobile pattern that uses pixel offsets to avoid direction-change jumps.

### Responsive layout

- `https://web.dev/articles/responsive-web-design-basics`
- Mobile adaptation is a layout and interaction problem, not a fixed list of
  device widths.

## Local evidence

Measured in Chromium with mobile/touch emulation:

```text
390×844 Hero height: 768px
390×844 next section top: 768px
390×844 Journey header bottom: 109px
390×844 Journey stage top: 116px
390×844 visible seam: 7px
```

The same 7px Journey seam appears across portrait phones because it is defined
by `+0.5rem`. The Hero exposure grows with device height because of the fixed
`48rem` override.

## Decision

Use existing generated media for layout-level art direction now; reserve
`<picture>` for a future reviewed portrait source. Use `100svh` for stable
initial viewport coverage. Keep Scrollama, but align its compact trigger to the
actual rendered header + media-dock boundary rather than a generic percentage.
A scoped ResizeObserver refreshes that geometry for real layout/font changes;
no visual-viewport toolbar listener is used.

## Post-implementation evidence

- Every tested portrait Hero exactly matched the initial visual viewport and
  placed `#about` at that boundary.
- Portrait foreground used `contain`; the generated thumbnail ambience was
  visible and document overflow remained zero.
- Header-stage gap measured 0px at 320×568, 360×640, 360×800, 390×844,
  430×932, 768×1024, and 844×390.
- Remaining viewport below the dock ranged from 235px on the shortest portrait
  phone to 623px on portrait tablet; short landscape retained 176px.

