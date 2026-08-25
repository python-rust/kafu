# Design — KAF Phenomenon Chapters

## 1. Design thesis

The current page is organized like a restrained editorial issue. The redesign should instead feel like entering a virtual singer's changing visual world. The narrative spine is not a generic list of releases; it is a six-chapter progression in which image, year, typography, and atmosphere change together as the visitor scrolls.

Hierarchy:

1. KAF character / key visual recognition.
2. Current chapter and emotional atmosphere.
3. Career milestone and concise fan-authored interpretation.
4. Selected works and visual archive.
5. Navigation, credits, and outbound links.

## 2. Visual system

### Foundation

Use semantic tokens rather than page-local hard-coded colors. Starting values may be tuned after real-image review:

```css
--color-void: #090a14;
--color-surface: #121426;
--color-surface-raised: #1a1d32;
--color-text: #f8f4f7;
--color-text-muted: #aaa6b5;
--color-coral: #ff5d78;
--color-magenta: #e83e8c;
--color-violet: #7b61ff;
--color-cyan: #4fd4ff;
--color-line-on-dark: rgb(255 255 255 / 18%);
```

The final system must preserve semantic roles and contrast, even if exact values change.

### Chapter themes

Each journey chapter exposes local CSS custom properties such as:

```css
--chapter-accent;
--chapter-accent-secondary;
--chapter-glow;
--chapter-surface;
```

Suggested atmosphere:

| Chapter | Direction |
| --- | --- |
| Origin | dark indigo, fragile cyan signal, restrained white |
| Observation | cool blue / violet with a clearer luminous focal point |
| Magic / Rebuilding | magenta-violet, fragmented/reassembled geometry |
| Expansion | high-contrast red/coral with stage-light scale |
| Fable | pale violet, deep ink, dual-identity tension |
| Transcendent Love | coral/pink/cyan convergence, warmer luminous finish |

### Typography and graphics

- Large Mincho-like Japanese display type for emotional chapter titles.
- Clean Japanese sans-serif for summaries and navigation.
- Compact Latin labels, years, and sequence numbers with deliberate tracking.
- Original CSS/SVG signal lines, petals, masks, waveform fragments, and registration marks.
- Avoid a repeated card component as the dominant layout language.
- Avoid excessive glass panels, rounded-pill chrome, and uniform neon glows.

## 3. Information architecture

```text
HomePage
├── SiteHeader
├── HeroSection
├── JourneySection
│   ├── Journey progress / active year
│   ├── Sticky visual stage (desktop)
│   └── Six chapter trigger/content blocks
├── WorksSection
├── GallerySection
├── OfficialLinksSection
└── SiteFooter
```

The page remains a single route. The journey is the longest and most visually important section.

## 4. Stable data contracts

The media/content child owns the source records. Presentation children should be prop-driven and structurally compatible with these contracts rather than importing unavailable future modules during parallel development.

```ts
interface KafMedia {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  credit: string;
  sourceUrl: string;
  licenseSummary: string;
  licenseUrl: string;
  canModify: boolean;
  retrievedAt: string;
}

interface KafJourneyMilestone {
  date: string;
  label: string;
  sourceUrl: string;
}

interface KafJourneyChapter {
  id: string;
  period: string;
  yearLabel: string;
  titleJa: string;
  titleEn: string;
  summary: string;
  milestones: readonly KafJourneyMilestone[];
  theme:
    | 'origin'
    | 'observation'
    | 'rebuild'
    | 'expansion'
    | 'fable'
    | 'transcendent';
  primaryVisual: KafMedia;
  secondaryVisual?: KafMedia;
}
```

Section boundaries:

```tsx
<HeroSection visual={heroVisual} journeyHref="#journey" />
<JourneySection chapters={journeyChapters} />
<WorksSection works={selectedWorks} />
<GallerySection visuals={visualArchive} />
<OfficialLinksSection links={officialLinks} />
```

TypeScript structural typing allows Wave 1 components to define narrow local prop interfaces and remain independently buildable. Wave 2 may consolidate duplicate compatible types only when it improves ownership.

## 5. Scroll and motion architecture

### Desktop

- A tall journey container preserves native document scrolling.
- A sticky stage remains within the viewport while six content trigger regions pass through it.
- `useScroll({ target, offset })` provides journey progress.
- `useTransform` maps progress to low-cost transforms, opacity, progress indicators, and restrained color interpolation.
- Chapter activation may use `useInView` / IntersectionObserver at discrete thresholds; do not push per-frame progress through React state.
- Crossfade visual layers with bounded scale/translation. Keep inactive images non-interactive and hidden from the accessibility tree where appropriate.

