# Implementation plan — KAF Phenomenon Chapters

## Coordination rule

The parent task is coordination-only. The main agent creates Worktrees, enforces ownership, reviews and merges PRs, and starts the integration task after Wave 1. It does not implement product code.

## Recommended Worktree topology

Use five subagent Worktrees in total:

| Worktree / branch | Task | Start condition |
| --- | --- | --- |
| `feat/kaf-media-content` | `08-25-kaf-media-content-pack` | Immediately from current `main` |
| `feat/kaf-visual-foundation` | `08-25-kaf-visual-foundation-hero` | Immediately from current `main` |
| `feat/kaf-scroll-journey` | `08-25-kaf-scroll-journey` | Immediately from current `main` |
| `feat/kaf-editorial-sections` | `08-25-kaf-editorial-content-sections` | Immediately from current `main` |
| `feat/kaf-immersive-integration` | `08-25-kaf-immersive-integration-qa` | Only after all four Wave 1 PRs are merged |

The integration Worktree should preferably be created only after Wave 1 is merged. If created earlier, it must be hard-reset/rebased onto the updated `main` before work begins; creating it later is safer.

## Wave 0 — Main-agent setup

1. Confirm the planning commit is on `main` and the working tree is clean.
2. Create four Wave 1 Worktrees from the same `main` commit.
3. In each Worktree, start only its assigned child task with Trellis.
4. Give each subagent its child task path and repeat the exclusive file ownership from the child PRD.
5. Require each PR to include focused tests, `mise run check`, and any task-specific validation evidence.
6. Reject unrelated refactors or edits to `HomePage.tsx` / legacy `HomePage.module.css` in Wave 1.

## Wave 1 — Four parallel implementation tasks

### A. Media and content

- Verify official facts and per-work image terms.
- Add the approved local media set and provenance.
- Extend typed content with six journey chapters while keeping the current page buildable.
- Deliver no route or presentation changes.

### B. Visual foundation and hero

- Implement semantic dark/luminous tokens and global body foundation.
- Build prop-driven `SiteHeader` and `HeroSection` components.
- Deliver no route composition or content/assets changes.

### C. Scroll journey

- Build the prop-driven `JourneySection` with desktop sticky choreography and linear mobile/reduced-motion behavior.
- Keep high-frequency values out of React state.
- Deliver no route composition, content/assets, or global-style changes.

### D. Works/gallery/outbound sections

- Build prop-driven Works, Gallery, Official Links, and Footer components.
- Use local CSS Modules and fixtures in focused tests.
- Deliver no route composition, content/assets, journey, or global-style changes.

## Wave 1 merge gate

The main agent reviews each PR for:

1. Exclusive-file ownership compliance.
2. Child acceptance criteria and focused tests.
3. Compatible component/data contracts.
4. No new dependency unless the plan is formally revised.
5. Complete media provenance in the media PR.
6. Green `mise run check` on each branch.

Recommended merge order: media/content, visual foundation, scroll journey, content sections. Ownership is disjoint, so order should not be semantically significant; this order makes data and tokens available early for integration.

After each merge, run a lightweight `mise run check` on `main`. Resolve only merge-introduced issues; do not perform integration design work in the main-agent checkout.

## Wave 2 — Integration and quality

1. Create `feat/kaf-immersive-integration` from the updated `main` containing all four Wave 1 merges.
2. Start `08-25-kaf-immersive-integration-qa` in that Worktree.
3. Compose all new sections in `HomePage.tsx` using the typed content.
4. Remove or replace the legacy monolithic `HomePage.module.css` only after all required behavior is represented by section modules.
5. Resolve structural typing and import contracts with the smallest changes possible.
6. Perform desktop/tablet/mobile/reduced-motion visual and interaction review.
7. Update integration and Playwright tests.
8. Run the full quality gate and capture evidence.

## Final validation commands

```bash
mise run check
mise run e2e
```

When the Playwright browser is absent in a fresh environment, install the project-pinned browser before rerunning E2E:

```bash
pnpm exec playwright install chromium
```

Use direct `pnpm` only for this Playwright-managed browser installation because there is no existing mise task for browser provisioning; normal project validation remains mise-based.

## Final visual review matrix

- 1440 × 900: hero, journey sticky behavior, at least two active chapter states, works/gallery rhythm.
- 1024 × 768: tablet transition and sticky/linear breakpoint.
- 768 × 1024: narrow tablet composition.
- 390 × 844: mobile hero, linear journey, navigation, gallery.
- 360 × 800: minimum-width overflow and touch-target review.
- 1440 × 900 with reduced motion: complete content with no required parallax/crossfade.

## Rollback points

- Before Wave 2: each Wave 1 PR can be reverted independently.
- During Wave 2: preserve the old homepage until the new composition passes DOM tests, then remove legacy composition/styles in a discrete commit where practical.
- If final route integration fails after merge, revert the Wave 2 PR first; do not discard verified media/provenance or independent section work without a separate reason.

## Completion gate

- All five child tasks meet their acceptance criteria.
- Parent cross-child acceptance criteria are checked against the integrated result.
- `mise run check` and `mise run e2e` pass on the final branch.
- The main agent confirms no Wave 1 ownership violations and no unverified third-party media.
- Child tasks and then the parent are archived according to Trellis workflow after their commits/PRs are complete.
