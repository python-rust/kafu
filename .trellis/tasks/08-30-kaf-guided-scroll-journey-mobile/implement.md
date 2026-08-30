# Implementation plan

## Ordered work

1. Replace the Radix Tabs dependency with `scrollama@3.2.0` and inspect its
   shipped TypeScript contract.
2. Remove `secondaryVisual` from the Journey content/type contract.
3. Rebuild `JourneySection` around a Scrollama lifecycle, one keyed sticky image,
   six in-flow steps, and active progress state.
4. Rebuild Journey CSS for wide side-by-side, compact sticky-top, short
   landscape, and reduced-motion linear layouts.
5. Update unit tests for six semantic articles, one image, Scrollama lifecycle
   behavior, and reduced-motion images.
6. Replace tab-specific E2E tests with downward/upward scroll activation,
   sticky release, mobile trigger, one-image, and no-click-required contracts.
7. Expand the global mobile viewport matrix and inspect all homepage sections.
8. Fix only evidence-backed non-Journey mobile defects.
9. Update frontend SPEC and task research evidence.
10. Run full gates, commit implementation, commit docs/task evidence, archive,
    and record the Trellis journal.

## Validation commands

```bash
pnpm view scrollama version types license repository --json
mise run format-check
mise run lint
mise run typecheck
mise run test
mise run build
mise run e2e
mise run check
python3 .trellis/scripts/task.py validate \
  .trellis/tasks/08-30-kaf-guided-scroll-journey-mobile
git diff --check
```

## Review gates

- Verify that scroll down and scroll up both change the active era.
- Verify that no click/tap is required and no scroll is intercepted.
- Verify exactly one normal-motion Journey image is rendered in the sticky
  stage and no `secondaryVisual` remains in the chapter contract.
- Verify compact offsets are pixel strings and wide offsets are numeric.
- Verify Scrollama cleanup and breakpoint/orientation updates.
- Verify mobile portrait and landscape leave readable space beneath the stage.
- Verify reduced motion has six in-flow images and no animated stage.
- Verify the only dependency replacement is Radix Tabs → Scrollama.
- Verify the existing Gallery, fixed navigation, media, and source contracts.

## Commit plan

1. `feat: guide KAF journey with responsive scrollytelling`
2. `docs: codify responsive Journey scrollytelling`
3. Trellis archive commit
4. Trellis journal commit

## Completion evidence

- Replaced `@radix-ui/react-tabs@1.1.21` with `scrollama@3.2.0`; no other
  intentional dependency changed.
- Removed `secondaryVisual` from the Journey chapter type and all six records.
- Normal motion renders six semantic step articles and exactly one changing
  stage image. Downward activation reached indices `0,1,2,3,4,5`; upward
  activation returned through earlier indices in Chromium.
- Compact setup uses a pixel offset derived from 72% of the layout viewport;
  wide setup uses numeric `0.52`. Portrait → landscape → portrait resizing was
  exercised in one browser session after correcting the package's stale
  declaration (`offsetTrigger`) to the actual runtime `offset()` API.
- Reduced motion and missing observer support use the same linear fallback: no
  changing stage and six in-flow responsive images.
- Measured stage geometry:
  - 320×800: 352px stage, 332px remaining below it;
  - 390×844: 371px stage, 357px remaining;
  - 430×932: 384px stage, 432px remaining;
  - 844×390: 140px stage, 164px remaining.
- All measured layouts reported zero document-level horizontal overflow. The
  existing Header, Hero, Profile, Works, Gallery, Official Links, and Footer
  required no speculative mobile CSS changes.
- Production main bundle changed from the previous Radix build's approximately
  `410.34 kB / 132.88 kB gzip` to `391.54 kB / 126.52 kB gzip`.
- Vitest: 7 files / 26 tests passed. Chromium Playwright: 13 tests passed.
