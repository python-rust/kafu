# Implementation plan

## Ordered work

1. Add Chinese biography/reference/primer content and extend Journey chapter
   records with Chinese narrative titles and transformation pairs.
2. Update Chinese/Japanese font roles and page metadata.
3. Refactor SiteHeader into a fixed high-contrast orientation bar with active
   section observation.
4. Update Hero promise and actions for a Chinese first-time visitor.
5. Build the four-beat `KafPrimerSection` with desktop sticky state and complete
   mobile/reduced-motion flow.
6. Extend Journey stage/articles with Chinese titles, original Japanese labels,
   and transformation pairs.
7. Localize Works, Gallery, Official Links, Footer, accessibility names, and
   reference disclosures.
8. Update unit and browser tests, then collect computed visual/interaction
   evidence.
9. Update frontend SPEC and run the full quality gates.
10. Commit implementation, commit SPEC/task evidence, archive task, and record
    the Trellis session.

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
  .trellis/tasks/08-30-kaf-cn-storytelling-orientation
```

## Review gates

- Search visible source strings for legacy Japanese UI labels and Traditional
  Chinese interface glyphs.
- Confirm official Japanese proper nouns remain unchanged.
- Confirm `package.json` and lockfile have no runtime dependency delta.
- Confirm only low-frequency viewport state changes were added.
- Confirm reduced-motion content completeness before visual polish review.
- Confirm the fixed header does not obscure anchor headings.

## Rollback boundaries

- Header is isolated to SiteHeader plus global scroll-padding.
- Onboarding is one new section and content record; it can be removed without
  touching Journey.
- Journey additions extend existing data/markup without replacing the observer.

## Completed implementation

- Added Chinese-first content records, four onboarding beats, four official
  profile/reference records, six Journey narrative titles, and six
  `changeFrom -> changeTo` pairs.
- Added fixed SiteHeader scrollspy with a stable dark surface and
  `aria-current="location"`.
- Added `KafPrimerSection` with native observer state, one desktop sticky stage,
  complete mobile/reduced-motion articles, and verified responsive media.
- Localized Hero, Works, Gallery, lightbox, Official Links, Footer, metadata,
  accessible names, and generic work types to Simplified Chinese.
- Preserved authoritative Japanese proper nouns and added `lang="ja"` for
  separately rendered Journey original labels.
- Added a bottom official `资料来源` disclosure while retaining detailed
  milestone sources.
- Added unit/browser regression coverage for localization, header contrast,
  active locations, onboarding progression, Journey transformations, reflow,
  reduced motion, responsive media, and lightbox behavior.

## Validation results

```text
Prettier: passed
Oxlint: 0 warnings / 0 errors
TypeScript: passed
Vitest: 7 files, 26 tests passed
Vite production build: passed
Playwright Chromium: 13 tests passed
mise run check: passed
mise run e2e: passed
```
