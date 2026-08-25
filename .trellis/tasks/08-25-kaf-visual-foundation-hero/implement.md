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

## Completion evidence

Implemented on `feat/kaf-visual-foundation` without composing the new sections into
`HomePage.tsx` and without modifying content, assets, sibling sections, legacy
`HomePage.module.css`, or E2E specs.

### Token compatibility audit

- Added dark/luminous semantic roles for void, midnight/surfaces, text, coral,
  magenta, violet, cyan, dark rules/grid, focus, glow, typography, and motion.
- Kept the existing paper/ink/KAF/night token values intact because the live
  Wave 1 `HomePage.module.css` still consumes them. The new Header/Hero consume
  the additive dark semantic roles instead.
- `base.css` establishes the near-black document background and global
  `:focus-visible` treatment while retaining the legacy body ink color until
  Wave 2 removes the light homepage shell.

### Component and viewport evidence

- `SiteHeader` and `HeroSection` are prop-driven and import no future content
  module or media pack.
- Browser harness checks were run at 360×800, 390×844, 768×1024, 1024×768, and
  1440×1000, then the harness was deleted before commit.
- All five widths reported document `scrollWidth === clientWidth`.
- Header navigation targets measured 44 CSS px high in the browser matrix.
- At 360×800 and 390×844 the h1, character visual, unofficial status, Official
  CTA, and Journey cue all intersect the first viewport; after the mobile
  refinement both CTAs are fully visible within the viewport bounds.
- A 390×844 browser run with `prefers-reduced-motion: reduce` reported final
  visible states (`opacity: 1`, `visibility: visible`, `transform: none`) for
  the primary Hero content.

### Automated validation

```text
focused Vitest: 4/4 passed
mise run check: passed (Prettier, Oxlint, Vitest 5/5, tsc, Vite build)
mise run e2e: 4/4 passed against the still-live legacy homepage
git diff --check: passed
```

### SPEC sync judgment

No shared `.trellis/spec/` file was changed. The durable implementation rules
used here (global semantic tokens, CSS Modules, narrow typed props, semantic
controls, intrinsic media dimensions, visible focus, and reduced-motion
support) are already covered by the frontend specs. The only new compatibility
decision—preserving legacy light-theme token values until Wave 2 migrates the
route—is intentionally temporary and should not be promoted into a long-lived
coding convention. Keeping shared specs untouched also preserves the Wave 1
exclusive-ownership boundary for parallel PRs.
