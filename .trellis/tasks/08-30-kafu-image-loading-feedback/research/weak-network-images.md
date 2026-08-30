# Research: weak-network image loading

## Primary references

### Browser-native lazy loading

- `https://web.dev/articles/browser-level-image-lazy-loading`
- Browser lazy-loading distance thresholds account for effective connection
  type. Keep native loading as the base behavior, but do not assume it provides
  visible feedback or strict user-perceived sequencing.

### LCP and fetch priority

- `https://web.dev/articles/optimize-lcp`
- `https://web.dev/articles/fetch-priority`
- The LCP/Hero image must not be lazy-loaded and should use
  `fetchpriority="high"`. Later images may use lazy loading and lower priority to
  avoid competing with critical content.

### Image loading and decoding state

- `https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/loading`
- `https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decoding`
- `loading` is a browser hint; `load`, `complete`, `naturalWidth`, and `decode()`
  provide the component-level signals needed for loading/reveal state.

### Layout stability

- `https://web.dev/articles/optimize-cls`
- Preserve explicit intrinsic dimensions/aspect ratio while the placeholder and
  final image transition.

## Package review

### `react-lazy-load-image-component@1.6.3`

- MIT and React 19 compatible.
- Adds lodash throttle/debounce and overlaps the existing shared image boundary.
- Not selected.

### `@unpic/react@1.0.2`

- MIT and React 19 compatible.
- Better suited to provider/CDN URL generation than local derivative loading
  feedback.
- Not selected.

### `blurhash@2.0.5`

- MIT.
- Adds runtime decoding/canvas work that is unnecessary when tiny WebP data
  placeholders can be generated from the existing verified thumbnails.
- Not selected.

## Decision

Use native browser image loading and priority hints, the existing
`ResponsiveArtwork` component, generated inline WebP placeholders, and CSS
indeterminate feedback. No new runtime dependency or external image service.

## `狂想β` cover evidence

- Official discography page:
  `https://kaf.kamitsubaki.jp/discography/20230308/199/`
- Official image:
  `https://kaf.kamitsubaki.jp/wp/wp-content/uploads/2024/03/kaf-Crazy_for_you_beta.png`
- Retrieved image: 1600×1600 RGBA PNG, SHA-256
  `161fe38755a496e70a703a60848b385184bcca293685a781ee63d2372fd094f1`.
- The official page identifies it as the third album and credits the jacket to
  PALOW.
- KAMITSUBAKI secondary-creation guidelines:
  `https://kamitsubaki.jp/guidelines/`
- Selected use boundary: individual, unofficial, non-commercial fan-site
  identification; no advertising, merchandise, download action, or official
  affiliation claim. Keep the unmodified source as provenance and limit
  derivatives to technical resizing/format conversion.

