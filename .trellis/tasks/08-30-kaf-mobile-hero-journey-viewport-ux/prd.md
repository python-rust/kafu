# Polish mobile Hero and Journey viewport UX

## Goal

Make the mobile homepage feel deliberately composed rather than like a desktop
layout cropped into a phone. The Hero must occupy the initial visible viewport
without exposing the next section, preserve the complete `邂逅` artwork instead
of severely cropping it, and remain stable while mobile browser chrome changes.
The Journey media stage must attach directly to the fixed header, stop exposing
scrolling text through a gap, and update at the point where the next chapter
actually enters the readable area below the stage.

## Confirmed defects

Browser geometry was measured against the current production composition:

| Viewport | Hero height | Initial viewport | Next section exposure |
| --- | ---: | ---: | ---: |
| 320×568 | 768px | 568px | none, but Hero is 200px too tall |
| 360×640 | 768px | 640px | none, but Hero is 128px too tall |
| 360×800 | 768px | 800px | 32px exposed |
| 390×844 | 768px | 844px | 76px exposed |
| 430×932 | 768px | 932px | 164px exposed |

The mobile rule `min-height: 48rem` is therefore not a viewport contract. The
same landscape artwork is also forced through `object-fit: cover` into boxes as
tall as 390×768, which hides most of the original horizontal composition.

The mobile Journey stage currently uses:

```css
top: calc(var(--header-offset) + 0.5rem);
```

Measured at 390×844, the fixed header ends at 109px and the stage begins at
116px, leaving a visible 7px gap. The scrolling article beneath can be seen
through that gap. The current Scrollama mobile trigger is also fixed at roughly
72% of the viewport rather than being aligned to the bottom of the media stage.

## Product decisions

### Hero

- Use a stable small-viewport (`svh`) height for the initial mobile Hero. Do not
  use `dvh`, because dynamic viewport units resize while browser chrome expands
  and retracts during scrolling.
- Preserve the complete source artwork on portrait phones by using a contained
  foreground image rather than a full-height `cover` crop.
- Reuse the existing 480px generated thumbnail as a static ambient background
  layer behind the contained high-resolution foreground. No new or unverified
  image is required.
- Keep exactly one eager/high-priority Hero image. The ambient thumbnail remains
  decorative and lower priority.
- Keep the Hero copy and two direct actions inside the same initial viewport,
  with a compact short-screen layout.

### Journey

- Keep Scrollama-driven upward/downward chapter activation.
- On sub-desktop layouts, render the stage as a full-bleed media dock attached
  to the fixed header rather than a floating inset card.
- The stage top must match the actual occupied header edge; the tolerated gap is
  at most 1 CSS pixel and may overlap the header border by 1px.
- Size the portrait-mobile stage with stable `svh` units and leave a useful
  reading area below it.
- Calculate the Scrollama pixel offset from the actual rendered header height
  plus stage height. The chapter surface begins at the dock edge; its own
  padding supplies reading separation. Do not use a generic 72% viewport
  trigger.
- Recalculate on genuine layout/orientation changes, not every browser-toolbar
  resize.
- Retain one Journey image only, the non-interactive progress indicator,
  complete chapter copy, milestone sources, upward scroll recovery, and the
  linear reduced-motion fallback.

### Whole-site mobile quality

- Verify 320×568, 360×640, 360×800, 390×844, 430×932, 768×1024, 844×390,
  1024×768, and 1440×900.
- Preserve 200% text reflow, no document-level horizontal overflow, 44px touch
  targets, responsive images, Gallery rail containment, and fixed-header anchor
  offsets.
- Do not add another runtime dependency.

## Acceptance Criteria

- [x] At 320×568, 360×640, 360×800, 390×844, and 430×932, the Hero bottom is
      at or below the initial visual viewport bottom; `#about` is not initially
      visible.
- [x] Portrait-mobile Hero uses a complete contained foreground artwork and a
      decorative generated thumbnail ambience; it no longer uses a full-height
      `cover` crop.
- [x] Hero remains one eager/high-priority image and does not add an unverified
      media asset.
- [x] The Hero uses stable small-viewport sizing and does not resize from `dvh`
      while the user scrolls.
- [x] On 320–768px portrait layouts, the Journey stage is full bleed, visually
      attached to the header, and has a measured header/stage gap between -1px
      and +1px.
- [x] The Journey stage leaves at least 180px of visible viewport below it on
      the tested portrait phones.
- [x] Scrollama activation aligns to the rendered header + stage bottom rather
      than a generic percentage; downward and upward chapter changes remain
      correct.
- [x] Mobile Journey does not expose article text above the media dock and does
      not look like a shadowed floating card.
- [x] Short landscape keeps the stage compact and leaves readable content.
- [x] Reduced motion and missing observer support render all six chapters
      linearly with their images.
- [x] All target viewports, 200% text, touch-target, image-loading, Gallery, and
      horizontal-overflow contracts pass.
- [x] `mise run check`, `mise run e2e`, `git diff --check`, and Trellis context
      validation pass.
- [x] Frontend SPEC records mobile viewport, Hero art-direction, flush sticky
      media-dock, and measured-trigger contracts.

## Out of Scope

- Acquiring or inventing a new official portrait Hero artwork.
- Replacing Scrollama, Motion, the responsive-media pipeline, or the Gallery
  lightbox.
- Adding autoplay, swipe-only navigation, smooth-scroll interception, or a
  mobile-only app shell.

## Measured Results

Chromium touch/mobile emulation after implementation:

| Viewport | Hero / viewport | Header-stage gap | Stage reading space |
| --- | --- | ---: | ---: |
| 320×568 | 568 / 568px | 0px | 235px |
| 360×640 | 640 / 640px | 0px | 288px |
| 360×800 | 800 / 800px | 0px | 387px |
| 390×844 | 844 / 844px | 0px | 415px |
| 430×932 | 932 / 932px | 0px | 503px |
| 768×1024 | 1024 / 1024px | 0px | 623px |
| 844×390 | 390 / 390px | 0px | 176px |

All measured viewports reported zero document-level horizontal overflow. The
portrait foreground uses `object-fit: contain`; short landscape retains the
desktop-style `cover` composition.

