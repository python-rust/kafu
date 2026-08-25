# Implementation plan — immersive homepage integration and QA

## Branch and start condition

- Recommended branch: `feat/kaf-immersive-integration`.
- Wave: 2 (sequential).
- Create this Worktree from updated `main` only after all four Wave 1 PRs are merged.
- Do not start from the original Wave 1 base.

## Phase A — Verify merged baseline

1. Confirm the four child commits/PRs are present in branch history.
2. Confirm the task is started in the integration Worktree.
3. Read all child PRDs/designs and inspect their exported props/content.
4. Run:

```bash
mise run check
```

5. If the merged baseline fails, distinguish merge-contract failures from pre-existing/local environment failures before editing.

## Phase B — Compose without deleting legacy first

1. Build small typed adapters for production content where needed.
2. Replace the `HomePage` return tree with the new section composition while retaining the old file/history for easy diff review.
3. Align navigation IDs and section IDs.
4. Verify all six chapters, works, gallery visuals, official links, credits, and disclaimers render.
5. Run focused HomePage tests before removing old CSS.

## Phase C — Remove legacy implementation

1. Delete old inline hero/about/works/visual/links/footer markup and mount-only reveal constants/imports.
2. Audit `HomePage.module.css` references.
3. Delete unused legacy rules or the whole module; retain only a minimal page composition rule when genuinely needed.
4. Remove dead imports and duplicate content paths.
5. Confirm no unused old asset references remain unintentionally.

## Phase D — Integrated UX and accessibility fixes

1. Review first viewport at desktop/mobile.
2. Review desktop Journey early/middle/final transitions and section release.
3. Review mobile/tablet linear/sticky breakpoint behavior.
4. Review Works/Gallery image rhythm and credit/source visibility.
5. Review heading order, landmarks, focus, anchor offsets, alt text, duplicate announcements, contrast, and reduced motion.
6. Make only narrow evidence-based cross-owner fixes and update focused tests when necessary.

## Phase E — Performance and media audit

1. Confirm the hero/LCP image is the only eager/high-priority visual.
2. Confirm below-fold images use lazy loading and intrinsic dimensions.
3. Inspect production build output for duplicate/unused/oversized image assets.
4. Observe scrolling for large paint/filter bottlenecks and bound visible image layers.
5. Reconcile actual shipping media against `ATTRIBUTION.md`; no orphaned or untracked image may remain.

## Phase F — Automated and visual verification

Update DOM and Playwright tests, then run:

```bash
mise run check
mise run e2e
```

If Chromium is missing:

```bash
pnpm exec playwright install chromium
mise run e2e
```

Capture the parent-required visual matrix:

- 1440 × 900 hero;
- 1440 × 900 early and late Journey states;
- 1440 × 900 Works/Gallery;
- 390 × 844 hero and linear Journey;
- 1440 × 900 reduced-motion rendering;
- overflow checks at 360, 390, 768, 1024, and 1440.

## Final report evidence

- Wave 1 merge commits/PRs present in the base.
- Changed-file list, with every cross-owner change explained.
- Image count and actual usage count.
- Rights/provenance reconciliation result.
- `mise run check` output.
- `mise run e2e` output.
- Screenshot/evidence paths and viewport/motion mode.
- Any unverified item or remaining risk.

## Stop conditions

- Do not begin if any Wave 1 PR is missing from the branch.
- Do not substitute an unclear-rights image to satisfy a visual gap.
- Do not add a new dependency or redesign the section architecture without returning the affected planning task to review.
- If browser tooling is unavailable, repair/provision the pinned Playwright browser rather than declaring visual behavior verified from source alone.

## Rollback

Keep integration changes in a distinct PR. Reverting the Wave 2 PR should restore the previous route composition while retaining the independently reviewed Wave 1 components/media for follow-up correction.

## Completion evidence — 2026-08-25

- Baseline confirmed at `50903df3540d81c58fd6b634bae014a1f081d956`, containing Wave 1 merge commits `a31a392`, `3d92811`, `f32e1ba`, and `50903df`; the pre-integration `mise run check` passed with 6 test files / 21 tests.
- Final `/` composition is `SiteHeader` → `HeroSection` → `JourneySection` → `WorksSection` → `GallerySection` → `OfficialLinksSection` → `SiteFooter`, wired directly to `heroMedia`, `journeyChapters`, `selectedWorks`, `galleryVisuals`, and `officialLinks`.
- Legacy `HomePage.module.css` was deleted in full, old inline markup/mount-only reveal code was removed, and the temporary global legacy body text color was switched to `--color-text`.
- Browser QA found and fixed one real cross-owner mobile defect in `GallerySection.module.css`: `gap: 3.5rem` at ≤480px also enlarged the 12-column grid's column gap, producing 616px-wide clipped figures under `overflow: clip`; the rule is now `row-gap: 3.5rem`, with an E2E regression that checks essential element bounding boxes in addition to document scroll width.
- The document `theme-color` was reconciled from the legacy paper `#f3efe8` to the final void `#060711` and is covered by E2E.
- Responsive browser coverage passed at 360×800, 390×844, 768×1024, 1024×768, and 1440×900. The first two use 44px mobile navigation targets and linear Journey; 768×1024 is linear; 1024×768 and 1440×900 use the guarded sticky stage. Sticky release into Works is verified.
- Accessibility review confirms one `h1`, semantic banner/main/contentinfo landmarks, stable anchors, visible keyboard focus, descriptive link names, meaningful media alt text, an aria-hidden desktop Journey stage, and complete reduced-motion content. Core dark semantic tokens have at least 5.29:1 contrast on `--color-surface` and at least 5.78:1 on `--color-void`.
- Shipping media reconciliation: 9 local KAF visuals, 9 attribution sections, all SHA-256 values matched, all recorded local dimensions matched, and all 9 visuals are actually referenced by the final rendered page. Six files were introduced by the Wave 1 media PR. No orphan or unclear-rights shipping asset was found.
- Loading audit: exactly one image (Hero) is `loading="eager"` + `fetchpriority="high"`; all other rendered images are `loading="lazy"` with intrinsic width/height. Final local media payload is 2.59 MiB, with the two largest below-fold PNGs remaining lazy-loaded.
- Final `mise run check` passed: Prettier PASS; Oxlint 0 warnings / 0 errors; Vitest 6 files / 22 tests PASS; TypeScript PASS; Vite build PASS. Final build reports 45.46 kB CSS (9.52 kB gzip) and 389.11 kB JS (125.38 kB gzip).
- Final `mise run e2e` passed 7/7 Chromium tests. Matching Chromium was already installed; no browser install command was needed.
- Visual evidence is retained under `test-results/kaf-integration-visual-evidence/`: 1440×900 Hero, Journey early/middle/final, Works, Gallery, reduced-motion, plus 390×844 Hero and linear Journey.
