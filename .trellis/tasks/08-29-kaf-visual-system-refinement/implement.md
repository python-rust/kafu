# Implementation plan

## Ordered work

1. Establish the shared KAF editorial tokens and document defaults in
   `src/styles/tokens.css`, `src/styles/base.css`, and `index.html`.
2. Simplify Header and Hero presentation without changing semantic destinations,
   title identity, media provenance, or loading priority.
3. Refactor `JourneySection.tsx` from scroll-progress-bound layers to one keyed
   active visual, then retune Journey layout/track sizing in its CSS Module.
4. Recompose Works into a compact feature + supporting grid and retune Gallery,
   Official Links, and Footer to the same type/spacing/palette system.
5. Update automated tests only where the intended visual/motion contract changed;
   retain all content, semantics, navigation, loading, and overflow assertions.
6. Measure the resulting desktop height and computed type sizes against the
   baseline recorded in research.
7. Run the complete frontend quality gate and browser matrix.
8. Add an executable frontend visual/motion spec and update its index.

## Validation commands

```bash
mise run format-check
mise run lint
mise run typecheck
mise run test
mise run build
mise run e2e
mise run check
```

Browser measurement script will verify:

- document height is below the 15,693px baseline at 1440×900;
- nav/body/section heading computed sizes meet PRD floors/ceilings;
- sticky Journey stage remains present only in the supported desktop mode;
- no horizontal overflow or essential-content clipping regresses.

## Review gates

- After global tokens: confirm every section consumes semantic roles rather than
  introducing another local palette.
- After Journey refactor: search for `useScroll`, `useTransform`, `MotionValue`,
  and layered scroll-progress code; none may remain in the section.
- Before completion: inspect the full diff for accidental content/media/URL
  changes and confirm `package.json` / lockfile are unchanged.

## Risky files and rollback points

- `JourneySection.tsx` + `JourneySection.module.css`: validate active chapter,
  reduced motion, and sticky release immediately after this step.
- Global tokens: change tokens and all consuming section modules in the same
  coherent batch so no intermediate dark/light contrast mismatch is committed.
- E2E snapshots under `test-results/` are evidence only and must not be committed.

## Completion record

- Shared tokens, Header, Hero, Journey, Works, Gallery, Official Links, Footer,
  and the browser theme color were updated as one coherent visual-system change.
- The Journey refactor removed continuous scroll-linked Motion values while
  retaining desktop sticky, mobile linear, and reduced-motion behavior.
- Browser contracts now cover typography/density, `320px`, and a `200%` root
  font-size preference.
- `mise run check` and 9 Chromium Playwright tests pass.
- The resulting contracts are recorded in
  `.trellis/spec/frontend/visual-system-guidelines.md` and the related index and
  quality guidance.
