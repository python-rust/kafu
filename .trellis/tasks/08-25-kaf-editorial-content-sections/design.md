# Design — KAF works, gallery, outbound links, and footer

## 1. Component boundaries

Four independent homepage-owned components are preferred over one lower-page monolith:

```text
WorksSection
GallerySection
OfficialLinksSection
SiteFooter
```

Each component has its own CSS Module. Do not create a generic global card/grid abstraction solely for this page.

## 2. Works contract and composition

Suggested local prop shape:

```ts
interface WorkVisual {
  src: string;
  alt: string;
  width: number;
  height: number;
  credit?: string;
  sourceUrl?: string;
}

interface WorkItem {
  id: string;
  title: string;
  releaseDate: string;
  kind: string;
  description: string;
  sourceUrl: string;
  featured?: boolean;
  visual?: WorkVisual;
}

interface WorksSectionProps {
  works: readonly WorkItem[];
}
```

Composition:

- One featured/current work occupies a large image/type field.
- Supporting works alternate image position, scale, or typographic emphasis.
- Use open composition and rules rather than wrapping every item in the same rounded container.
- Preserve readable source order even when desktop CSS creates asymmetric placement.
- When a supporting work lacks a permitted image, use an intentional typographic treatment rather than a broken placeholder; the production media task should still make the overall section image-rich.

The component should fail explicitly or render a documented fallback if no featured work exists; do not silently choose an unstable record.

## 3. Gallery contract and composition

Suggested shape:

```ts
interface GalleryVisual {
  id: string;
  title: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  credit: string;
  sourceUrl: string;
}

interface GallerySectionProps {
  visuals: readonly GalleryVisual[];
}
```

Use a controlled CSS grid with deliberate span/aspect rules derived from item index or optional presentation metadata. Avoid JavaScript masonry and avoid visual/source-order divergence that becomes confusing on mobile.

Each item is a semantic `<figure>` with adjacent `<figcaption>` credit/source content. Do not bake credits into images unless a source explicitly requires it.

## 4. Official links contract

Suggested shape:

```ts
interface OfficialLinkItem {
  label: string;
  note: string;
  href: string;
}

interface OfficialLinksSectionProps {
  links: readonly OfficialLinkItem[];
}
```

Render large typographic rows with index, label, note, and external arrow. Text links are preferred over adding third-party logo packages.

## 5. Footer contract

The footer may use explicit props for project label/year/credit destination or narrow defaults. It must never imply official affiliation.

## 6. CSS and tokens

Reference semantic variables with conservative fallbacks:

```css
color: var(--color-text, #f8f4f7);
background: var(--color-void, #090a14);
border-color: var(--color-line-on-dark, rgb(255 255 255 / 18%));
```

Do not define global tokens in this branch. Page-local accents may use local custom properties when tied to a specific work/gallery composition.

## 7. Motion

Optional section/item reveal:

- bounded opacity and short translation;
- once-per-entry where appropriate;
- no content-hidden initial state in unsupported/test environments;
- reduced-motion immediate final state;
- no scroll-linked progress or global listener.

Hover-capable devices may receive a small image crop/scale or line movement. Hover must not reveal essential credit or source information.

## 8. Image loading

- Set `loading="lazy"` and `decoding="async"` for these below-the-fold images.
- Pass numeric width/height attributes.
- Use CSS `aspect-ratio`/object-fit without destructive source processing.
- Do not eagerly load a whole gallery.

## 9. Focused tests

Use production-shaped fixture arrays to verify:

- one featured and multiple supporting works;
- headings, dates/kinds, official links, images/alt text;
- every gallery figure and credit/source;
- official link labels/notes/destinations;
- footer disclaimer/non-affiliation text;
- semantic landmarks and no interaction dependency.

Do not assert class names, exact layout, or animation timing.

## 10. Rollback

All files are additive. Reverting the PR removes section modules/tests without affecting the current route, data, assets, or global styles.
