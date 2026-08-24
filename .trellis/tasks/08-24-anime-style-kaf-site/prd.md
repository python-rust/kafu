# Design anime-style KAF fan site

## Goal

Transform the current minimal KAF Observatory landing page into a polished, unmistakably anime-oriented **unofficial KAF (花譜) fan site** that feels authored for KAF rather than assembled from a generic anime template.

The first iteration should make illustration, KAF's artistic identity, selected music works, and official destinations the core of the experience while remaining lightweight, responsive, accessible, and maintainable as a static frontend.

## User Value

- A KAF fan should recognize the subject and mood immediately from the first viewport.
- A visitor unfamiliar with KAF should understand who she is, see representative visuals, discover selected works, and have clear paths to official sources.
- The site should feel like a curated fan-made visual publication / observatory, not like an unofficial mirror of the official website.

## Confirmed Facts

- The project is currently a Vite + React + TypeScript single-page frontend with only the `/` route.
- The previous Live2D prototype, its SVG puppet, Cubism boundary, and related UI have been removed.
- There is no backend, CMS, API, server state, or content-fetching layer.
- `motion` is already available for restrained UI motion; no additional animation framework is required for this iteration.
- The project is explicitly positioned as an unofficial, non-commercial fan project.
- KAF's current official site organizes the artist experience around SCHEDULE, NEWS, DISCOGRAPHY, MOVIE, and profile information.
- KAF's anniversary site demonstrates an art-first special-site pattern with a large key visual, history, and gallery-like storytelling.
- KAMITSUBAKI's anime site demonstrates a stronger narrative/worldbuilding treatment built around key visuals, character art, section navigation, music, and special content.
- KAMITSUBAKI publishes secondary-creation guidelines for individual non-commercial fan works. This does **not** mean arbitrary official-site images can automatically be copied into this repository for any purpose.
- KAF is listed on piapro, where individual submitted works can carry explicit usage conditions. Any such conditions must be checked per asset before reuse.

## Product Direction

### Visual concept: `KAF Editorial Observatory`

Use KAF-specific visual language instead of generic cyberpunk/anime UI:

- illustration-first composition;
- warm ivory / paper-like base rather than a permanent dark theme;
- charcoal/ink text and rules;
- rose / magenta as the primary KAF accent, with restrained muted lavender and cool blue support tones;
- Japanese editorial typography: Mincho-style display hierarchy paired with a clean sans-serif body stack;
- asymmetric grids, generous whitespace, fine rules, issue/observation numbering, compact metadata, and occasional vertical labels;
- abstract flower/petal/ink fragments created by this project as supporting decoration;
- subtle reveal/crop/parallax motion only where it improves hierarchy;
- image composition should remain the visual focal point rather than competing with glass, neon, particles, or heavy effects.

The result must remain clearly distinct from KAF's official site and must not reproduce an official logo/layout as if this were an official property.

## Requirements

### R1 — First-viewport identity

The initial viewport must communicate all of the following without interaction:

- `花譜 / KAF`;
- `KAF OBSERVATORY` or equivalent project identity;
- a clearly visible `UNOFFICIAL FAN PROJECT` label;
- one rights-cleared KAF-related hero visual;
- a concise fan-written introduction;
- one clear route to an official KAF destination.

### R2 — Single-page information architecture

Keep this iteration on the existing `/` route and build a cohesive anchored home experience with these sections:

1. **Hero / Observation 001** — identity, hero visual, fan-project label, official-site CTA.
2. **About KAF** — short curated profile with source attribution/link to official profile.
3. **Selected Works** — at least four representative releases, including a current/recent release sourced from the official discography/schedule and a small curated historical selection.
4. **Visual Archive** — a small gallery of rights-cleared KAF-related illustrations/visuals with visible creator/source attribution where required.
5. **Official Links** — official website and selected official social/video destinations; do not impersonate or mirror them.
6. **Footer / Disclaimer** — clearly state the site is unofficial and provide media/credit information or a path to it.

Do **not** build a dynamic NEWS/SCHEDULE mirror in this iteration. Link visitors to the official sources instead.

### R3 — Asset provenance and copyright gate

Images may be downloaded into the repository only after their usage basis is verified.

For every third-party visual committed to the project, record:

- local filename;
- original source URL;
- creator / rights holder;
- applicable license or permission condition;
- required credit string, if any;
- retrieval date.

Preferred source order:

1. piapro works whose per-work license explicitly permits the intended non-commercial web use;
2. official assets that are explicitly offered with terms compatible with this use;
3. fan artwork only with explicit creator permission compatible with this site.

Official page artwork, campaign wallpapers, album artwork, logos, screenshots, or press visuals must **not** be copied merely because they are publicly accessible. If the permission basis is unclear, the asset stays out of the shipping site.

