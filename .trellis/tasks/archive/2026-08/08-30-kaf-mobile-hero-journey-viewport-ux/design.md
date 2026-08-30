# Technical design

## Review round 1 — mobile Hero image strategy

### Rejected: retain full-height `cover`

The source is landscape. At 390×844, filling the mobile Hero requires scaling
the image to the viewport height and showing only a narrow vertical slice. An
`object-position` adjustment can choose a different slice but cannot preserve
the composition.

### Deferred: create a new portrait crop and `<picture>` source

The `<picture>` element is the correct art-direction primitive when a reviewed
portrait asset exists. The repository currently has no verified portrait crop
of `邂逅`, and an arbitrary generated crop would still discard artwork. This can
be revisited when a deliberate mobile source is approved.

### Selected: ambient thumbnail + contained foreground

Reuse two existing derivative roles:

```text
thumbnail   -> static blurred ambient fill, decorative, lazy
display/4x  -> complete foreground artwork, eager/high priority
```

The foreground is contained in an upper visual zone while the copy remains in
the lower part of the same `100svh` Hero. This preserves the artwork, avoids a
new asset, and keeps resolution switching intact.

## Review round 2 — viewport-height strategy

### Rejected: `48rem`

A fixed length cannot represent phones whose visible heights range from roughly
568px to more than 930px.

### Rejected: primary `100dvh`

Dynamic viewport units follow browser chrome. Resizing a full-screen Hero or
sticky media stage while the address bar expands/retracts can introduce visible
jumps during scrolling.

### Selected: stable `100svh`

The small viewport corresponds to the visible area when browser UI is expanded
and remains stable during ordinary scroll. A separate short-screen media query
compresses typography, image height, gaps, and action layout so content fits
small devices without changing the viewport contract.

## Review round 3 — Journey mobile composition

### Rejected: only change `top` from `+0.5rem` to `0`

This fixes the seam but preserves the floating inset card, generic trigger line,
and overly tall 44svh stage.

### Rejected: full-screen overlay cards

Scrollama's overlay pattern is visually strong, but opaque cards over a compact
phone image would obscure the artwork and complicate long milestone lists.

### Selected: full-bleed media dock + normal-flow story

On sub-desktop layouts:

- the stage spans the viewport width using the existing page gutter as a
  negative margin;
- it attaches to the fixed header edge;
- side borders and floating shadow are removed;
- stage height is `clamp(14rem, 38svh, 20rem)` in portrait layouts;
- text remains in normal flow below the dock;
- Scrollama's trigger is placed just below the rendered dock.

This preserves readable text while making the image feel integrated with the
viewport rather than floating over the page.

## Scrollama offset design

Wide side-by-side layouts keep a fractional offset near viewport center.

Compact layouts calculate once per actual layout refresh:

```text
desired offset = rendered header height
               + rendered stage height

bounded offset = clamp(minimum offset,
                       desired offset,
                       viewport height - bottom guard)
```

The result is passed to Scrollama as pixels. The chapter surface starts at the
dock edge and supplies its own internal padding. The offset updates when the
wide-layout/orientation query changes and when a local ResizeObserver detects a
real header/stage geometry change, such as 200% text. It does not follow every
visual-viewport toolbar resize.

## Component changes

### `HeroSection.tsx`

- Add one decorative `ResponsiveArtwork` thumbnail before the main Hero image.
- Keep the main image as the only eager/high-priority asset.

### `HeroSection.module.css`

- Desktop behavior remains full-bleed cover.
- Mobile uses `100svh`, ambient background, contained foreground, compact
  two-column actions, and a short-screen override.

### `JourneySection.tsx`

- Add a stage ref.
- Read actual header/stage geometry for the compact Scrollama offset.
- Observe occupied header/stage geometry so font and layout changes refresh the
  offset without a global resize/scroll listener.
- Keep existing direction-aware keyed Motion transitions and cleanup.

### `JourneySection.module.css`

- Define a mobile stage block-size variable.
- Make the stage full bleed and flush with the header.
- Remove mobile floating-card shadow/side border.
- Reduce and stabilize stage height.
- Keep short-landscape overrides.

## Accessibility and performance

- Decorative ambient image has empty alt text and `aria-hidden`.
- No content or interaction depends on the ambient layer.
- Exactly one Hero image is eager/high-priority.
- No high-frequency scroll listener is introduced.
- Scrollama cleanup remains mandatory.
- The local geometry ResizeObserver is disconnected on cleanup.
- Reduced motion removes the sticky stage and renders all chapter images.

## Final implementation review

- Hero portrait art direction is applied through 56rem portrait layouts,
  including 768×1024 tablets.
- The mobile Journey dock spans the viewport and attaches to the rendered
  header edge with a measured 0px seam.
- The generic 72% trigger was removed. Compact activation now uses the actual
  occupied header + stage block size and recalibrates under 200% text.
- No package, media, provenance, or content-data change was required.

