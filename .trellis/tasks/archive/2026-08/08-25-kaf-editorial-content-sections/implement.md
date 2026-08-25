# Implementation plan — KAF works and gallery sections

## Branch and ownership

- Recommended branch: `feat/kaf-editorial-sections`.
- Wave: 1 (parallel).
- Exclusive ownership: Works, Gallery, Official Links, Footer component/CSS files and uniquely named focused tests.
- Do not edit HomePage composition, legacy HomePage CSS, content, assets, global styles, Hero/Header, or Journey.

## Steps

1. Read the parent visual-direction/current-audit research and frontend component/directory/quality specs.
2. Define narrow local prop interfaces and production-shaped fixtures.
3. Implement semantic non-animated baselines for all four components.
4. Build the featured/supporting Works composition with image-aware and image-absent fallbacks.
5. Build the controlled Gallery grid with visible credits/source links and stable mobile order.
6. Build large semantic Official Links rows and the explicit unofficial/non-affiliation Footer.
7. Add responsive CSS using semantic token fallbacks and no global edits.
8. Add optional low-cost/reduced-motion-safe reveal/hover behavior only after the baseline is complete.
9. Add focused tests for all user-visible contracts.
10. Review image loading attributes and exclusive file ownership.

## Validation

```bash
mise run check
```

Additional evidence:

- changed-file list proving exclusive ownership;
- fixture render evidence at 360/390/768/1024/1440 where the environment permits;
- verification that every below-fold fixture image has lazy loading and dimensions;
- reduced-motion/no-hover content-completeness review;
- `git diff --check`.

Do not edit `HomePage.tsx` for a committed preview. Any temporary local harness must be removed before commit.

## Stop conditions

- If component styling requires new global tokens, use documented fallbacks and record the desired token for Wave 2 rather than editing `src/styles/**`.
- If production content shape differs, preserve the narrow structural contract and defer adaptation to Wave 2.
- If a carousel/masonry dependency seems necessary, simplify to CSS layout instead.

## Rollback

Remove the additive component/CSS/test files. No route, data, asset, or global-style migration is owned here.
