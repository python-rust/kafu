# Curate KAF journey media and content

## Goal

Create the factual and media source of truth for the immersive KAF homepage: six verified journey chapters, a materially larger set of rights-cleared local visuals, complete provenance, and typed records that presentation components can consume during Wave 2 integration.

This task is additive and data-focused. It must keep the current homepage buildable and must not implement or compose any UI.

## User Value

- Visitors see enough KAF artwork to sustain a visual journey rather than a text-heavy page with three images.
- Career stages and release/live milestones are accurate and link back to official sources.
- Every downloaded image has an auditable reuse basis, creator/source credit, and modification record.
- Other child agents can build prop-driven components against a stable documented data shape without sharing this Worktree.

## Confirmed Facts

- The current content module is `src/content/kaf.ts`.
- The current local KAF media set contains three Piapro-derived images and one provenance file at `src/assets/kaf/ATTRIBUTION.md`.
- The current page imports existing exports from `src/content/kaf.ts`; this branch must preserve those exports until integration replaces the route composition.
- The parent research identified the official KAF history, current `深愛` material, KAMITSUBAKI guidelines, and Piapro per-work licenses as primary evidence.
- Public availability, an official-site image URL, or a general secondary-creation guideline is not sufficient permission to commit a third-party image.

## Requirements

### R1 — Six verified journey chapters

Add typed content for the six parent-defined chapters:

1. `2018 — Origin / Discovery`
2. `2019 — Observation`
3. `2020–2021 — Magic / Rebuilding`
4. `2022–2023 — Expansion`
5. `2024 — Fable / Second Chapter`
6. `2025–2026 — Transcendent Love`

Each chapter must contain:

- a stable unique ID;
- period/year label;
- Japanese and English display title;
- concise fan-authored summary;
- a semantic theme ID compatible with the parent design;
- at least two verified milestones where the available official record supports them;
- official source URLs for every milestone;
- one primary visual and optional secondary visual references.

Do not copy long official biography, news, or campaign text verbatim.

### R2 — Expanded rights-cleared media pack

- The resulting repository must expose at least **nine distinct local KAF-related visuals**, including at least **six newly acquired images**.
- Prefer a target of 10–12 visuals when enough compatible works pass the rights gate.
- Cover hero, all six journey chapters, and a denser gallery/works treatment without forcing every record to use unique art where licensing makes that unsafe.
- Use local files; do not hotlink shipping imagery.
- Prefer the smallest compatible published derivative that remains visually adequate. A file larger than 2 MiB requires a documented reason in the provenance entry.

### R3 — Per-asset acquisition gate

Before adding each third-party image:

1. reopen the original work page;
2. identify the publisher, creator, and rightsholder information shown there;
3. record every license icon and any original-license text;
4. confirm non-commercial fan-site use is compatible;
5. determine whether resize/compression/crop/recolor is allowed;
6. establish the required credit string;
7. download only after the previous checks pass;
8. add the file and provenance record in the same commit.

When any point is unclear, reject the image. Do not substitute an arbitrary official key visual, logo, album cover, screenshot, campaign wallpaper, or social-media repost.

### R4 — Provenance contract

For every shipping third-party visual, keep `src/assets/kaf/ATTRIBUTION.md` synchronized with:

- local filename;
- original work/source page URL;
- direct asset URL when available;
- creator/rightsholder or publishing account;
- displayed license/permission conditions;
- original-license link/text when present;
- required credit;
- whether modification is allowed;
- local derivative/optimization notes;
- retrieval date;
- original dimensions and local dimensions;
- SHA-256 of the committed file.

Retain the explicit unofficial/non-commercial usage boundary.

### R5 — Typed content contract

Extend `src/content/kaf.ts` without breaking current imports. The final module must expose typed records compatible with the parent design's `KafMedia`, `KafJourneyMilestone`, and `KafJourneyChapter` concepts, plus the hero, selected works, gallery, and official-link data required by integration.

- Use explicit readonly arrays/objects where helpful.
- Keep IDs unique and stable.
- Keep source URLs with the facts/media they support.
- Do not introduce runtime fetching, scraping, schema libraries, or server state.

### R6 — Parallel ownership boundary

This task may edit only:

- `src/assets/kaf/**`;
- `src/content/kaf.ts` and, only if clearly justified, additional files under `src/content/` owned solely by this data set;
- a new focused content/media test file whose name does not collide with other children;
- this Trellis task's own artifacts.

It must not edit:

- `src/pages/HomePage/HomePage.tsx`;
- `src/pages/HomePage/HomePage.module.css`;
- `src/styles/**`;
- any Wave 1 presentation component directory;
- existing integration/E2E test files.

## Acceptance Criteria

- [ ] **AC-01**: Typed content defines all six parent-approved chapters in chronological order with unique IDs, labels, summaries, theme IDs, visuals, and official milestone sources.
- [ ] **AC-02**: Every chapter has at least one primary local visual and at least two verified milestones unless the official record genuinely provides fewer, in which case the exception is documented.
- [ ] **AC-03**: The repository contains at least nine distinct local KAF visuals, including at least six newly acquired files.
- [ ] **AC-04**: Every shipping third-party image has a complete synchronized provenance entry including license conditions, modification status, dimensions, retrieval date, and SHA-256.
- [ ] **AC-05**: No asset with unclear or incompatible reuse terms is committed; no arbitrary official-site/campaign/logo/social image is used as a substitute.
- [ ] **AC-06**: Current `src/content/kaf.ts` exports remain compatible enough for the pre-integration homepage to build and its existing tests to run.
- [ ] **AC-07**: A focused automated test verifies chapter count/order, unique IDs, required milestone/source fields, media metadata completeness, and visual references.
- [ ] **AC-08**: Only files inside the documented ownership boundary are changed.
- [ ] **AC-09**: `mise run check` passes in this Worktree.

## Out of Scope

- React section/component implementation.
- Homepage composition, CSS, animation, or visual-token changes.
- Dynamic content synchronization, scraping, CMS, backend, or API work.
- Audio/video/lyrics redistribution.
- Generative-AI KAF artwork.

## Risks and Deferred Items

- The visual target is subordinate to the rights gate. When an attractive candidate has unclear conditions, exclude it and document the rejected candidate only in task notes if useful.
- Exact image placement/cropping belongs to integration; this task records what transformations are permitted and supplies intrinsic dimensions.

## Blocking Open Questions

None.