This iteration will not use generative-AI artwork depicting KAF. The visual identity should be built from rights-cleared artwork plus original non-character graphic design.

### R4 — Content ownership

- Site copy must be fan-written and concise; do not copy long official biographies/news text verbatim.
- Factual artist/release information must be checked against official KAF/KAMITSUBAKI sources before being added.
- Static content should be locally owned and typed rather than scraped at runtime.
- External official destinations should open as normal links and remain visibly separate from this fan site.

### R5 — Responsive UX

- The layout must work at minimum across 360px mobile, tablet, and 1440px desktop widths.
- No horizontal overflow is allowed.
- Mobile must preserve the illustration-first hierarchy without placing critical text over visually busy character regions.
- Primary navigation/section links must remain usable with touch targets appropriate for mobile.
- The page must not require hover to expose essential information.

### R6 — Accessibility

- Preserve semantic landmarks and heading order.
- All meaningful images require useful alt text; decorative graphics must be hidden from assistive technology.
- Interactive elements require visible keyboard focus.
- Text/image overlays must maintain readable contrast.
- Motion must respect `prefers-reduced-motion` and must not be required to understand content.

### R7 — Performance and image loading

- The hero visual may be eager-loaded; gallery/secondary images should lazy-load when appropriate.
- Use appropriately sized local image variants rather than shipping the largest source file to every viewport.
- Avoid introducing a large UI framework, animation framework, or image runtime solely for this page.
- No new dependency should be added unless the implementation can demonstrate that the existing stack cannot meet a stated requirement without it.

### R8 — Preserve the current project boundary

- Keep React Router and the existing `/` route behavior.
- Keep the project frontend-only.
- Continue using CSS Modules and existing design tokens, extending the token set where this visual system genuinely needs it.
- Keep `mise run ...` as the development/validation entry point.

## Acceptance Criteria

- [x] **AC-01**: At 1440px and 390px widths, the first viewport visibly identifies `花譜 / KAF`, the KAF Observatory project, and its unofficial fan-project status.
- [x] **AC-02**: The `/` page contains Hero, About KAF, Selected Works, Visual Archive, Official Links, and disclaimer/footer content in a coherent single-page flow.
- [x] **AC-03**: At least one rights-cleared local hero image and at least two rights-cleared secondary visuals ship with the page; every third-party visual has complete provenance/permission metadata in the repository.
- [x] **AC-04**: No third-party image with unclear reuse terms is committed as a shipping asset; restricted campaign/download-only assets are excluded.
- [x] **AC-05**: Selected Works shows at least four curated items with title, release metadata, image/visual treatment where permitted, and an official source/destination.
- [x] **AC-06**: The page has no horizontal overflow at 360px, 390px, 768px, 1024px, or 1440px viewport widths.
- [x] **AC-07**: Essential navigation and content are usable without hover; keyboard focus is visible; meaningful images have alt text; decorative visuals are excluded from the accessibility tree.
- [x] **AC-08**: `prefers-reduced-motion: reduce` removes or substantially reduces non-essential animation without hiding content.
- [x] **AC-09**: Only the hero-critical image is eager-loaded; below-the-fold gallery images use an intentional lazy-loading strategy.
- [x] **AC-10**: The implementation contains no Live2D/Cubism/runtime-puppet code and does not reintroduce character animation as a substitute for the new art direction.
- [x] **AC-11**: No runtime scraping, backend, CMS, global state library, or server-state dependency is introduced.
- [x] **AC-12**: Automated tests cover the presence of the new major sections and important navigation/identity semantics at DOM level, and Playwright covers desktop + mobile smoke behavior.
- [x] **AC-13**: `mise run check` and `mise run e2e` pass before completion.
- [x] **AC-14**: Final visual review confirms the page reads as an illustration-led KAF editorial/fan experience, not as generic neon/glass anime UI and not as an imitation of the official KAF website.

## Out of Scope

- Live2D, Cubism, animated character puppets, or 3D characters.
- Audio playback, music streaming, lyrics, or redistribution of KAF audio/video files.
- Runtime news/schedule scraping or official-site mirroring.
- Backend, CMS, authentication, comments, favorites, community features, analytics, or database work.
- Store/checkout/ticketing functionality.
- Full multi-route discography/news/profile detail pages.
- Reproducing KAF/KAMITSUBAKI official logos or copying an official site's layout one-to-one.
- Generative-AI character artwork depicting KAF.

## Blocking Open Questions

None. The user delegated the concrete product and visual direction for this iteration to the designer/product role, and the plan intentionally chooses a single-page, rights-aware MVP.
