# Image loading and cache review

## Browser APIs

- MDN `HTMLImageElement.complete`:
  `https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/complete`
  - `complete` becomes true when the image is fully fetched/queued for
    rendering, previously determined available, or broken. Pair with
    `naturalWidth > 0` to distinguish success.
- MDN `HTMLImageElement.decode()`:
  `https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode`
  - Returns a Promise when decoded; useful for pre-decoding a detached image,
    but it should not be a permanent visibility gate for an already loaded DOM
    image.
- web.dev browser-level lazy loading:
  `https://web.dev/articles/browser-level-image-lazy-loading`
  - Native `loading` controls discovery timing; `fetchpriority` controls network
    priority.
- web.dev LCP optimization:
  `https://web.dev/articles/optimize-lcp`
  - Do not lazy-load the LCP image; use high fetch priority and early discovery.

## Package review

### `react-cool-img` 1.2.12

- Repository: `https://github.com/wellyshen/react-cool-img`
- MIT; React >=16.8; npm last modified 2022-05-14.
- Useful ideas: placeholder/error states, cache awareness, retry, native
  IntersectionObserver.
- Rejected for this project: its preloader creates `new Image()` and assigns
  only `src`; `srcSet`/`sizes` are not used to select the preloaded candidate.
  Session cache is keyed only by `src`. This can preload/cache a different file
  from the browser's responsive candidate.

### `react-lazy-load-image-component` 1.6.3

- Repository: `https://github.com/Aljullu/react-lazy-load-image-component`
- MIT; supports React 19; modified 2024-12-16.
- Useful ideas: IntersectionObserver, placeholder/effect composition.
- Rejected: no loaded-resource cache across keyed remounts; existing issues
  document responsive-placeholder and wrapper-height problems. The project
  already uses native lazy loading and has stricter intrinsic-layout contracts.

### `@unpic/react` 1.0.2

- Repository: `https://github.com/ascorbic/unpic-img`
- MIT; React 17-19; modified 2025-12-08.
- Strong responsive image markup. Documentation recommends inline base64
  placeholders rather than remote placeholder requests.
- Rejected for this repair: designed around image CDN/CMS transformation and
  does not solve cached remount state or Journey's keep-old-image-until-ready
  transition.

## Decision

Keep native `<img loading>`, responsive `srcset`/`sizes`, and the existing
generated inline placeholders. Add only a narrow session loaded-resource cache
and adjacent preloader, modeled on browser cache semantics rather than replacing
them.

