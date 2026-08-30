# Design: Weak-network responsive artwork

## Observed failure

The deployed page is reachable in mainland China and all image URLs are
same-origin GitHub Pages assets. On a slow route, text and layout appear while
image surfaces remain visually empty for a long time. The current shared image
component has no loading state and uses density descriptors, so a high-DPR
phone can request the 4x derivative even when the 2x derivative is already much
wider than the rendered element.

## Selected architecture

### 1. Inline LQIP metadata

`scripts/generate_kaf_media_variants.py` derives a 32px-long-edge WebP from each
verified thumbnail and serializes it as a `data:image/webp;base64,...` string in
`mediaVariants.ts`.

Benefits:

- visible immediately with the JavaScript/media metadata;
- no extra request and no dependency on the slow image transfer path;
- derived from the same verified artwork and provenance;
- total encoded payload is only a few kilobytes across nine unique images.

The source previews and 27 existing derivatives remain unchanged.

### 2. One-image progressive shell

`ResponsiveArtwork` renders one wrapper and one semantic `<img>`:

```text
wrapper (reserved aspect ratio, inline placeholder, aria-busy)
├── CSS indeterminate indicator / status text
└── img (native responsive loading, fades in after decode)
```

The placeholder is a CSS background using the inline data URL. It is not a
second `<img>` and cannot create another network request. State transitions are
`loading -> loaded` or `loading -> error`; cached images are detected through
`complete` and `naturalWidth`.

### 3. Width-based responsive candidates

The component emits:

```text
thumbnail.width w
display.width w
highDensity.width w
```

Callers provide a `sizes` expression representing their layout role. The
browser chooses the smallest candidate that satisfies rendered CSS width and
device density. This retains native responsive-image selection while avoiding
the fixed assumption that every DPR 2/3 device needs the 4x asset.

### 4. Priority policy

| Role | loading | fetch priority |
| --- | --- | --- |
| Hero foreground | eager | high |
| Hero ambience thumbnail | lazy | low |
| Profile | lazy | auto |
| Active Journey stage | lazy | auto |
| Reduced-motion Journey article images | lazy | low |
| Featured/supporting Works | lazy | low |
| Gallery active image/backdrop/rail | lazy | low |
| Lightbox | interaction-only | existing lazy chunk |

This uses browser scheduling rather than a custom global queue. Native lazy
loading already considers distance from the viewport and effective connection;
priority hints distinguish the next reading surfaces from later media.

The responsive Hero candidate set is also declared in an HTML image preload so
the browser discovers the LCP request before React executes. The Pages artifact
verifier resolves and checks every preload candidate after `/kafu/` base-path
rewriting.

### 5. Source-native `狂想β` cover

The official KAF discography cover is a verified 1600×1600 source, so it does
not use the preview-upscaling path. The generator has two explicit strategies:

```text
upscale -> existing nine Piapro previews, 2×/4×/480 outputs
native  -> official 1600px cover, 800/1600/480 outputs
```

Both strategies produce manifest hashes, typed imports, and inline
placeholders. This keeps one runtime contract without misrepresenting a native
official source as an AI-upscaled preview.

## Rejected options

### External image CDN or OSS

Rejected because the defect is slow same-origin transfer feedback, not a broken
Japanese hotlink. It would add another origin, deployment process, CORS/cache
surface, and potentially cost or备案 complexity.

### `react-lazy-load-image-component`

Reviewed but rejected. It would duplicate the existing component boundary,
adds throttle/debounce dependencies, and does not solve the current generated
media metadata or role-specific `sizes` contract better than native APIs.

### `@unpic/react`

Reviewed but rejected. It is useful for provider/image-CDN abstractions, while
this project already owns local derivatives and needs loading-state UX rather
than URL transformation.

### BlurHash runtime decoding

Rejected because tiny WebP placeholders can be generated from existing trusted
thumbnails at build time. Runtime canvas decoding and another dependency are
unnecessary.

### Fetching image bytes manually for real progress

Rejected. A fetch/blob pipeline would bypass native `srcset` selection, increase
memory use, complicate cache behavior, and require object URL lifecycle
management. The UI will show an honest indeterminate state instead of a fake
percentage.

## Rollback

The change is isolated to generated media metadata, the shared image component,
role attributes, tests, and SPEC. Reverting the implementation commit restores
the prior `<img>` output without changing source media or provenance.

