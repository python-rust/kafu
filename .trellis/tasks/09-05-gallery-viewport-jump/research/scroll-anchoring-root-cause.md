# Gallery viewport jump: research and reproduction

## Repository evidence

- `src/pages/HomePage/sections/GallerySection.tsx:28-31` defines a 0.42s
  Gallery transition.
- `src/pages/HomePage/sections/GallerySection.tsx:103-132` keys the decorative
  backdrop by `activeVisual.id` inside `AnimatePresence`.
- `src/pages/HomePage/sections/GallerySection.tsx:185-216` owns direct thumbnail
  selection; it only calls `setActiveIndex` and contains no explicit vertical
  scroll command.
- `tests/e2e/home.spec.ts:999-1035` previously left only 32px of the thumbnail
  rail near the bottom of the viewport. That position does not reproduce the
  user's centered-rail interaction.

## Production reproduction

Target: `https://kafu-8bd.pages.dev/`

At `390x844`:

1. Center the Visual Archive thumbnail rail in the viewport.
2. Keep the horizontal rail at its first item.
3. Click `忘れてしまえ` with a raw pointer coordinate.
4. Observe the active image update.
5. Approximately 420–450ms later, `window.scrollY` changes from `11542` to
   `10995` (`-547px`).

The root document height remains unchanged. The scroll is one instantaneous
adjustment rather than a smooth-scroll sequence.

The executable research matrix is retained beside this note as
`reproduction-matrix.mjs`.

## Isolation matrix

| Change injected into production | Result |
| --- | ---: |
| Baseline | -547px |
| Global smooth scrolling disabled | -547px |
| Thumbnail scroll snap disabled | -547px |
| CSS animations/transitions forced to zero | -547px |
| Reduced-motion browser preference | 0px |
| Stage excluded from scroll anchoring | -547px |
| Title excluded from scroll anchoring | -547px |
| Thumbnail rail excluded from scroll anchoring | -547px |
| Decorative backdrop excluded from scroll anchoring | 0px |
| Entire Gallery excluded from scroll anchoring | 0px |

Conclusion: the delayed keyed removal of the decorative backdrop subtree is the
necessary trigger, and that subtree is the unsuitable scroll-anchor candidate.
The narrow exclusion fixes the defect without changing real content or native
scrolling.

## Cross-browser verification

The same centered-rail pointer scenario was executed with current Playwright
browser engines before and after the local fix:

| Engine | Old production backdrop | Old production delta | Fixed local backdrop | Fixed local delta |
| --- | --- | ---: | --- | ---: |
| Chromium | `overflow-anchor: auto` | -547px | `none` | 0px |
| Firefox 153 | `overflow-anchor: auto` | -547.366px | `none` | 0px |
| WebKit 26.5 | `overflow-anchor: auto` | -547px | `none` | 0px |

The local Chromium sweep additionally selected all eight thumbnails at each of
`390x844`, `430x932`, `768x1024`, and `1440x900`: 32 selections completed after
the 420ms exit window without changing `window.scrollY`.

The WebKit project enabled scroll anchoring for stable builds in February 2026
under WebKit bug 307734. The runtime probe confirms both
`CSS.supports('overflow-anchor', 'none') === true` and the same pre-fix defect in
WebKit 26.5, so the exclusion is not merely a Chromium-specific mitigation.

Executable probes:

- `reproduction-matrix.mjs` — production isolation matrix;
- `cross-browser-probe.mjs` — Chromium/Firefox/WebKit before-and-after probe;
- `verification-sweep.mjs` — four-viewport, all-eight-thumbnail local or
  production sweep.

## External primary sources

### CSS Scroll Anchoring Module Level 1

https://www.w3.org/TR/css-scroll-anchoring-1/

The specification defines browser anchor-node selection and compensating scroll
adjustments. Its exclusion API states that `overflow-anchor: none` makes an
element and its descendants ineligible for anchor-node selection in ancestor
scrolling boxes.

### MDN: Overview of scroll anchoring

https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_anchoring/Overview

MDN describes the default browser behavior and recommends excluding an
inappropriate anchor candidate with `overflow-anchor` rather than disabling the
feature globally.

### Motion: AnimatePresence

https://motion.dev/docs/react-animate-presence

Motion documents that exiting keyed children remain present for their exit
animation. In this Gallery, that lifecycle explains why the browser adjustment
occurs at the end of the 0.42s transition rather than immediately on click.

### Yet Another React Lightbox documentation

https://yet-another-react-lightbox.com/documentation

The installed lightbox already owns modal focus, portal, navigation, and body
scroll locking. The direct-thumbnail defect reproduces without opening it, so
replacing or extending the lightbox would target the wrong subsystem.

### WebKit bug 307734: enable scroll anchoring in stable

https://bugs.webkit.org/show_bug.cgi?id=307734

WebKit marked the stable-enable change fixed after landing revision
`307475@main` on February 13, 2026. This explains why current WebKit reproduces
the same anchoring behavior even though older compatibility tables may still
describe Safari support as incomplete.

## Decision

Use the standards-defined, owner-local CSS exclusion:

```css
.backdrop {
  overflow-anchor: none;
}
```

Do not add scroll restoration code, focus suppression, a new carousel, or a new
animation dependency.

## Production delivery evidence

- Implementation commit:
  `9d7ee58caef691ebf76637b28481e882cdb256be`
- Cloudflare Pages workflow run: `33904697907`
- Workflow conclusion: success; checkout, policy verification, mise setup,
  dependency installation, quality checks, static artifact verification,
  Pages deployment, and production site/avatar verification all passed.
- Production root returned HTTP 200 and served:
  - CSS: `/assets/index-Dq5bwt8D.css`
  - JavaScript: `/assets/index-pHn5BTUp.js`
- The deployed CSS contains `overflow-anchor:none`.
- The production verification sweep selected all eight thumbnails at each of
  `390x844`, `430x932`, `768x1024`, and `1440x900` without changing
  `window.scrollY`.
- Production engine probes reported:
  - Chromium: both nearby and distant selections, delta 0;
  - Firefox 153: delta 0;
  - WebKit 26.5: delta 0.
