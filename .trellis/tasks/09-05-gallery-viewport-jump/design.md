# Design: Eliminate Visual Archive Scroll-Anchor Jump

## Change Boundary

The smallest behavior gap is that direct thumbnail selection changes
`window.scrollY` after the Gallery backdrop's keyed exit animation completes.
The incorrect behavior belongs to the animated decorative backdrop, not to the
thumbnail event handler, global page scrolling, or the lightbox.

Expected product-code changes:

- `src/pages/HomePage/sections/GallerySection.module.css` — exclude the
  decorative backdrop subtree from scroll-anchor candidate selection.
- `tests/e2e/home.spec.ts` — replace the false-negative viewport geometry with
  the production reproduction and exercise more than one selection.
- `.trellis/spec/frontend/media-guidelines.md` — record the executable Gallery
  scroll-anchoring contract after implementation is verified.

No package, content, image asset, global scrolling, lightbox API, or deployment
configuration change is required.

## Evidence and Root Cause

`GallerySection.tsx:103-132` renders the full-section decorative backdrop under
a keyed `AnimatePresence`. Changing `activeVisual.id` retains the exiting
backdrop for the configured 0.42s, then removes that keyed subtree.

Production matrix results at `390x844`, with the thumbnail rail centered:

| Experiment | `window.scrollY` delta |
| --- | ---: |
| Baseline | -547px |
| `html { scroll-behavior: auto }` | -547px |
| Disable thumbnail scroll snap | -547px |
| CSS transition/animation duration zero | -547px |
| `prefers-reduced-motion: reduce` | 0px |
| `overflow-anchor: none` on stage only | -547px |
| `overflow-anchor: none` on title only | -547px |
| `overflow-anchor: none` on rail only | -547px |
| `overflow-anchor: none` on backdrop only | 0px |
| `overflow-anchor: none` on entire Gallery | 0px |

The one-shot scroll occurs after the Motion exit window while document height
remains constant. The isolation matrix identifies the animated decorative
backdrop subtree as the browser's unsuitable scroll-anchor candidate. Its keyed
removal causes the root scroller to apply a compensating adjustment.

The defect and fix were also confirmed in Firefox 153 and WebKit 26.5. Old
production moved by approximately -547px in all three engines; the fixed local
build remained at delta 0. WebKit's stable scroll-anchoring enablement landed in
February 2026, so this is a current cross-engine behavior rather than a
Chromium-only edge case.

This matches the CSS Scroll Anchoring model: the browser selects a descendant
anchor node and adjusts the scroller when that anchor moves; `overflow-anchor:
none` excludes an element and its descendants from anchor-node selection.

## Selected Design

Add the standard exclusion to the existing owner:

```css
.backdrop {
  overflow-anchor: none;
}
```

The backdrop is absolutely positioned, decorative, `aria-hidden`, and
`pointer-events: none`; it does not carry reading position or interactive
meaning. Excluding only this subtree preserves document scroll anchoring for the
real section content while preventing a transient Motion node from becoming the
root scroller's anchor.

## Alternatives Rejected

### Capture and restore `window.scrollY`

Rejected because it compensates after an incorrect browser adjustment, races
with user input, can interrupt real scrolling, and adds imperative scroll
ownership to a component that should only change selection state.

### Blur the selected thumbnail or move focus

Rejected because the reproduction does not require a focus-restoration call and
the isolation matrix points to scroll anchoring. Removing focus would also harm
keyboard accessibility.

### Remove Motion or the backdrop crossfade

Rejected because the installed Motion boundary already owns the approved
low-frequency opacity transition. The problem is anchor eligibility, not the
existence of the transition.

### Disable scroll anchoring for the whole page or whole Gallery

Rejected as unnecessarily broad. The decorative backdrop is the only proven
incorrect candidate; real content should retain normal browser anchoring.

### Replace the Gallery or lightbox dependency

Rejected because the defect is in browser scroll-anchor selection around the
project-owned decorative subtree. Neither a new carousel nor a lightbox change
addresses that owner.

## Validation Design

The E2E regression will:

1. Load the real homepage at `390x844`.
2. Center the thumbnail rail vertically using an explicit instant `window.scrollTo`
   setup before measurement.
3. Horizontally position the desired thumbnail without invoking locator
   auto-scroll.
4. Click a verified visible point with `page.mouse.click`.
5. Wait beyond the 420ms exit transition and assert exact `window.scrollY`
   equality.
6. Repeat for a distant long-title visual so title length and rail position do
   not hide a remaining defect.
7. Keep the existing lightbox focus/scroll regression green.

Full validation remains `mise run check` and `mise run e2e`, followed by the
manual Cloudflare Pages deployment and the same production-browser smoke test.
The task-local verification sweep exercises all eight visuals at four viewport
sizes, while the cross-browser probe covers Chromium, Firefox, and WebKit.

## Rollback

Revert the CSS exclusion, its regression assertions, and the corresponding spec
entry. No data, dependency, media, or deployment migration is involved.
