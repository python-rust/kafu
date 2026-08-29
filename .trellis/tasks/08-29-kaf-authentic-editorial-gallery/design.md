# Technical design

## 1. Problem decomposition

The main defect is not simply “small text.” It is a repeated content-and-layout
formula:

1. tiny uppercase English overline;
2. oversized serif heading;
3. generic explanatory paragraph describing the section;
4. leading-zero indexes and faux-system metadata;
5. repeated irregular cards or grids;
6. gradients used to manufacture identity instead of letting the media lead.

Removing only the font-size contrast would preserve the same template. This
task therefore changes content, hierarchy, composition, and the gallery
interaction together.

## 2. Visual direction

### Foundation

- Warm near-black page background and deep plum section surfaces.
- Off-white primary text and muted warm-grey secondary text.
- KAF pink appears on active/interactive states, not as a full-page wash.
- No decorative grid, registration marks, glassmorphism, or repeated radial
  glow fields.
- Image backdrops may use the active artwork itself with a dark overlay. This is
  content-derived atmosphere rather than a generic gradient motif.

### Type hierarchy

- One display-scale Hero title.
- Section titles use one shared moderate scale.
- Body, metadata, links, dates, and credits remain close in size; hierarchy
  comes from weight, spacing, grouping, and contrast.
- Japanese is used for navigation and section identity. English remains only
  inside official names, sourced credits, or production data that is actually
  English.

## 3. Content contract

Visible copy is allowed only for:

- identity: `花譜`, `KAF Observatory`;
- facts: dates, work types, chapter summaries, milestone descriptions;
- navigation/actions: `軌跡`, `作品`, `視覚`, `公式`, `公式サイト`,
  `軌跡を見る`, `公式ページ`, `出典`;
- attribution: the actual creator/source credit;
- legal: the fan-project disclaimer.

Section text that describes scrolling, layout, implementation, curation logic,
or the fact that a gallery contains images is removed.

## 4. Component boundaries

Add page-local shared components under:

```text
src/pages/HomePage/components/
├── MediaCredit.tsx
├── MediaCredit.module.css
├── SectionHeading.tsx
└── SectionHeading.module.css
```

### `MediaCredit`

Owns the repeated visible attribution link contract used by Hero, Journey,
Works, and Gallery:

```ts
interface MediaCreditProps {
  credit: string;
  href: string;
  subject: string;
  tone?: 'light' | 'dark';
}
```

It renders the actual credit text as the link. It does not prepend “VISUAL
CREDIT,” “SOURCE,” or a leading index.

### `SectionHeading`

Owns the repeated semantic section header and shared heading scale:

```ts
interface SectionHeadingProps {
  id: string;
  children: ReactNode;
  tone?: 'light' | 'dark';
  className?: string;
}
```

It renders only a heading. It intentionally has no eyebrow or generic summary
slot, preventing the removed pattern from reappearing through the component API.

## 5. Gallery architecture

### Inline theatre

`GallerySection` owns:

```ts
const [activeIndex, setActiveIndex] = useState(0);
const [lightboxOpen, setLightboxOpen] = useState(false);
```

The section renders:

1. a content-derived backdrop keyed by the active image;
2. one active stage button/figure with `AnimatePresence` crossfade;
3. title plus visible `MediaCredit`;
4. eight semantic thumbnail buttons in source order;
5. a lazily loaded lightbox when open.

Only opacity and transform animate. The backdrop blur is static; only its
opacity crossfades.

### Open-source lightbox

Use `yet-another-react-lightbox` because:

- official peer dependencies support React 19;
- it provides keyboard, swipe, focus, Escape close, intrinsic image dimensions,
  and optional lifecycle callbacks;
- its core can be lazy-loaded and does not require a second layout framework;
- local media already provides `src`, `alt`, `width`, and `height`.

The lightbox slides array is memoized from `visuals`. `on.view` keeps the inline
stage index synchronized with lightbox navigation. The lightbox is finite,
uses `contain`, closes on backdrop click/Escape, and exposes Japanese control
labels.

### Why not a masonry/justified gallery package

`react-photo-album` is mature and would solve mathematical row packing, but the
user's defect is a lack of focal hierarchy rather than poor packing alone. A
new rows/masonry implementation would still present eight competing images at
once. The single-stage + rail model directly resolves orientation and visual
focus while reusing a library only for the hard dialog/gesture problem.

## 6. Section changes

### Header

- Sticky/overlay header on the dark Hero.
- Brand plus Japanese anchor navigation.
- Remove status label and decorative brand signal.

### Hero

- Full-bleed or dominant artwork with dark readability scrim.
- Keep `花譜`, one statement, and two direct Japanese actions.
- Remove eyebrow, English title duplicate if composition does not need it,
  project/status line, metadata definition list, and credit prefix.

### Journey

- Keep observer and sticky stage.
- Stage shows year + Japanese title only.
- Navigation shows years; selected state comes from contrast/line treatment.
- Articles remove sequence/kicker and English title.
- Milestone links use `出典`; image credit uses shared component.

### Works

- Shared `作品` heading only.
- Featured work retains title, date, kind, factual description, image, credit,
  and `公式ページ` action.
- Supporting works use a deliberate repeated card layout rather than rhythm
  variants and decorative indexes.

### Official links and footer

- `公式` heading with no generic explanatory paragraph.
- Keep useful destination notes at normal readable size.
- Footer owns the one Japanese fan-project disclaimer and one image-credit
  anchor.

## 7. Compatibility and accessibility

- Preserve DOM/source order at every viewport.
- Thumbnail buttons have visible selected state, `aria-pressed`, explicit image
  names, and minimum 44px targets.
- Stage is a real button with an accessible “open image” label.
- Reduced-motion users receive immediate image changes and the same lightbox.
- The lightbox dependency owns focus trapping, keyboard arrows, Escape, and
  touch gestures.
- Existing intrinsic image and loading contracts remain unchanged.

## 8. Rollback shape

- Gallery dependency and component changes are isolated to GallerySection,
  package manifests, and tests. If integration fails, remove the dependency and
  restore the previous Gallery files without affecting Journey/Works.
- Shared components replace repeated markup incrementally; each consumer can be
  reverted independently.
- Global palette changes land with all section CSS updates in one coherent work
  commit to prevent mixed light/dark states.
