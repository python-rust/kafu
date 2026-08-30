# Implementation plan

## Ordered work

1. Pin `@radix-ui/react-tabs@1.1.21` and verify the lockfile contains no other
   intentional runtime addition.
2. Replace Hero explanatory props/copy with the factual role line and direct
   profile/works actions.
3. Replace `KafPrimerBeat[]` and the sticky primer section with a static
   `KafProfile` composition and factual profile attributes.
4. Simplify Journey content records by removing subtitle/change-pair fields and
   expanding factual narrative copy.
5. Rebuild Journey around controlled Radix Tabs, previous/next controls,
   responsive visual collage, and Motion entry transitions.
6. Add `狂想β` to representative works and adjust supporting layout for four
   works.
7. Update unit tests and Playwright contracts for copy absence, profile facts,
   tab semantics/keyboard, mobile containment, reduced motion, and five albums.
8. Run visual/interaction review at 320, 390, 768, 1024, and 1440 widths.
9. Update frontend SPEC with copy, profile, era-tabs, dependency, and complete
   discography rules.
10. Run full quality gates, commit implementation, commit SPEC/task evidence,
    archive the task, and record the Trellis session.

## Validation commands

```bash
pnpm view @radix-ui/react-tabs version peerDependencies --json
mise run format-check
mise run lint
mise run typecheck
mise run test
mise run build
mise run e2e
mise run check
python3 .trellis/scripts/task.py validate \
  .trellis/tasks/08-30-kaf-editorial-copy-era-theatre
git diff --check
```

## Review gates

- Search production source for every banned slogan fragment.
- Confirm `package.json` adds only `@radix-ui/react-tabs`.
- Confirm the third album links to the official `狂想β` page and does not use an
  unverified album-cover image.
- Confirm no `IntersectionObserver`, sticky stage, or viewport-height tracks
  remain in the Profile or Journey sections.
- Confirm official Japanese names still appear in actual titles/milestones.
- Confirm Radix tab keyboard behavior in Chromium, not only DOM unit tests.
- Confirm hidden/inactive panels do not create duplicate visible headings.
- Confirm 200% text and 320px layouts retain every trigger/control.

## Commit plan

1. `feat: refine KAF editorial copy and era theatre`
2. `docs: codify artist-site copy and era navigation`
3. Trellis archive commit
4. Trellis journal commit

## Completion evidence

- Added only `@radix-ui/react-tabs@1.1.21`; package peer metadata includes React
  19 and no second UI/animation runtime was introduced.
- Replaced the four-beat sticky primer with `KafProfileSection` and a factual
  `KafProfile` record.
- Replaced Journey scroll observation/sticky tracks with six controlled Radix
  tabs, one active panel, previous/next controls, and existing Motion entrance
  transitions.
- Restored `狂想β` at 2023-03-08 with the official discography URL and an
  intentional typographic fallback instead of an unverified cover.
- Production-source scans return no banned slogan fragments, old primer fields,
  or Journey change-pair fields.
- Vitest: 7 files / 26 tests passed.
- Chromium Playwright: 12 tests passed, including Arrow/Home/End, tab/panel
  association, 320px, 200% text, reduced motion, Gallery, and responsive media.
- Browser layout review measured 6,966px total height at 1440×900 and 8,367px
  at 390×844, down from the previous iteration's approximately 11,091px and
  15,435px while adding the missing album. Document overflow remained 0px.
- Visual evidence is stored under
  `test-results/kaf-round5-editorial-era-theatre/` (ignored by Git).
