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
