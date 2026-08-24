# Implementation Plan — anime-style KAF fan site

## Phase A — Asset and content gate

- [x] Re-open the KAMITSUBAKI secondary-creation guideline and the relevant per-asset source pages immediately before acquisition; do not rely on remembered terms.
- [x] Select candidate KAF visuals from piapro or another explicitly permitted source.
- [x] Verify the exact license/permission of each candidate against the intended non-commercial fan-site use.
- [x] Reject any asset whose terms are unclear, prohibit the needed modification, or are limited to another use/campaign.
- [x] Download only cleared assets and create `src/assets/kaf/ATTRIBUTION.md` with filename, source, creator/rightsholder, permission/license note, credit string, and retrieval date.
- [x] Verify current/recent KAF release facts from official KAF/KAMITSUBAKI pages; select at least four works for this iteration.

**Gate:** no visual layout implementation proceeds with unverified third-party imagery.

## Phase B — Content and design tokens

- [x] Add a typed local content module for profile copy, selected works, visuals, and official links.
- [x] Extend `src/styles/tokens.css` with semantic editorial/KAF palette and typography roles needed by the chosen art direction.
- [x] Keep exact palette values project-authored and tuned against the selected artwork; do not copy an official site's CSS values.
- [x] Define reusable section spacing, frame/rule, and motion timing only where repeated use justifies a token.

## Phase C — Homepage structure

- [x] Refactor `HomePage` into clear homepage-owned sections without introducing a generic component library.
- [x] Implement compact header + anchor navigation.
- [x] Implement illustration-led Hero with `花譜 / KAF`, unofficial fan-project identity, short introduction, and official-site CTA.
- [x] Implement About KAF section with concise fan-written copy and official source link.
- [x] Implement Selected Works with at least four curated items and an intentional current/recent highlight.
- [x] Implement Visual Archive with at least two cleared secondary visuals plus attribution presentation where required.
- [x] Implement Official Links and footer disclaimer/credits path.
- [x] Ensure no Live2D/Cubism/runtime puppet abstraction or animation returns.

## Phase D — Visual refinement

- [x] Apply asymmetric editorial grids, Mincho/sans hierarchy, observation numbering, fine rules, and restrained KAF accent colors.
- [x] Add only project-original decorative geometry (petal/ink/line motifs) where needed; keep it subordinate to the imagery.
- [x] Use existing `motion` for restrained reveal/crop transitions.
- [x] Add `prefers-reduced-motion` behavior.
- [x] Verify text never obscures important character/illustration regions at desktop/tablet/mobile breakpoints.
- [x] Explicitly reject generic neon/glass dashboard styling during visual review.

## Phase E — Responsive and accessibility pass

- [x] Verify 360px, 390px, 768px, 1024px, and 1440px layouts.
- [x] Remove horizontal overflow and accidental desktop-overlap behavior on narrow viewports.
- [x] Verify nav/touch targets and keyboard focus.
- [x] Add meaningful alt text for content imagery and `aria-hidden` for decorative geometry.
- [x] Confirm important content does not depend on hover.
- [x] Ensure section anchors do not land underneath the header in an unusable position.

## Phase F — Image loading/performance pass

- [x] Ensure only hero-critical media is eager/high-priority.
- [x] Lazy-load below-fold visuals.
- [x] Set stable image dimensions/aspect ratios to reduce layout shift.
- [x] Use viewport-appropriate local image variants when source terms allow transformation.
- [x] Inspect production bundle and page loading behavior; avoid adding an image/UI dependency unless a measured blocker requires it.

## Phase G — Tests

- [x] Update `tests/HomePage.test.tsx` for the new KAF/unofficial identity, major section structure, selected works, and official links.
- [x] Update `tests/e2e/home.spec.ts` for desktop visual/content smoke and anchor navigation.
- [x] Add a mobile Playwright scenario covering visibility and horizontal overflow.
- [x] Add reduced-motion coverage if practical without brittle animation-timing assertions.

## Phase H — Quality and review gates

- [x] Search tracked files for Live2D/Cubism/puppet residue.
- [x] Review every committed third-party image against `src/assets/kaf/ATTRIBUTION.md`; no orphan asset is allowed.
- [x] Run `mise run check`.
- [x] Run `mise run e2e`.
- [x] Run `git diff --check`.
- [x] Perform desktop + mobile visual review against the task's `KAF Editorial Observatory` direction.
- [x] Confirm the page is clearly unofficial and does not visually impersonate the official KAF/KAMITSUBAKI sites.

## Expected change surface

Likely touched/created paths:

- `src/pages/HomePage/HomePage.tsx`
- `src/pages/HomePage/HomePage.module.css`
- `src/pages/HomePage/sections/` (only if section extraction improves readability)
- `src/content/kaf.ts`
- `src/assets/kaf/`
- `src/styles/tokens.css`
- `tests/HomePage.test.tsx`
- `tests/e2e/home.spec.ts`
- `.trellis/spec/frontend/*` only if implementation establishes a durable new project convention worth preserving

## Explicit non-goals during implementation

- Do not add backend/CMS/data fetching.
- Do not add routes just to make the site feel larger.
- Do not add a global component library.
- Do not add a state-management library.
- Do not scrape official content at runtime.
- Do not download/reuse an asset before its terms are verified.
- Do not ship AI-generated KAF character art.

## Rollback points

1. **After asset gate:** if adequate rights-cleared imagery cannot be found, stop and revise the visual plan rather than quietly using uncertain official images.
2. **After Hero/About:** visual review can reject the art direction before the rest of the page is expanded.
3. **Before commit:** all third-party assets and provenance records must be reviewed as one unit; remove both together if an asset is rejected.

## Validation commands

```bash
mise run check
mise run e2e
git diff --check
```

Additional implementation-time searches should verify that no Live2D/Cubism/puppet residue has returned and that every file under `src/assets/kaf/` is represented in the attribution record.
