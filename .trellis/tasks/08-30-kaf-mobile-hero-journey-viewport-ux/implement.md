# Implementation plan

## Ordered work

1. Add Hero ambient-thumbnail markup while preserving the main responsive
   image's priority contract.
2. Replace the mobile `48rem` Hero override with a stable full-viewport
   composition and short-screen variant.
3. Add measured compact Scrollama offset logic using rendered header/stage
   geometry.
4. Convert the mobile Journey stage to a flush, full-bleed media dock and tune
   chapter pacing.
5. Extend unit and Chromium tests for Hero viewport coverage, mobile image
   composition, header/stage seam, remaining reading area, upward/downward
   Scrollama activation, short landscape, and existing whole-site contracts.
6. Run a viewport geometry audit and capture visual evidence.
7. Update frontend SPEC.
8. Run all quality gates, commit implementation, commit SPEC/task evidence,
   archive the task, and record the Trellis journal session.

## Completed implementation

- Added a lazy decorative Hero thumbnail ambience while preserving one
  eager/high-priority responsive foreground.
- Replaced the portrait `48rem` Hero with stable `100svh` art direction and
  short-screen compaction.
- Converted the compact Journey stage into a full-bleed, shadowless dock flush
  with the fixed header.
- Replaced the 72% trigger with measured header+stage pixel geometry and added a
  scoped ResizeObserver for font/layout recalibration.
- Expanded browser coverage to short phones, tall phones, portrait tablet,
  short landscape, 200% text, reduced motion, and existing site interactions.
- Added empirical viewport geometry assertions and screenshots.

## Validation commands

```bash
mise run format-check
mise run lint
mise run typecheck
mise run test
mise run build
mise run e2e
mise run check
python3 .trellis/scripts/task.py validate \
  .trellis/tasks/08-30-kaf-mobile-hero-journey-viewport-ux
git diff --check
```

## Measured browser checks

- `hero.getBoundingClientRect().bottom >= visualViewport.height - 1`
- `about.getBoundingClientRect().top >= visualViewport.height - 1`
- mobile main Hero `object-fit: contain`
- one decorative Hero thumbnail, one eager/high-priority Hero foreground
- `abs(stage.top - header.bottom) <= 1`
- `viewportHeight - stage.bottom >= 180`
- active Journey index changes down and restores up
- no document overflow at all target viewport sizes

