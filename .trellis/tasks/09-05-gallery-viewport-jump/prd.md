# Fix gallery viewport jump

## Goal

Changing the selected image in the Visual Archive must update the gallery in
place without changing the reader's vertical document position. The fix must
address the browser behavior that causes the jump rather than compensating with
manual scroll restoration.

## Background

- Production still reproduces the defect after commit `6624401`: at a
  `390x844` viewport, place the horizontal thumbnail rail near the center of the
  viewport and click `忘れてしまえ`. The active image changes, then
  `window.scrollY` moves from `11542` to `10995` approximately 420–450ms later.
- The document height is unchanged during the jump. The delay matches the
  Gallery Motion transition duration (`0.42s`) in
  `src/pages/HomePage/sections/GallerySection.tsx:28-31`.
- The existing regression at `tests/e2e/home.spec.ts:999-1035` places only the
  bottom edge of the thumbnail rail in the viewport. That geometry does not
  trigger the production defect and therefore produced a false negative.
- The previous fix primarily addressed focus restoration after closing the
  lightbox. This remaining defect occurs on a direct thumbnail selection with
  no lightbox involved.

## Requirements

- Preserve the exact vertical viewport position for direct pointer selection of
  any gallery thumbnail, including after the 420ms active-image transition has
  completed.
- Preserve the existing active stage, title, selected-state, backdrop
  crossfade, responsive image delivery, accessibility labels, keyboard
  behavior, and lightbox integration.
- Keep native document scrolling. Do not call `window.scrollTo`, capture and
  replay `scrollY`, blur the selected control, or globally disable smooth
  scrolling as a workaround.
- Do not replace Motion or `yet-another-react-lightbox`, add another carousel,
  or introduce a new dependency. Reuse the browser's standard scroll-anchoring
  exclusion mechanism at the narrowest incorrect anchor owner.
- Add a browser regression that reproduces the actual failing geometry rather
  than relying on Playwright's locator auto-scroll behavior.
- Run the full project quality and browser suites, update the frontend media
  specification, deploy from `main`, and verify the production interaction.

## Out of Scope

- Redesigning the Visual Archive composition or thumbnail rail.
- Changing the global `html` scroll behavior.
- Removing Gallery motion or changing the 420ms visual transition.
- Replacing the existing open-source lightbox or modifying its zoom/navigation
  behavior.

## Acceptance Criteria

- [x] A failing Chromium reproduction exists with the thumbnail rail centered
      in a `390x844` viewport and a real pointer click.
- [x] After selecting both a nearby short-title image and a horizontally distant
      long-title image, `window.scrollY` remains exactly unchanged after the
      transition window.
- [x] The decorative animated backdrop is excluded from document scroll-anchor
      candidate selection without excluding the real Gallery content.
- [x] Existing thumbnail selection, lightbox navigation/focus restoration,
      responsive media, reduced-motion, and page-layout tests remain green.
- [x] The fixed build records zero vertical delta in current Chromium, Firefox,
      and WebKit probes for the centered-rail pointer scenario.
- [x] `mise run check` and `mise run e2e` pass.
- [x] The relevant Trellis frontend spec records the scroll-anchoring contract
      and the required regression geometry.
- [x] The task changes are committed and pushed to `main`; the manual Cloudflare
      Pages workflow succeeds for that commit.
- [x] The deployed production site passes the same centered-rail pointer
      interaction check and serves the new build.

## Open Questions

None. The user outcome, scope, compatibility target, and rollout are explicit.
