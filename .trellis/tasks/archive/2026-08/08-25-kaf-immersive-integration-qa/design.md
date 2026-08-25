# Design — immersive homepage integration and QA

## 1. Integration principle

Wave 2 is a composition and verification task. The four Wave 1 PRs establish data/media, visual foundation, Journey, and lower-page sections. Integration should connect these boundaries, remove the legacy route implementation, and tune only what real cross-component evidence requires.

## 2. Final composition

Recommended `HomePage.tsx` shape:

```tsx
export function HomePage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.page}>
        <SiteHeader navItems={...} />
        <main>
          <HeroSection visual={heroVisual} ... />
          <JourneySection chapters={journeyChapters} />
          <WorksSection works={selectedWorks} />
          <GallerySection visuals={visualArchive} />
          <OfficialLinksSection links={officialLinks} />
        </main>
        <SiteFooter ... />
      </div>
    </MotionConfig>
  );
}
```

Keep page composition declarative. Do not re-embed section markup into `HomePage.tsx`.

## 3. Data adaptation

The media task may expose richer records than presentation components need. Use one of these options in order:

1. Pass structurally compatible records directly.
2. Add small pure mapping functions near `HomePage`.
3. Add a content-owned selector/export when the mapping is semantically reusable across homepage sections.

Avoid:

- broad `as` assertions;
- duplicating production content in JSX;
- modifying several component prop interfaces only to avoid a simple adapter;
- runtime validation/dependencies for trusted local static records.

## 4. Legacy CSS migration

Audit every class imported from `HomePage.module.css`.

Preferred outcome:

- section visuals live entirely in their own CSS Modules;
- `HomePage.module.css` contains only a minimal page/root composition rule or is deleted;
- old hero/about/works/visual/links/footer rules are removed;
- no dead class references remain.

Perform removal only after the integrated DOM/test baseline passes.

## 5. Responsive integration

### Desktop

- Header and hero share a coherent first viewport.
- Journey sticky container begins after a clear transition from hero.
- Sticky stage remains bounded by its section and releases normally into Works.
- Works/Gallery rhythm does not collide with chapter theme backgrounds.

### Tablet

- Confirm the Journey breakpoint based on both width and practical viewport height.
- Reduce large typography/overlap before overflow occurs.
- Ensure header navigation does not cover hero content.

### Mobile

- Direct image/title/copy hierarchy.
- Linear Journey.
- Stable gallery source order.
- No off-screen decorative layers or oversized transforms.
- Footer credits/disclaimer remain readable.

## 6. Accessibility integration

- Exactly one `h1` for page identity.
- Header navigation labels match actual final IDs (`#journey`, `#works`, `#gallery`/`#visuals`, `#links`).
- Section headings progress logically.
- External links include clear visible context; opening in a new tab must not be the only information conveyed.
- Desktop/mobile duplicate visual layers do not create duplicate alt/credit announcements.
- Focus is not hidden behind a fixed/sticky header; use `scroll-margin-top` where needed.
- Reduced-motion mode retains complete content.

## 7. Performance review

- Inspect production build output for image files and unused duplicates.
- Ensure only the hero image has `loading="eager"` / high fetch priority.
- Ensure other images have intrinsic dimensions and `loading="lazy"` where below the fold.
- Observe Journey in the target desktop browser for obvious frame drops; remove expensive animated filters/large paint areas before changing architecture.
- Avoid rendering all high-resolution visual layers at full opacity/paint cost simultaneously.

## 8. Testing strategy

### Vitest / Testing Library

Update `tests/HomePage.test.tsx` to verify user-visible integration rather than CSS:

- KAF/unofficial identity;
- section headings/order;
- six journey chapter labels;
- official CTA/links;
- credits/disclaimer;
- representative visual alt text.

Focused Wave 1 tests remain responsible for component-level contracts.

### Playwright

Extend `tests/e2e/home.spec.ts` to cover:

- desktop and mobile smoke;
- anchor navigation;
- no horizontal overflow across the viewport matrix;
- scrolling Journey exposes early/middle/final chapter content;
- sticky stage releases into Works;
- reduced-motion context still displays every chapter;
- image loading/visibility smoke where stable.

Avoid brittle assertions on exact animation timing or pixel-perfect coordinates. Use section visibility, stable IDs, scroll positions, and bounded layout assertions.

### Visual evidence

Capture full-page and focused screenshots after fonts/images settle. Record viewport and reduced-motion mode with each artifact.

## 9. Cross-owner fixes

When integration reveals a defect in a Wave 1 file:

1. Identify whether it is a contract, responsive, accessibility, or performance defect.
2. Make the smallest fix in the owning file.
3. Update the owning focused test when observable behavior changes.
4. List the cross-owner file/reason in the final report.

Do not rewrite a whole child component for stylistic preference.

## 10. Rollback

Keep the old route implementation until the new composed page passes initial DOM tests. The safest rollback unit is the Wave 2 PR: reverting it restores the prior page while leaving approved additive Wave 1 assets/components available for correction.
