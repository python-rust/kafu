# Current implementation audit

## Scope

Local code review performed on 2026-08-25 before planning the redesign.

## Findings

### Motion is hero-only

`src/pages/HomePage/HomePage.tsx` defines two mount-time reveal configurations and applies them only to the hero copy and hero figure. The About, Selected Works, Visual Archive, Official Links, and footer sections are static. There is no `useScroll`, `useTransform`, `useInView`, `whileInView`, or journey-state behavior.

### Image density is low

`src/content/kaf.ts` imports three local images:

- one hero visual;
- two visual-archive entries.

Selected Works is text-led and does not provide an image field. The page therefore loses visual momentum after the hero.

### Visual system is deliberately editorial

`src/styles/tokens.css` uses warm paper colors (`#f3efe8`, `#ebe4df`) with charcoal, muted rose, lavender, and blue. This matches the previous `KAF Editorial Observatory` brief but not the new immersive anime / virtual-singer objective.

### Current ownership is not parallel-friendly

- `HomePage.tsx`: approximately 344 lines.
- `HomePage.module.css`: approximately 1,077 lines.

Four developers editing those files concurrently would create predictable conflicts. The redesign should introduce additive section modules first and leave final composition/migration to a dedicated integration branch.

### Current stack is sufficient

- React 19.
- TypeScript 5.9.
- Motion 13.
- CSS Modules.
- Vitest / Testing Library.
- Playwright.

No new animation framework, UI library, state library, backend, or runtime content layer is needed.

## Visual-audit limitation

A full-page Playwright screenshot was attempted during planning, but the installed Playwright package did not have its matching Chromium binary in the local cache. The source-level findings above are direct evidence; the integration task must provision the pinned browser when necessary and complete the visual matrix before acceptance.
