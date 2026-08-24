# Design — anime-style KAF fan site

## 1. Design thesis

Build the homepage as a **digital editorial issue about KAF** rather than as an application dashboard or an imitation official artist portal.

The visual hierarchy should be:

1. KAF artwork / subject recognition;
2. editorial title and narrative;
3. selected music/visual content;
4. navigation and metadata;
5. supporting decoration/motion.

This ordering prevents the common failure mode where anime styling is reduced to neon gradients, glass cards, particles, and decorative UI while the actual character/art becomes secondary.

## 2. Visual system

### Palette

Extend the existing token system with semantic roles rather than scattering hard-coded colors:

- `paper`: warm ivory / desaturated cream base;
- `ink`: near-black with a slight violet cast;
- `ink-soft`: subdued editorial gray;
- `kaf-rose`: primary pink/rose accent;
- `kaf-magenta`: stronger action/highlight accent;
- `mist-lavender`: quiet secondary field/background;
- `cool-blue`: sparing contrast/accent only.

Exact values should be tuned in-browser against the final licensed artwork. Do not sample/copy an official site's CSS palette as a substitute for design judgment.

### Typography

- Display: Japanese Mincho/serif system stack for section numerals, Japanese display copy, and selected editorial moments.
- Body/navigation: Japanese sans-serif system stack for legibility and responsive consistency.
- Latin micro-labels may use the existing sans-serif stack with tracking.
- Avoid adding a large webfont payload in this iteration unless native stacks demonstrably fail the visual review.

### Graphic language

- Thin editorial rules and frame lines.
- Observation numbers such as `OBSERVATION / 001`.
- Small date/type/source metadata.
- Asymmetric image cropping and off-grid overlaps at desktop only where they do not compromise reading order.
- Project-created abstract petal/flower/ink marks may be implemented with lightweight CSS or original non-character SVG geometry.
- No copied KAF/KAMITSUBAKI logo assets.

### Motion

Use the existing `motion` package only for restrained transitions:

- hero text/image reveal;
- section entrance where it improves pacing;
- slight image crop/translate on hover-capable devices;
- no perpetual ambient motion;
- no scroll-jacking;
- all non-essential motion disabled/reduced for `prefers-reduced-motion`.

## 3. Page architecture

Keep `/` as the only product route for this iteration.

Suggested composition:

```text
HomePage
├── SiteHeader / anchor navigation
├── HeroSection
├── AboutSection
├── SelectedWorksSection
├── VisualArchiveSection
├── OfficialLinksSection
└── SiteFooter / disclaimer + attribution entry
```

These are homepage-owned sections. Prefer colocating them under `src/pages/HomePage/` (for example a `sections/` subdirectory) rather than introducing a generic global component layer.

## 4. Content model

Static factual/curated content should live outside JSX in a typed local module so that display components do not become the source of truth for release/visual metadata.

Suggested boundary:

```text
src/content/kaf.ts
```

Potential types:

```ts
interface KafWork {
  title: string;
  releaseDate: string;
  kind: 'album' | 'single' | 'live' | 'other';
  sourceUrl: string;
  image?: LocalImageReference;
}

interface KafVisual {
  image: LocalImageReference;
  alt: string;
  creator: string;
  sourceUrl: string;
  credit?: string;
}
```

Exact type names are implementation details; the contract is that content/provenance is explicit and typed.

No runtime fetch/cache layer is required.

## 5. Asset pipeline and provenance

### Repository structure

Suggested structure:

```text
src/assets/kaf/
├── hero-*.{avif,webp,jpg,png}
├── visual-*.{avif,webp,jpg,png}
└── ATTRIBUTION.md
```

`ATTRIBUTION.md` is the durable provenance record for third-party media and should contain source, creator, license/permission note, credit, and retrieval date.

### Acquisition gate

Before copying any image into `src/assets/kaf/`:

1. open the original source page;
2. identify the creator/rightsholder;
3. read the specific work license/terms;
4. confirm the intended non-commercial fan-site use is compatible;
5. record attribution requirements;
6. only then download the source file;
7. preserve an optimized derivative only if modification is allowed by the asset terms.

If modification is prohibited, do not crop/recolor/compress in a way that constitutes a disallowed modification; choose a different source or use the original within a responsive layout that does not require destructive editing.

### Loading strategy

- Hero image: responsive local source; may use `fetchpriority="high"`/eager loading when it is the LCP candidate.
- Below-fold archive images: `loading="lazy"` and explicit dimensions/aspect ratio to reduce layout shift.
- Avoid loading the entire gallery at hero quality on mobile.

## 6. Section behavior

### Header

- Compact project mark (`KAF OBSERVATORY`) plus explicit unofficial status.
- Anchor links: ABOUT / WORKS / VISUALS / LINKS.
- On mobile, prefer a simple horizontally scrollable/compact anchor treatment or accessible menu only if needed; do not add a complex drawer by default.

### Hero

- Artwork should occupy roughly half or more of the visual emphasis on desktop.
- Character face/important illustration areas must not be obscured by text.
- Title remains readable independently of the image.
- CTA points to the official KAF site, clearly labeled as external/official.

### About

- Short fan-written introduction, not a pasted official biography.
- Optional small factual metadata row (virtual singer, debut year, studio) only after checking official sources.

### Selected Works

- Editorial cards/rows rather than ecommerce-style tiles.
- Four or more items.
- Latest/current item may receive a larger treatment.
- Cover art is optional and must pass the asset gate; typography-only treatments are acceptable where cover-art reuse is not clearly permitted.

### Visual Archive

- Small curated set, not an infinite gallery.
- Every visual exposes creator/source attribution at or near the item when required.
- No masonry layout that makes mobile reading/order unpredictable; use a controlled grid.

### Official Links

- Clear distinction between this fan site and official destinations.
- Avoid copying social platform branding more than necessary; text links are acceptable.

## 7. Responsive behavior

### Desktop

- Asymmetric hero with large image and editorial typography.
- Selected Works can use alternating image/text or compact horizontal entries.
- Visual Archive may use a 2–3 column controlled grid.

### Tablet

- Reduce overlaps and vertical labels.
- Maintain two-column layouts only where text remains readable.

### Mobile

- Hero becomes a deliberate image → title/copy sequence (or title → image when visual testing proves stronger), never an accidental collapsed desktop grid.
- Navigation remains directly reachable.
- No critical information exists only inside hover states.
- Gallery becomes a single-column or stable two-column rhythm depending on final image aspect ratios.

## 8. Accessibility contracts

- Header/navigation uses semantic navigation landmarks.
- Every section has a stable heading and anchor target.
- Links to official destinations have descriptive names.
- Artwork alt text identifies what is visible without pretending to establish official provenance.
- Credits are text, not baked into images unless the source license requires otherwise.
- Original decorative petal/ink marks are `aria-hidden`.

## 9. Testing strategy

### Vitest / Testing Library

Test user-visible structure rather than CSS implementation:

- KAF/unofficial identity;
- major section headings;
- official-site link;
- selected-work rendering from local typed content;
- useful accessible names.

### Playwright

At minimum:

- desktop homepage smoke;
- mobile homepage smoke;
- anchor navigation reaches expected sections;
- no horizontal overflow at target mobile viewport;
- major artwork and content are visible;
- page remains functional under reduced-motion emulation where practical.

## 10. Compatibility / migration

- No data migration.
- Existing route `/` stays stable.
- Existing KAF Observatory branding is evolved, not replaced with an official-looking identity.
- Existing Live2D removal remains permanent for this iteration.

## 11. Rollback strategy

The iteration should remain a contained homepage/content/assets change. If the new art direction fails review, rollback should be possible by reverting the homepage/tokens/assets/content commit without data migration or backend impact.

Asset provenance files must be removed together with any rolled-back third-party media to avoid orphaned or misleading licensing records.
