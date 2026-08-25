# Redesign KAF site as immersive scroll journey

## Goal

Replace the current warm-paper editorial homepage with an image-rich, unmistakably anime / virtual-singer experience whose primary interaction is a staged journey through KAF's career.

The redesign must preserve native scrolling and accessibility while making each downward scroll reveal a distinct era, visual atmosphere, and set of milestones. The work is intentionally decomposed for parallel Worktree development: four independent Wave 1 implementation tasks followed by one Wave 2 integration and quality task. The parent task coordinates requirements and final acceptance only; it does not own product-code implementation.

## User Value

- Fans immediately recognize KAF through character imagery, color, typography, and worldbuilding rather than generic editorial styling.
- New visitors can understand the arc from the 2018 debut through the 2026 `深愛` period as a coherent visual story.
- Scrolling produces meaningful progression instead of a static sequence of unrelated content blocks.
- The resulting page remains usable on mobile, with reduced motion, by keyboard, and on constrained hardware.

## Confirmed Facts

- The project is a frontend-only Vite + React + TypeScript application with one `/` route.
- `motion` is already installed and supports scroll-triggered, scroll-linked, and reduced-motion behavior; no additional animation dependency is required.
- The current homepage applies Motion only to the initial hero copy and hero figure. All later sections are static.
- The current shipping media set contains one hero image and two archive images.
- The current visual tokens use a warm ivory / paper base with muted rose, lavender, and blue accents.
- `HomePage.tsx` and `HomePage.module.css` are currently monolithic, so parallel work must avoid editing those shared files until the integration wave.
- The official KAF third-anniversary history already presents the artist's development chronologically with dated milestones and images.
- The official `深愛` and current live special sites use dense key visuals, large display typography, chapter-like content, and strong atmosphere rather than application-style card chrome.
- KAMITSUBAKI's secondary-creation guidelines are not blanket permission to copy arbitrary official imagery. Every shipping third-party image still requires a compatible, asset-specific usage basis.

## Product Direction

### Concept: `KAF Phenomenon Chapters`

Treat the page as a visual passage through six chapters of a virtual singer's changing world, not as a magazine index and not as a mirror of the official site.

The design language should use:

- a near-black / midnight-indigo foundation;
- luminous coral, magenta, violet, cyan, and white accents;
- chapter-specific atmosphere and controlled palette shifts;
- large Japanese display typography paired with compact Latin metadata;
- strong image masks, edge-to-edge crops, layered type, waveform / signal / petal motifs, and deliberate negative space;
- visual transitions that follow scroll progress without hijacking the browser scroll model;
- high image density without turning the page into an unstructured image dump;
- an explicit, persistent unofficial / non-commercial identity.

Avoid generic glassmorphism dashboards, permanent neon glow on every element, copied official logos, or one-to-one reproduction of any reference site.

## Requirements

### R1 — Immersive first viewport

The first viewport must include:

- `花譜 / KAF` as the dominant identity;
- the `KAF OBSERVATORY` fan-project identity or an evolved equivalent;
- a clearly visible `UNOFFICIAL FAN PROJECT` / non-commercial label;
- one rights-cleared, high-impact KAF visual;
- a short fan-written statement;
- a visible cue that the page continues as a journey;
- one clear official destination.

The hero must feel like a high-quality anime / virtual-singer key visual, not a paper editorial spread.

### R2 — Six-stage KAF journey

The homepage must contain one primary journey section with six independently legible chapters:

1. **2018 — Origin / Discovery**: debut and the appearance of the voice.
2. **2019 — Observation**: first one-man live and `観測`.
3. **2020–2021 — Magic / Rebuilding**: `魔法`, streamed live evolution, and V.W.P formation.
4. **2022–2023 — Expansion**: Budokan, `組曲`, and expansion across virtual / real boundaries.
5. **2024 — Fable / Second Chapter**: `廻花`, Yoyogi, and `寓話`.
6. **2025–2026 — Transcendent Love**: overseas activity, `宿声 / 深愛`, and the current `深愛` era.

