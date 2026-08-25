# Implementation plan — KAF media and content pack

## Phase A — Re-verify evidence

- [ ] Reopen the parent media-rights research and every candidate's original page.
- [ ] Recheck current KAMITSUBAKI secondary-creation guidance and Piapro license-icon meanings.
- [ ] Verify the six chapter milestone set against current official KAF/KAMITSUBAKI pages.
- [ ] Record rejected candidates when the rejection reason would prevent repeated investigation.

**Gate:** no image is downloaded into the shipping tree before its per-work conditions are understood.

## Phase B — Select and acquire media

- [ ] Map one primary visual to each chapter plus hero/gallery needs.
- [ ] Reach at least nine total local visuals and at least six new acquisitions; prefer 10–12 when compatible.
- [ ] Download the smallest compatible high-quality source/derivative.
- [ ] Create optimized derivatives only where modification is allowed.
- [ ] Capture source dimensions, local dimensions, retrieval date, transformation notes, and SHA-256.
- [ ] Update `src/assets/kaf/ATTRIBUTION.md` in the same commit as each final asset set.

## Phase C — Extend typed content

- [ ] Preserve current exports used by the existing homepage.
- [ ] Add stable media records and the six journey chapters.
- [ ] Add verified milestones and source links.
- [ ] Ensure selected works/gallery/hero records can feed the parent-defined section props.
- [ ] Keep layout and animation concerns out of content records.

## Phase D — Focused validation

- [ ] Add a uniquely named focused test for chronology/media invariants.
- [ ] Confirm all asset imports resolve and the current homepage still renders.
- [ ] Review the shipping asset directory against `ATTRIBUTION.md` one-for-one.
- [ ] Run `mise run check`.
- [ ] Run `git diff --check`.
- [ ] Confirm the diff stays inside the task ownership boundary.

## Review checklist

- [ ] No official-site image was copied merely because it was accessible.
- [ ] No license icon or original-license text was omitted.
- [ ] Required author credit is preserved exactly enough for display.
- [ ] No asset prohibited from modification was incompatibly transformed.
- [ ] No raw oversized source is committed without a documented reason.
- [ ] No UI, global-style, homepage-composition, or E2E file changed.

## Validation commands

```bash
mise run check
git diff --check
```

## Rollback points

1. Reject a candidate before download when terms are unclear.
2. Remove an asset, its import/content reference, and its provenance entry as one unit.
3. Revert this additive PR without affecting the current homepage composition.
