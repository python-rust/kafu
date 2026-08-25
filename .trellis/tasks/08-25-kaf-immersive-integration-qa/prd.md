# Integrate and verify immersive KAF homepage

## Goal

After all four Wave 1 PRs are merged into `main`, compose their media/content, visual foundation, Hero/Header, Journey, Works/Gallery, Official Links, and Footer into the final `/` homepage; remove the legacy monolithic implementation; and complete responsive, accessibility, reduced-motion, performance, and browser-level verification.

This task is the only implementation task allowed to edit final `HomePage` composition and legacy HomePage CSS. It must integrate the approved contracts rather than invent a new product direction.

## Preconditions

- `08-25-kaf-media-content-pack` is merged into `main`.
- `08-25-kaf-visual-foundation-hero` is merged into `main`.
- `08-25-kaf-scroll-journey` is merged into `main`.
- `08-25-kaf-editorial-content-sections` is merged into `main`.
- The integration branch is created from that updated `main`, not from the original Wave 1 base.
- `mise run check` is green on the merged baseline or any merge-introduced failure is documented before integration work begins.

## Requirements

### R1 — Compose the final route

Update `src/pages/HomePage/HomePage.tsx` to render, in order:

1. `SiteHeader`;
2. `HeroSection`;
3. `JourneySection`;
4. `WorksSection`;
5. `GallerySection`;
6. `OfficialLinksSection`;
7. `SiteFooter`.

Wire the production typed content/media records into the prop-driven section contracts. Preserve `/` and React Router behavior.

### R2 — Resolve contracts conservatively

- Prefer small adapters/mappers in `HomePage.tsx` or the owning content module over broad type assertions.
- Use TypeScript structural compatibility where possible.
- Consolidate duplicate Wave 1 prop types only when there is a clear stable ownership benefit.
- Do not replace working child implementations with a new monolith.
- Do not introduce new dependencies or unrelated abstractions.

### R3 — Retire the legacy homepage safely

- Remove old inline section markup only after all required identity, content, source links, credits, and disclaimers exist in the new composition.
- Delete or reduce `HomePage.module.css` once its rules are no longer used.
- Remove stale imports, old reveal constants, and obsolete legacy classes.
- Preserve any still-required route/page container rule in the narrowest owner.
- Do not leave dead duplicate page implementations or orphaned CSS.

### R4 — Deliver the parent visual/scroll contract

- First viewport reads as dark/luminous anime / virtual-singer key art, not the previous warm-paper editorial page.
- The six-stage journey is the primary long-form section.
- Desktop uses native-scroll sticky staging with distinct active chapter/year/visual/atmosphere progression.
- Mobile uses a stable linear journey.
- Reduced motion exposes all content without required parallax/pinned choreography.
- Works and gallery are materially image-rich and visually varied.
- Official/unofficial boundaries remain explicit.

### R5 — Responsive visual QA

Review and fix the integrated page at:

- 360 × 800;
- 390 × 844;
- 768 × 1024;
- 1024 × 768;
- 1440 × 900.

At every target:

- no horizontal overflow;
- no clipped essential copy/links/credits;
- no character face/detail obscured unintentionally;
- touch/keyboard targets remain usable;
- chapter and gallery source order remains coherent;
- no sticky trap or excessive blank scrolling.

### R6 — Accessibility and reduced motion

- Preserve semantic landmarks and heading order.
- Ensure one clear page `h1` and stable section headings/anchors.
- Verify meaningful alt text, decorative hiding, link names, focus visibility, contrast, and external-link clarity.
- Avoid duplicate accessibility announcements from desktop/mobile journey representations.
- Under `prefers-reduced-motion: reduce`, remove non-essential motion while retaining all content and navigation.

### R7 — Image loading and performance

- Only the actual hero/LCP visual may use eager loading/high fetch priority.
- Journey/works/gallery visuals below the fold use intentional lazy loading and intrinsic dimensions.
- Verify built image sizes and avoid accidentally shipping unused source assets.
- Keep scroll animation to bounded transform/opacity work and inspect for obvious frame drops/jank.
- Do not add autoplay media, perpetual particle systems, or large animated full-screen filters.