### Mobile

- Render chapters in normal document order with each visual adjacent to its copy.
- Use restrained `whileInView`/IntersectionObserver reveals if motion is allowed.
- Do not make the user scroll through a long pinned viewport on small screens.

### Reduced motion

- Use `MotionConfig reducedMotion="user"` and/or `useReducedMotion` for layout decisions.
- Disable parallax, pinned crossfade choreography, and large translations.
- Keep state changes immediate or near-immediate; never hide a chapter because an animation did not run.

### Performance constraints

- Prefer transform and opacity.
- Avoid animated full-screen blur/backdrop-filter and large filter stacks.
- Avoid permanent particle loops.
- Use one primary scroll-progress source for the journey rather than independent global scroll listeners per child.

## 6. Media pipeline

### Source order

1. Piapro works with explicit per-work terms compatible with non-commercial web use.
2. Officially distributed assets with explicit compatible reuse terms.
3. Creator-provided fan works with explicit permission for this project.

Public availability is not permission. Official special-site imagery is a design reference unless a separate compatible license exists.

### Repository shape

```text
src/assets/kaf/
├── ATTRIBUTION.md
├── journey/
│   ├── origin-*.{jpg,png,webp}
│   ├── observation-*.{jpg,png,webp}
│   └── ...
└── gallery/
    └── ...
```

Keep existing assets in place unless the integration task proves a migration is necessary. Avoid breaking the current page while the media PR is independently reviewed.

### Provenance record

Every entry records filename, source page, creator/rightsholder, exact icon/license conditions, modification allowance, required credit, retrieval date, and any original-license text. Treat the record as evidence for this non-commercial context, not as a transferable blanket license.

## 7. Parallel ownership architecture

Wave 1 branches are intentionally additive and disjoint. They must not compose the route.

| Owner | May edit | Must not edit |
| --- | --- | --- |
| Media/content | `src/assets/kaf/**`, `src/content/kaf.ts` and media/content-focused tests | Global styles, HomePage composition, section presentation |
| Visual foundation | `src/styles/tokens.css`, `src/styles/base.css`, `SiteHeader.*`, `HeroSection.*`, focused tests | Content/assets, Journey/Works/Gallery, HomePage composition |
| Scroll journey | `JourneySection.*`, journey-local lifecycle code, focused tests | Content/assets, global styles, HomePage composition |
| Content sections | `WorksSection.*`, `GallerySection.*`, `OfficialLinksSection.*`, `SiteFooter.*`, focused tests | Content/assets, global styles, Journey, HomePage composition |
| Integration | `HomePage.tsx`, legacy HomePage CSS migration/removal, integration/E2E tests, narrow contract fixes | New product direction or unrelated refactors |

When a Wave 1 component needs data, use fixtures in its focused test and accept typed props. Do not reach across ownership boundaries to make a demo page.

## 8. Responsive behavior

### 1440px / desktop

- Full-viewport hero with dominant art.
- Sticky journey stage and large year typography.
- Works/gallery use alternating scale and rhythm rather than uniform tiles.

### 768–1024px / tablet

- Reduce overlap and typography scale.
- Preserve sticky journey only if measured viewport height and content remain usable; otherwise use the linear mode.

### 360–390px / mobile

- Hero composes image and text without covering important face/detail regions.
- Direct, touch-safe section navigation.
- Linear journey with local image/copy pairs.
- Stable one/two-column gallery based on actual aspect ratios.

## 9. Testing and evidence

### Focused Wave 1 tests

- Components render semantic headings, accessible links, alt text, credits, and all passed records.
- Journey renders all chapters and exposes a non-animated readable fallback.
- Media/content tests verify six chapters, unique IDs, required milestone/source fields, and complete media metadata.

### Wave 2 tests

- DOM integration verifies complete page identity and section order.
- Playwright covers 360, 390, 768, 1024, and 1440 widths, anchor navigation, reduced motion, no horizontal overflow, and journey content visibility.
- Visual evidence captures desktop hero, at least two desktop journey states, mobile hero/journey, and reduced-motion rendering.
- Review image loading attributes and built asset sizes.

## 10. Rollback

The design remains a contained frontend migration. Wave 1 PRs are additive except the visual-token change. Wave 2 performs the route switch. If integration fails, revert the Wave 2 composition first to restore the old page while retaining independently reviewable new assets/components; then revert individual Wave 1 PRs only when necessary.