Each chapter must have a period label, title, concise original summary, one or more verified milestones with official source links, a distinct theme, and at least one rights-cleared local visual.

### R3 — Scroll interaction contract

- Preserve normal browser scrolling; do not implement scroll-jacking, forced wheel interception, or mandatory scroll snapping.
- On sufficiently wide desktop viewports, use a sticky visual stage and chapter trigger regions so imagery, active year, progress, and atmosphere change as the user advances.
- Use scroll-linked motion for continuous progress only where it adds meaning; use scroll-triggered reveals for discrete content entrances.
- Prefer `transform` and `opacity` animation. Avoid large animated blur/filter surfaces or expensive perpetual effects.
- All chapter content must remain understandable when animation is disabled.

### R4 — Image density and provenance

- Ship at least **nine distinct local KAF-related visuals** across hero, journey, works, and gallery.
- Add at least **six new rights-cleared images** in this iteration; the current three may remain only if they still fit the final direction and their provenance remains valid.
- Every third-party image must have source URL, creator/rightsholder, license or permission basis, required credit, modification status, and retrieval date recorded in `src/assets/kaf/ATTRIBUTION.md`.
- Do not copy arbitrary official-site key visuals, campaign downloads, album artwork, screenshots, logos, or social images when reuse terms are unclear.
- If a license prohibits modification, do not destructively crop, recolor, or optimize the image in a way that violates that condition.

### R5 — Visual works, gallery, and outbound content

- Redesign Selected Works so it is visually led rather than a mostly textual list.
- Expand the visual archive into a deliberate gallery with clear creator/source credit.
- Keep official links prominent and clearly external.
- Preserve the fan-project disclaimer and media-credit path.
- Do not dynamically mirror NEWS, SCHEDULE, or official discography data.

### R6 — Responsive and accessible behavior

- Support 360px, 390px, 768px, 1024px, and 1440px viewport widths without horizontal overflow.
- On mobile, replace desktop sticky staging with a stable linear chapter sequence unless testing proves a smaller sticky treatment remains clear and robust.
- `prefers-reduced-motion: reduce` must remove or substantially reduce parallax, crossfades, pinned transitions, and non-essential movement without hiding content.
- Preserve semantic landmarks, heading hierarchy, keyboard focus, meaningful alt text, decorative `aria-hidden` treatment, and readable contrast.
- Essential information must not depend on hover, motion, or color alone.

### R7 — Performance and engineering boundary

- Keep the application frontend-only and keep `/` stable.
- Use the existing `motion` dependency; do not add GSAP, Lenis, a UI framework, a state library, or an image runtime for this page.
- Keep static content typed and local.
- Only the hero-critical image may be eager/high-priority; below-the-fold images must use intentional lazy loading and intrinsic dimensions.
- Build page-local sections under `src/pages/HomePage/sections/` and leave final route composition to the integration task.
- Keep global color / typography / motion primitives in `src/styles/tokens.css`; page-specific styling remains in CSS Modules.

### R8 — Parallel development boundary

Wave 1 children must not edit `src/pages/HomePage/HomePage.tsx` or the legacy `src/pages/HomePage/HomePage.module.css`.

Each Wave 1 child owns a disjoint file set:

| Child task | Exclusive implementation ownership |
| --- | --- |
| `08-25-kaf-media-content-pack` | KAF assets, attribution, and typed KAF content |
| `08-25-kaf-visual-foundation-hero` | Global visual tokens/base plus header and hero section files |
| `08-25-kaf-scroll-journey` | Journey section, journey-local motion behavior/styles, and focused tests |
| `08-25-kaf-editorial-content-sections` | Works, gallery, official-links, footer section files, and focused tests |
| `08-25-kaf-immersive-integration-qa` | Final `HomePage` composition, legacy CSS removal, integration/E2E tests, cross-section fixes |

The Wave 2 integration child may begin only after all four Wave 1 PRs are merged into `main`.

## Child Task Map

