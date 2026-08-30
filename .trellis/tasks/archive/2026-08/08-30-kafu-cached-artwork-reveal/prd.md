# Fix cached artwork transitions and Hero reveal

## Goal

Restore reliable Hero rendering and make Journey artwork transitions reuse
already-loaded images without flashing the low-quality placeholder again.
Improve actual/perceived loading without adding an external image origin or a
heavy image framework.

## Requirements

### Hero reliability

- The Hero foreground must become visible on the native `<img>` `load` event;
  `HTMLImageElement.decode()` must never be a prerequisite for visibility.
- Cached/preloaded Hero images must be recognized before paint through
  `complete`, `naturalWidth`, and the shared loaded-resource cache.
- Remove the redundant network-backed Hero ambience thumbnail. Reuse the
  existing inline placeholder as the portrait ambience instead.
- Keep exactly one eager/high-priority Hero image and one responsive preload.

### Cached artwork state

- Record successfully loaded concrete image URLs for the current page session.
- A remounted artwork whose responsive candidate is already loaded must start
  in the loaded state and must not paint the blur/loading UI for a frame.
- A cached browser image that completed before React handlers attach must be
  recognized in a layout effect before paint.
- Errors remain retryable when the component remounts; an error must not be
  stored as loaded.

### Journey transition behavior

- Keep the currently clear Journey image visible while the next active image is
  still transferring.
- Show a small honest loading state over the existing clear stage during that
  pending transition; do not replace the stage with a blurred placeholder.
- Preload only the adjacent chapter in the user's current scroll direction at
  low priority, using native responsive image candidates and browser cache.
- Do not start adjacent preloading until Scrollama confirms that the reader has
  entered Journey and the currently displayed stage image is clear; an
  offscreen browser-lazy load alone is not sufficient.
- Once the next candidate loads, crossfade directly from clear image to clear
  image.
- Revisiting an already-seen chapter must switch without a loading/placeholder
  flash.
- Preserve one visible Journey image, native scrolling, reduced-motion linear
  content, and Scrollama ownership.

### Dependency decision

- Review `react-cool-img`, `react-lazy-load-image-component`, and Unpic against
  React 19, responsive `srcset`/`sizes`, cache/remount behavior, local Vite
  assets, placeholder behavior, and current component contracts.
- Add a dependency only if it directly solves the failure without discarding
  current responsive/provenance/accessibility contracts.

### Deployment

- Keep all runtime images same-origin on GitHub Pages.
- Preserve the manual-only Pages workflow and `/kafu/` base-path verification.
- Manually deploy and verify the public Hero, cached Journey transitions, and
  weak-network first-load feedback.

## Acceptance Criteria

- [x] Hero reaches `data-artwork-status=loaded` even when `img.decode()` never
      resolves.
- [x] A cached image remount begins loaded and never enters a painted loading
      state.
- [x] Hero has one network-backed `<img>`; portrait ambience is the inline
      placeholder, not a second thumbnail request.
- [x] First-time weak-network artwork still shows placeholder/loading feedback.
- [x] Journey retains the previous clear image while the next image is pending.
- [x] After all Journey images are seen, forward/backward transitions record no
      `loading` or blur-placeholder state.
- [x] Adjacent Journey preloading uses low priority and does not preload all six
      images at initial page load.
- [x] Waiting on the Hero for at least 500ms produces no adjacent Journey image
      request before the first Journey step is activated.
- [x] The library review and final decision are recorded with evidence.
- [x] Existing image, viewport, reduced-motion, source, and Pages tests remain
      green.
- [x] `mise run check`, `mise run e2e`, media verification, Pages artifact
      verification, and `git diff --check` pass.
- [x] The task is committed, manually deployed, publicly verified, archived,
      and journaled.

