# Implementation plan — KAF media and content pack

## Phase A — Re-verify evidence

- [x] Reopen the parent media-rights research and every selected candidate's original page.
- [x] Recheck current KAMITSUBAKI secondary-creation guidance and Piapro license-icon meanings.
- [x] Verify the six chapter milestone set against current official KAF/KAMITSUBAKI pages.
- [x] Record rejected candidates when the rejection reason would prevent repeated investigation.

**Gate:** no image is downloaded into the shipping tree before its per-work conditions are understood.

## Phase B — Select and acquire media

- [x] Map one distinct primary visual to each chapter plus hero/gallery needs.
- [x] Reach nine total local visuals and six new acquisitions; stop there rather than add unnecessary rights surface.
- [x] Download the smallest compatible high-quality published derivative.
- [x] Avoid repository-side derivatives; selected piapro display thumbnails require no further optimization.
- [x] Capture source dimensions, local dimensions, retrieval date, transformation notes, and SHA-256.
- [x] Update `src/assets/kaf/ATTRIBUTION.md` with the final asset set.

## Phase C — Extend typed content

- [x] Preserve current exports used by the existing homepage.
- [x] Add stable media records and the six journey chapters.
- [x] Add verified milestones and source links.
- [x] Ensure selected works/gallery/hero records can feed the parent-defined section props.
- [x] Keep layout and animation concerns out of content records.

## Phase D — Focused validation

- [x] Add a uniquely named focused test for chronology/media invariants.
- [x] Confirm all asset imports resolve and the current homepage still renders.
- [x] Review the shipping asset directory against `ATTRIBUTION.md` one-for-one.
- [x] Run `mise run check`.
- [x] Run `git diff --check`.
- [x] Confirm the diff stays inside the task ownership boundary.

## Review checklist

- [x] No official-site image was copied merely because it was accessible.
- [x] No license icon or original-license text was omitted.
- [x] Required author credit is preserved exactly enough for display.
- [x] No asset prohibited from modification was incompatibly transformed.
- [x] No raw oversized source is committed without a documented reason.
- [x] No UI, global-style, homepage-composition, or E2E file changed.

## Validation commands

```bash
mise run check
git diff --check
```

## Rollback points

1. Reject a candidate before download when terms are unclear.
2. Remove an asset, its import/content reference, and its provenance entry as one unit.
3. Revert this additive PR without affecting the current homepage composition.

## Wave 1 review fix

- [x] Add stable work IDs and rights-cleared visuals to the production `selectedWorks` records while preserving the legacy homepage exports.
- [x] Add a production `galleryVisuals` export structurally compatible with the Editorial `GallerySection` contract without changing the component branch.
- [x] Add the verified 2020-03-23 no-audience streamed `不可解(再)` milestone.
- [x] Add a verified `組曲` collaboration milestone in the 2022–2023 Expansion chapter.
- [x] Add the verified `廻花` project milestone in the 2024 Fable / Second Chapter.
- [x] Extend the focused content test to lock the review-required contracts and milestones.
