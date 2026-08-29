# Implementation plan

## Ordered execution

1. Record the local copy/layout baseline and external research in `research/`.
2. Add `yet-another-react-lightbox` at the researched current version through
   the mise-managed pnpm toolchain.
3. Add page-local `MediaCredit` and `SectionHeading` components with focused
   tests through their consuming sections.
4. Simplify HomePage/Header/Hero copy and props; remove repeated status,
   metadata, eyebrow, and English action labels.
5. Simplify Journey rendering while preserving observer/sticky mechanics,
   chapter order, images, summaries, milestones, and sources.
6. Normalize Works into one featured pattern plus one repeated supporting-card
   pattern; remove rhythm/index/template labels.
7. Rebuild Gallery as active theatre + thumbnail rail + lazy open-source
   lightbox, including reduced-motion and index synchronization.
8. Simplify Official Links and Footer, leaving the single legal disclaimer.
9. Replace the pale global/section palette with the approved theatrical
   image-led system and remove remaining repeated glow/template motifs.
10. Update unit/integration/E2E tests for copy absence, Japanese navigation,
    gallery selection/lightbox behavior, text floors, reflow, image loading,
    anchors, sticky release, and sources.
11. Run full review, measure the final DOM, and fix all findings.
12. Update frontend SPEC and directory/component contracts.
13. Commit work, archive the task, and record the session.

## Validation commands

```bash
mise run format-check
mise run lint
mise run typecheck
mise run test
mise run build
mise run check
mise run e2e
git diff --check
```

## Browser assertions

- 320, 360, 390, 768, 1024, and 1440 widths remain free of document overflow
  and essential-content clipping.
- 200% root text remains usable.
- Header Japanese anchors navigate to the same IDs.
- Journey active stage still advances and releases before Works.
- Gallery exposes eight thumbnail buttons, one selected item, and one stage.
- Thumbnail selection updates stage content.
- Stage opens the selected lightbox slide.
- Arrow navigation updates the active slide and Escape closes the lightbox.
- Reduced motion preserves all content and disables nonessential stage
  transitions.
- Hero remains the only eager/high-priority page image before lightbox open.
- Visible recurring text floor is 14px, body floor 16px, heading ceiling 72px.

## Review gates

- Search rendered/source strings for every banned label listed in the PRD.
- Search source for `eyebrow`, `chapterTitleEn`, `data-rhythm`, decorative
  sequence/index rendering, and section-intro implementation narration.
- Confirm the only new runtime dependency is the selected lightbox.
- Confirm no asset, provenance, factual content URL, or intrinsic dimensions
  changed accidentally.
- Confirm shared components are used by at least two independent sections and
  do not expose APIs that invite generic filler copy.

## Risky files and rollback points

- `GallerySection.tsx` / lightbox integration: validate focus, keyboard, swipe,
  and initial bundle behavior before proceeding to visual polish.
- `tokens.css` plus all section CSS: commit as one coherent visual-system unit.
- Header/Hero prop removal: update tests and all call sites in the same step.
- Do not commit baseline screenshots or generated Playwright evidence.

## Completion record

- [x] Local baseline and external research recorded.
- [x] React-19-compatible lightbox dependency added through mise/pnpm.
- [x] `MediaCredit` and `SectionHeading` extracted for real cross-section reuse.
- [x] Header/Hero copy and props simplified.
- [x] Journey template copy removed while observer/sticky behavior remained.
- [x] Works normalized to one featured and one repeated supporting pattern.
- [x] Gallery rebuilt as active theatre, eight-image rail, and lazy lightbox.
- [x] Official links and footer reduced to direct content and one disclaimer.
- [x] Warm dark KAF visual system applied without neon/glass/template effects.
- [x] Unit, integration, and Chromium regression tests updated and passing.
- [x] Frontend content, visual, component, directory, and quality specs updated.
- [x] Full review found no accidental media, provenance, fact, URL, or intrinsic
      dimension changes.
