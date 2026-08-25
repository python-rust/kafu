# Implementation plan — KAF visual foundation and hero

## Branch and ownership

- Recommended branch: `feat/kaf-visual-foundation`.
- Wave: 1 (parallel).
- Exclusive ownership: global `tokens.css`/`base.css`, `SiteHeader.*`, `HeroSection.*`, and uniquely named focused tests.
- Do not edit route composition, legacy HomePage CSS, content, assets, or other sections.

## Steps

1. Read the parent visual-direction and current-implementation research plus frontend component/directory/quality specs.
2. Audit all current token consumers before renaming/removing any variable.
3. Add/evolve semantic dark/luminous tokens while preserving aliases needed by the old page.
4. Update body/root defaults for the new dark foundation without introducing page-specific layout globally.
5. Build a semantic prop-driven `SiteHeader` with direct anchor navigation.
6. Build a prop-driven `HeroSection` using representative fixtures only in tests.
7. Add restrained Motion reveal with reduced-motion final-state behavior.
8. Add original lightweight decorative geometry and verify it is excluded from the accessibility tree.
9. Add focused DOM tests.
10. Review responsive CSS at minimum component widths and confirm no ownership violations.

## Validation

```bash
mise run check
```

Additional evidence:

- token compatibility audit listing preserved legacy variables;
- focused component renders at 360, 390, 768, 1024, and 1440 widths where the local environment permits;
- reduced-motion render evidence;
- `git diff --check`;
- changed-file list proving exclusive ownership.

Do not modify `HomePage.tsx` to create a preview. A temporary uncommitted local harness is acceptable only if removed before commit.

## Stop conditions

- If a global token change makes the legacy page unreadable, preserve an alias/compatibility value and defer removal to Wave 2.
- If the hero requires content/media changes, keep the prop contract and use fixtures; document the integration need instead of crossing ownership.
- If animation requires a new dependency, stop and use existing Motion/CSS capabilities.

## Rollback

Revert token/base changes and remove the additive section/test files. No data or media migration is owned here.
