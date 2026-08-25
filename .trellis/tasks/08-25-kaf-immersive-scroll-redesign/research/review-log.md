# Review log — immersive KAF scroll redesign

Research and review date: 2026-08-25.

This log records the required multi-round review that produced the parent/child task structure. It is a decision record, not an implementation artifact.

## Round 1 — Product and narrative review

### Inputs

- Current `HomePage.tsx`, `HomePage.module.css`, `src/content/kaf.ts`, and the three shipping KAF images.
- Official KAF history pages and the previous archived `KAF Editorial Observatory` brief.
- User feedback that color/style are not sufficiently anime-oriented and that scrolling does not reveal a staged character history.

### Options reviewed

1. Keep the current information architecture and only retune colors/images.
2. Add independent reveal animations to the existing About/Works/Gallery sections.
3. Replace the page's narrative spine with a chronological visual journey, then place works/gallery/outbound content after it.

### Decision

Choose option 3.

The first two options would improve surface polish but would not solve the product problem: the page would remain a static editorial index. The official history material already provides a credible chronological spine, so the redesign becomes six independently legible chapters from 2018 through the 2026 `深愛` period.

### Fixed product consequences

- The journey is the primary homepage experience, not a decorative insert.
- Each downward stage must communicate a period, visual atmosphere, concise interpretation, milestones, and source links.
- The current About/Works/Visuals flat sequence is superseded, though selected works/gallery/official links remain as supporting sections.

## Round 2 — Visual, media, and motion review

### Inputs

- KAF 3rd Anniversary and current `深愛` official special-site patterns.
- TV anime `KAMITSUBAKI CITY UNDER CONSTRUCTION` official site.
- Current KAF exhibition framing, which explicitly layers seven years of activity and present expression.
- Piapro KAF account and per-work licensing model.
- Motion for React scroll/reduced-motion documentation and browser animation-performance guidance.

### Options reviewed

1. Preserve the warm ivory paper palette and add more decoration.
2. Use a generic permanent dark-neon/glass anime dashboard.
3. Use a dark spatial foundation with chapter-scoped luminous palettes, image-led collage, large Japanese type, and controlled signal/petal/line motifs.

### Decision

Choose option 3.

The paper palette is the defining visual language of the rejected version. A generic neon/glass system would be recognizably “anime UI” but not recognizably KAF. The chosen direction uses KAF imagery as the focal point and changes atmosphere by era rather than applying one effect everywhere.

### Motion decision

- Preserve native browser scroll.
- Use scroll-linked progress for the desktop journey and scroll-triggered entrances for discrete content.
- Use the existing `motion` package; do not add GSAP, Lenis, ScrollTrigger, or a smooth-scroll runtime.
- Prefer transform/opacity and a bounded number of active image layers.
- Render a normal linear sequence on mobile/reduced-motion paths.

### Media decision

- At least nine distinct local visuals, including at least six new acquisitions; target 10–12 when compatible.
- Every asset passes a per-work rights/provenance gate.
- Official special-site images remain references unless their own reuse terms are compatible.

## Round 3 — Engineering and Worktree parallelization review

### Local constraint

The current homepage is concentrated in one large TSX file and one large CSS Module. Splitting implementation by visible page section while allowing every branch to edit those files would create immediate merge conflicts and ambiguous ownership.

### Options reviewed

1. One implementation task: lowest integration risk but no parallel development.
2. Multiple tasks that each edit `HomePage.tsx`/`HomePage.module.css`: parallel in name only; high conflict risk.
3. Additive Wave 1 modules with exclusive ownership, followed by one Wave 2 integration task cut from the merged `main`.

### Decision

Choose option 3.

Wave 1 has four parallel children:

1. media, provenance, facts, and typed content;
2. visual tokens/base plus prop-driven header/hero;
3. prop-driven scroll journey and journey-local motion;
4. prop-driven works/gallery/official-links/footer sections.

None may edit final homepage composition or legacy HomePage CSS. Wave 2 starts only after all four PRs merge and owns route composition, legacy migration, cross-contract fixes, E2E, and final visual QA.

### Worktree decision

- Four child Worktrees concurrently in Wave 1.
- One fresh integration Worktree in Wave 2.
- Five implementation subagents in total; peak concurrency is four child agents plus the non-coding main integrator.

## Round 4 — Rights, accessibility, performance, and release red-team

### Risks challenged

- Treating public/official imagery as reusable without asset-specific permission.
- Shipping original 8–30 MiB images without an intentional derivative strategy.
- Long pinned mobile sections that trap or exhaust users.
- Hiding content behind animation state or color alone.
- Per-frame React state, global wheel interception, large blur/filter animation, or excessive decoded image layers.
- Allowing Wave 1 branches to “temporarily” edit the shared homepage for previews.

### Required mitigations

- Reopen and record every candidate's original page, license icons, creator/rightsholder, modification status, credit, dimensions, retrieval date, and hash.
- Prefer a compatible practical derivative and document any file larger than 2 MiB.
- Linear mobile and reduced-motion journeys; no scroll-jacking or mandatory snap.
- Semantic content remains present without motion; alt text/focus/contrast are tested.
- Only the integration branch composes the route and removes legacy CSS.
- Full viewport/reduced-motion evidence plus `mise run check` and `mise run e2e` are final gates.

## Final review result

The plan is approved for implementation as a parent coordination task with four parallel Wave 1 children and one dependent Wave 2 integration child. No product-code implementation is authorized in the parent planning Worktree.