### R8 — Automated and visual evidence

Update/add tests to cover:

- final identity and unofficial status;
- all major section headings/order;
- six journey chapters and representative milestone/source links;
- official CTA and outbound links;
- media credits/disclaimer;
- anchor navigation;
- target viewport overflow safety;
- mobile journey visibility;
- reduced-motion content completeness.

Capture visual evidence for:

- desktop hero;
- at least two distinct desktop journey chapter states;
- desktop Works/Gallery;
- mobile hero and mobile journey;
- reduced-motion desktop rendering.

### R9 — Integration ownership

This task primarily owns:

- `src/pages/HomePage/HomePage.tsx`;
- `src/pages/HomePage/HomePage.module.css` (including deletion/reduction);
- `tests/HomePage.test.tsx`;
- `tests/e2e/home.spec.ts`;
- uniquely named integration test/support files;
- this task's Trellis artifacts.

It may make narrow changes to Wave 1 files only to resolve a demonstrated integration, accessibility, responsive, or performance defect. Every such cross-owner edit must be listed in the final report with the reason. It must not use integration as an excuse for a second broad redesign.

## Acceptance Criteria

- [x] **AC-01**: The integration branch was created from `main` after all four Wave 1 PRs merged.
- [x] **AC-02**: `/` renders Header, Hero, six-stage Journey, Works, Gallery, Official Links, and Footer in the planned order using production typed content.
- [x] **AC-03**: The old monolithic page markup/reveal logic is removed and unused legacy HomePage CSS/imports are deleted.
- [x] **AC-04**: First viewport clearly communicates `花譜 / KAF`, unofficial/non-commercial status, official CTA, and journey continuation at 1440px and 390px.
- [x] **AC-05**: Desktop native scrolling produces distinct chapter/year/visual/atmosphere progression without wheel/touch interception or forced scroll snap.
- [x] **AC-06**: Mobile and reduced-motion modes show all six chapters in a stable readable sequence without a sticky trap.
- [x] **AC-07**: At least nine distinct local visuals are actually used across the page, with at least six from the new verified media set.
- [x] **AC-08**: Works and Gallery are materially image-rich, preserve visible credits/source links, and avoid generic uniform card treatment.
- [x] **AC-09**: No horizontal overflow or clipped essential content exists at 360, 390, 768, 1024, or 1440 target widths.
- [x] **AC-10**: Heading order, landmarks, focus, link names, contrast, alt text, decorative hiding, and unofficial disclaimer pass accessibility review.
- [x] **AC-11**: Only the hero-critical image is eager/high-priority; below-fold visuals are lazy-loaded with intrinsic dimensions.
- [x] **AC-12**: No unclear-rights asset, Live2D/3D runtime, scroll-jacking, autoplay media, runtime scraping, backend, or new animation framework is introduced.
- [x] **AC-13**: DOM/integration tests and Playwright cover the final structure, navigation, viewport matrix, reduced motion, and journey visibility.
- [x] **AC-14**: Required visual evidence is captured and reviewed against the parent design direction.
- [x] **AC-15**: `mise run check` and `mise run e2e` pass on the final branch.

## Out of Scope

- New routes, backend/CMS, dynamic official-content mirroring, audio/video player, Live2D/3D, or a second visual concept.
- Reopening already approved child scope unless integration evidence reveals a real defect.
- Unrelated refactors, dependency upgrades, or general design-system extraction.

## Dependencies

Hard dependency on all four Wave 1 child PRs being merged. This task cannot run in parallel with them.

## Known Environment Note

During planning, Playwright could not launch because the matching Chromium binary was absent from the local cache. If still missing, install the project-pinned Chromium browser before E2E/visual review, then record the command and result.

## Blocking Open Questions

None. Integration choices are constrained by the parent and child contracts; unresolved visual defects should be fixed conservatively in the narrowest owner.