| Wave | Task | Can run in parallel | Product-code role |
| --- | --- | --- | --- |
| 1 | `08-25-kaf-media-content-pack` | Yes, with all other Wave 1 tasks | Media, provenance, facts, typed content |
| 1 | `08-25-kaf-visual-foundation-hero` | Yes, with all other Wave 1 tasks | Tokens, base, header, hero |
| 1 | `08-25-kaf-scroll-journey` | Yes, with all other Wave 1 tasks | Scroll-linked journey capability |
| 1 | `08-25-kaf-editorial-content-sections` | Yes, with all other Wave 1 tasks | Works, gallery, outbound/footer sections |
| 2 | `08-25-kaf-immersive-integration-qa` | No; starts after Wave 1 merges | Composition, migration, responsive/accessibility/performance QA |

## Acceptance Criteria

- [ ] **AC-01**: The first viewport clearly identifies `花譜 / KAF`, the unofficial fan project, and the continuation into a scroll journey at 1440px and 390px.
- [ ] **AC-02**: The final palette and composition read as an immersive anime / virtual-singer experience rather than the previous warm-paper editorial treatment.
- [ ] **AC-03**: A six-chapter KAF journey covers 2018 through the 2026 `深愛` period with verified milestones and distinct visual states.
- [ ] **AC-04**: Desktop scrolling transitions the journey's active year, imagery, progress, and atmosphere without intercepting native scrolling.
- [ ] **AC-05**: Mobile and reduced-motion modes expose the same journey content in a stable linear form without requiring scroll-linked animation.
- [ ] **AC-06**: At least nine distinct local visuals ship, including at least six newly acquired assets, and every third-party image has complete compatible provenance.
- [ ] **AC-07**: No image with unclear reuse terms ships, and assets marked no-modification are not modified incompatibly.
- [ ] **AC-08**: Selected Works and the gallery are visually led and materially denser than the current mostly textual sections.
- [ ] **AC-09**: The page has no horizontal overflow at 360px, 390px, 768px, 1024px, or 1440px.
- [ ] **AC-10**: Semantic structure, keyboard focus, alt text, contrast, and reduced-motion behavior pass review.
- [ ] **AC-11**: Only hero-critical imagery is eager/high-priority; below-the-fold imagery is lazy-loaded with intrinsic sizing.
- [ ] **AC-12**: No Live2D, 3D character runtime, scroll-jacking, autoplay audio/video, runtime scraping, backend, CMS, or new animation framework is introduced.
- [ ] **AC-13**: Each Wave 1 PR stays within its documented ownership boundary, allowing the four Worktrees to progress concurrently with minimal merge conflict.
- [ ] **AC-14**: Wave 2 begins from a `main` branch containing all four Wave 1 merges and resolves all contracts in one final homepage composition.
- [ ] **AC-15**: `mise run check` and `mise run e2e` pass after integration, with browser screenshots or equivalent visual evidence captured for desktop/mobile/reduced-motion review.

## Out of Scope

- Live2D, Cubism, 3D avatars, or character puppetry.
- Scroll-jacking, smooth-scroll replacement, custom wheel interception, or mandatory scroll snap.
- Audio playback, autoplay video backgrounds, music/lyrics redistribution, or a media player.
- Dynamic news/schedule/discography mirroring, backend, CMS, authentication, comments, analytics, store, or ticketing.
- A multi-route site redesign.
- Copying an official layout, logo, campaign asset, or protected key visual without explicit compatible permission.
- Generative-AI artwork depicting KAF.

## Risks and Deferred Items

- Asset availability is constrained by per-work licensing. The media child must prefer fewer compatible images over visually attractive but unverified images; the integration task may adjust composition around the approved set.
- The planning environment had Playwright installed but lacked the matching browser binary, so a fresh full-page screenshot audit could not be completed during planning. Wave 2 must install the pinned Chromium binary when necessary and perform the visual matrix before acceptance.
- Exact palette values may be tuned against the approved images during implementation, but the semantic dark / luminous direction and accessibility contrast contract are fixed.

## Blocking Open Questions

None. The user delegated task count, product direction, design review, and Worktree decomposition to this planning pass.
