# Implementation plan — KAF scroll journey

## Branch and ownership

- Recommended branch: `feat/kaf-scroll-journey`.
- Wave: 1 (parallel).
- Exclusive ownership: `JourneySection.*`, optional journey-local helpers, and a uniquely named focused test.
- Do not edit shared homepage composition, legacy CSS, global styles, content, assets, or sibling sections.

## Phase A — Contract and semantic skeleton

- [ ] Read parent current-audit, visual-direction, scroll-motion, and review-log research.
- [ ] Define narrow local props compatible with the parent data contract.
- [ ] Render `section#journey`, progress sequence, and six semantic chapter articles using fixtures.
- [ ] Ensure headings, milestones, source links, media credits, and reading order work before animation.

**Gate:** all journey content is complete and testable without scroll choreography.

## Phase B — Desktop native-scroll choreography

- [ ] Add one journey target ref and target-relative `useScroll` progress source.
- [ ] Add bounded sticky visual stage within the section.
- [ ] Divide progress into six ranges and map only meaningful transform/opacity/progress values.
- [ ] Add discrete active-chapter observation without per-frame React state.
- [ ] Keep duplicate visual layers decorative/inactive for accessibility where appropriate.
- [ ] Confirm no wheel/touch/keyboard interception and no forced snap.

## Phase C — Linear and reduced-motion paths

- [ ] Implement conservative width/height guards for sticky mode.
- [ ] Implement normal linear mobile/tablet fallback.
- [ ] Use `useReducedMotion`/CSS media query to remove pinned/parallax/crossfade choreography.
- [ ] Ensure all chapters remain visible if observation or animation does not run.

## Phase D — Performance and accessibility pass

- [ ] Restrict animation primarily to transform/opacity.
- [ ] Bound decoded/painted visual layers and lazy-load below-fold media.
- [ ] Add intrinsic image dimensions and useful alt/source/credit presentation.
- [ ] Verify focus and contrast against local fallback theme values.
- [ ] Confirm no horizontal overflow at component target widths.

## Phase E — Focused tests and quality

- [ ] Test six chapters, semantic order, links, media metadata, and progress labels.
- [ ] Test reduced-motion/linear content completeness without brittle timing assertions.
- [ ] Run `mise run check`.
- [ ] Run `git diff --check`.
- [ ] Review changed files against the exclusive ownership list.

## Validation commands

```bash
mise run check
git diff --check
```

Browser-level sticky thresholds and visual states are validated again in Wave 2 after real media/tokens are integrated.

## Stop conditions

- If a desired effect needs wheel interception, smooth-scroll replacement, or a new dependency, stop and use a native-scroll alternative.
- If fixture/component work requires editing content/assets, keep the prop boundary and document the integration need.
- If sticky behavior is fragile at a viewport, fall back to linear mode rather than forcing it.

## Rollback

Remove the additive journey files/tests. No route, global style, content, or media migration is owned here.
