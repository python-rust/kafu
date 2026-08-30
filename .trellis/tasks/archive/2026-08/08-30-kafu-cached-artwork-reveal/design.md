# Technical design

## Failure analysis

The current shared component keeps the final image at `opacity: 0` until
`img.decode()` settles. The load event already means the resource is complete,
but a delayed or never-settling decode Promise leaves the Hero permanently
behind the placeholder.

The component also initializes every keyed remount to `loading`. Journey uses a
new keyed figure for each chapter, so even browser-cached images paint the LQIP
until a passive effect notices `complete` and updates state.

## Selected architecture

### Native image event as source of truth

`onLoad` marks the image loaded immediately. `decoding="async"` remains a browser
hint, but visibility is not gated on a Promise.

### Small loaded-resource cache

Add a page-local module that stores concrete loaded absolute URLs. It provides:

```ts
markArtworkLoaded(image)
hasLoadedArtwork(source)
preloadResponsiveArtwork(source, sizes, fetchPriority)
```

The cache is session-memory only. It does not replace HTTP caching and does not
persist stale URLs between deployments.

`ResponsiveArtwork` derives its initial state from this cache and uses
`useLayoutEffect` to inspect `complete`, `naturalWidth`, and `currentSrc` before
paint. This removes the cached-remount placeholder flash.

### Stale-while-loading Journey stage

Journey separates:

- `activeIndex`: Scrollama's current narrative step;
- `displayedVisualIndex`: the clear image currently shown.

When active changes, the stage preloads that responsive image. Until it loads,
the prior clear image remains visible and the stage shows a restrained pending
indicator. After load, Motion crossfades to the new clear image. The adjacent
chapter in the current scroll direction is then prefetched with low priority,
but only after Scrollama has actually activated Journey. This prevents the
browser's generous native lazy-loading distance from turning an offscreen
first-stage load into an early second-stage request while the reader is still
on the Hero or Profile.

### One-request Hero

Remove the separate thumbnail `<img>` used as portrait ambience. The shared
inline placeholder already exists inside the Hero artwork shell. A
`preservePlaceholder` mode keeps that inline background visible behind the
contained portrait image after the foreground loads.

## Open-source review

- `react-cool-img`: supplies placeholders, retries, and a session cache, but its
  internal preloader loads only `src`, while `srcSet`/`sizes` are attached only
  after that request. Its cache is keyed only by `src`; this conflicts with the
  browser-selected responsive candidate and current Vite asset contract. Last
  package modification was 2022.
- `react-lazy-load-image-component`: supports React 19 and IntersectionObserver,
  but does not retain loaded state across keyed remounts. Its public issues
  include responsive-placeholder sizing and wrapper-height regressions.
- `@unpic/react`: strong responsive markup and inline-placeholder guidance, but
  focuses on CDN/CMS image transformation and does not own cached load-state or
  Journey stale-while-loading transitions.

No package solves the actual state-transition bug without replacing working
local responsive/provenance behavior. The selected adapter is intentionally
narrow and built directly on stable browser APIs.

## Rollback

The change is isolated to the shared artwork cache/component, Hero ambience,
and Journey stage state. Reverting the implementation commit restores the prior
behavior without media/data migrations.

