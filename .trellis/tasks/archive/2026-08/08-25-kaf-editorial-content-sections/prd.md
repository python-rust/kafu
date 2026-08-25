# Redesign KAF works and gallery sections

## Goal

Build the image-rich lower-half sections of the KAF homepage as independent, prop-driven components: Selected Works, Visual Gallery, Official Links, and Footer.

The redesign must replace the current mostly textual/equal-row treatment with a deliberate anime / virtual-singer visual rhythm while preserving credits, official-source clarity, responsive behavior, and parallel file ownership. This task does not own KAF content/assets, global tokens, the Journey, or route composition.

## Requirements

### R1 — Build `WorksSection`

The component must accept typed work records through props and render:

- a stable `#works` section and heading;
- one clearly featured/current work with dominant visual treatment;
- supporting works in an asymmetric editorial sequence rather than a uniform app-card grid;
- title, release date, kind/type, concise description, official source link, and visual where provided;
- intrinsic image dimensions, meaningful alt text, lazy loading for below-the-fold visuals, and source/credit access when required.

The component must remain structurally compatible with the media task's richer work records without importing future content modules.

### R2 — Build `GallerySection`

The component must accept visual records through props and render:

- a stable `#gallery` or `#visuals` section and heading consistent with final navigation;
- a controlled, image-led gallery with varied but predictable rhythm;
- visible title/creator/credit and source link for every third-party visual;
- meaningful alt text and intrinsic dimensions;
- intentional lazy loading/decoding behavior;
- stable mobile order without a fragile masonry algorithm.

The gallery must feel curated and immersive, not like an infinite image feed or generic rounded-card grid.

### R3 — Build `OfficialLinksSection`

The component must:

- expose a stable `#links` section;
- explain that current news, schedule, full discography, and social updates belong to official sources;
- render official destinations as large, clear, semantic external links;
- distinguish label, purpose/note, and external-link affordance;
- avoid unnecessary platform-logo dependencies.

### R4 — Build `SiteFooter`

The footer must:

- visibly state that the site is unofficial and non-commercial;
- state that it is not affiliated with KAF/KAMITSUBAKI STUDIO;
- provide a durable path/label for media credits;
- keep project identity and current curation metadata concise;
- use semantic footer markup and accessible links.

### R5 — Visual/motion direction

- Consume semantic dark/luminous tokens with fallback values so the branch is independently renderable before the token PR merges.
- Use image scale, type hierarchy, open spatial composition, crop frames, lines, signal/petal motifs, and section-specific rhythm.
- Avoid a repeated glass-card component as the dominant pattern.
- Optional in-view reveal may use existing Motion APIs, but content must be readable without animation.
- Do not implement scroll-linked journey progress or global scroll state.

### R6 — Responsive/accessibility/loading

- Work at 360px, 390px, 768px, 1024px, and 1440px without component-level horizontal overflow.
- Preserve semantic headings/articles/figures/lists/links.
- Essential information must not depend on hover.
- External links need descriptive accessible names.
- Decorative geometry must be hidden from assistive technology.
- All below-the-fold images should default to lazy loading with intrinsic dimensions.
- Respect reduced motion for any optional reveal/hover movement.

### R7 — Exclusive file ownership

This task may edit:

- `src/pages/HomePage/sections/WorksSection.tsx`;
- `src/pages/HomePage/sections/WorksSection.module.css`;
- `src/pages/HomePage/sections/GallerySection.tsx`;
- `src/pages/HomePage/sections/GallerySection.module.css`;
- `src/pages/HomePage/sections/OfficialLinksSection.tsx`;
- `src/pages/HomePage/sections/OfficialLinksSection.module.css`;
- `src/pages/HomePage/sections/SiteFooter.tsx`;
- `src/pages/HomePage/sections/SiteFooter.module.css`;
- uniquely named focused tests for these sections;
- this task's Trellis artifacts.

This task must not edit:

- `src/pages/HomePage/HomePage.tsx`;
- `src/pages/HomePage/HomePage.module.css`;
- Hero/Header/Journey files;
- `src/content/**`;
- `src/assets/**`;
- `src/styles/**`;
- integration/E2E tests.

Use local prop fixtures in focused tests. Do not duplicate KAF production content inside components.

## Acceptance Criteria

- [ ] **AC-01**: `WorksSection` renders a dominant featured work plus supporting work records with official links and image-aware layout.
- [ ] **AC-02**: `GallerySection` renders every passed visual with useful alt text, title/credit, source link, intrinsic dimensions, and intentional lazy loading.
- [ ] **AC-03**: Works and gallery composition is materially more visual and varied than the current text-row/two-image layout without becoming an unstructured feed.
- [ ] **AC-04**: `OfficialLinksSection` clearly directs visitors to official sources and renders semantic descriptive external links.
- [ ] **AC-05**: `SiteFooter` clearly states unofficial/non-commercial/non-affiliation status and exposes media-credit information/path.
- [ ] **AC-06**: All components remain usable at target widths with stable source order and no component-level horizontal overflow.
- [ ] **AC-07**: Essential content is available without hover/motion; reduced motion removes optional non-essential movement.
- [ ] **AC-08**: Below-the-fold images are lazy-loaded with intrinsic dimensions and meaningful alt text.
- [ ] **AC-09**: Focused tests cover section headings, featured/supporting records, gallery credits/sources, official links, and disclaimer semantics.
- [ ] **AC-10**: The diff stays inside the documented ownership boundary and `mise run check` passes.

## Out of Scope

- KAF fact/content/media acquisition, global tokens, Hero/Header/Journey, HomePage composition, or full-page E2E.
- Runtime carousel/masonry dependencies, infinite loading, filtering, or modal lightboxes.
- A generic cross-route component library.

## Dependencies

None for implementation. This Wave 1 task can run concurrently with all other Wave 1 tasks using prop contracts and fixtures.

## Blocking Open Questions

None. Exact work/gallery record fields may be adapted structurally in Wave 2; this task owns observable section behavior and presentation, not the production data source.
