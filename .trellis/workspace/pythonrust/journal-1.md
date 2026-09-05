# Journal - pythonrust (Part 1)

> AI development session journal
> Started: 2026-08-24

---



## Session 1: Bootstrap Trellis frontend guidelines

**Date**: 2026-08-24
**Task**: Bootstrap Trellis frontend guidelines
**Branch**: `main`

### Summary

Initialized the KAF frontend baseline, documented project-specific frontend conventions with real code examples, integrated Trellis-managed files with the formatting workflow, validated the full mise quality gate and Playwright smoke test, and archived the bootstrap task.

### Git Commits

| Hash | Message |
|------|---------|
| `99670e9` | (see git log) |

### Status

[OK] **Completed**


## Session 2: KAF editorial fan homepage

**Date**: 2026-08-24
**Task**: KAF editorial fan homepage
**Branch**: `main`

### Summary

Designed and implemented the first illustration-led KAF fan homepage, added rights-cleared local visuals with provenance, responsive editorial sections, accessibility/performance coverage, viewport/reduced-motion E2E tests, and updated frontend media conventions.

### Git Commits

| Hash | Message |
|------|---------|
| `92d9049` | (see git log) |
| `c29033c` | (see git log) |

### Status

[OK] **Completed**


## Session 3: Curate KAF journey media content

**Date**: 2026-08-25
**Task**: Curate KAF journey media content
**Branch**: `feat/kaf-media-content`

### Summary

Verified six-stage KAF chronology and per-asset reuse terms; added six rights-cleared local visuals, typed journey/media content, provenance, and focused invariants; mise run check passed.

### Git Commits

| Hash | Message |
|------|---------|
| `cde9961` | (see git log) |

### Status

[OK] **Completed**


## Session 4: KAF six-stage scroll journey

**Date**: 2026-08-25
**Task**: KAF six-stage scroll journey
**Branch**: `feat/kaf-scroll-journey`

### Summary

Implemented and validated the prop-driven six-stage native-scroll JourneySection with bounded desktop sticky visuals, linear mobile/reduced-motion fallbacks, focused DOM tests, and PR #2.

### Git Commits

| Hash | Message |
|------|---------|
| `0481436a80eac088bfa89dab3d2004dc118ebf44` | (see git log) |

### Status

[OK] **Completed**


## Session 5: Integrate immersive KAF homepage

**Date**: 2026-08-25
**Task**: Integrate immersive KAF homepage
**Branch**: `feat/kaf-immersive-integration`

### Summary

Integrated Wave 1 sections and production media into the final KAF homepage, removed the legacy monolith, fixed mobile Gallery clipping and dark theme metadata, expanded responsive/accessibility/performance E2E coverage, reconciled provenance, and passed final check plus Chromium E2E.

### Git Commits

| Hash | Message |
|------|---------|
| `7f280b4` | (see git log) |
| `f532371` | (see git log) |

### Status

[OK] **Completed**


## Session 6: Refine KAF visual system and scrolling

**Date**: 2026-08-29
**Task**: Refine KAF visual system and scrolling
**Branch**: `main`

### Summary

Rebuilt the homepage around a restrained KAF editorial palette and readable type scale; removed continuous scroll-linked Journey animation; reduced desktop document height by 29.8%; added 320px, 200% text, reduced-motion, density, and contrast browser regressions; synchronized frontend visual-system specs and archived the task.

### Git Commits

| Hash | Message |
|------|---------|
| `544013d0883f0a8f9229fd21f61b64312a4c2ec5` | (see git log) |
| `c1282c7c84526686787ebe1fcff5a3f6e6c21b62` | (see git log) |

### Status

[OK] **Completed**


## Session 7: Refine KAF visual system and scrolling

**Date**: 2026-08-29
**Task**: Refine KAF visual system and scrolling
**Branch**: `main`

### Summary

Rebuilt the homepage around a restrained KAF editorial palette and readable type scale; removed continuous scroll-linked Journey animation; reduced desktop document height by 29.8%; added 320px, 200% text, reduced-motion, density, and contrast browser regressions; synchronized frontend visual-system specs and archived the task.

### Git Commits

| Hash | Message |
|------|---------|
| `544013d0883f0a8f9229fd21f61b64312a4c2ec5` | (see git log) |
| `c1282c7c84526686787ebe1fcff5a3f6e6c21b62` | (see git log) |

### Status

[OK] **Completed**


## Session 8: Redesign KAF editorial gallery and remove AI-template copy

**Date**: 2026-08-29
**Task**: Redesign KAF editorial gallery and remove AI-template copy
**Branch**: `main`

### Summary

Removed decorative English microcopy, interface-narrating prose, leading-zero/index patterns, and repeated eyebrow hierarchy; rebuilt the page with warm dark KAF art direction, direct Japanese navigation, page-local shared heading/credit components, and a one-stage eight-image gallery using a lazy React-19-compatible open-source lightbox. Added full unit/E2E coverage and executable frontend content/visual/component constraints.

### Git Commits

| Hash | Message |
|------|---------|
| `f647c2e0938155b256e5dacc5671780d510ec500` | (see git log) |
| `f623daf146f406e79dc330b54ac5323e9931fbfc` | (see git log) |

### Status

[OK] **Completed**


## Session 9: Improve KAF image quality and media inspection

**Date**: 2026-08-30
**Task**: Improve KAF image quality and media inspection
**Branch**: `main`

### Summary

Generated verified responsive KAF artwork derivatives, centralized responsive media rendering and footer attribution, enabled lazy lightbox zoom, updated tests and frontend media specs, and archived the task.

### Git Commits

| Hash | Message |
|------|---------|
| `ddb29a9daae3860931ddcaac0ab6b8e37a5c88df` | (see git log) |
| `b1516fc0b01b28fe71c35bc1c7f38d715a3288a9` | (see git log) |

### Status

[OK] **Completed**


## Session 10: Localize KAF storytelling for Chinese audiences

**Date**: 2026-08-30
**Task**: Localize KAF storytelling for Chinese audiences
**Branch**: `main`

### Summary

Reframed the KAF homepage as a Simplified Chinese newcomer product with stable fixed navigation, four-beat onboarding, six chapter transformations, Chinese actions/accessibility labels, official references, and content-driven reduced-motion-safe storytelling.

### Main Changes

- Added fixed high-contrast Chinese navigation with five observed aria-current locations.
- Added a four-beat 认识花谱 sticky/linear onboarding story using verified responsive media.
- Added Chinese Journey narratives, authoritative Japanese labels, and six changeFrom-to-changeTo transitions.
- Localized Hero, Works, Gallery/lightbox, Official Links, metadata, and Footer reference disclosures.

### Git Commits

| Hash | Message |
|------|---------|
| `659e31a1a65f2b9fa33f8ebd83c95b828c89d5b8` | (see git log) |
| `faa73027098ba09fd969d4e35e7e871e2b74887d` | (see git log) |

### Testing

- [OK] Prettier, Oxlint, TypeScript, Vite build, and mise run check passed.
- [OK] Vitest: 7 files and 26 tests passed.
- [OK] Playwright Chromium: 13 tests passed across contrast, navigation, storytelling, responsive, reduced-motion, image, and lightbox contracts.

### Status

[OK] **Completed**

### Next Steps

- No pending implementation work; task archived under archive/2026-08.


## Session 11: Refine KAF editorial copy and era theatre

**Date**: 2026-08-30
**Task**: Refine KAF editorial copy and era theatre
**Branch**: `main`

### Summary

Removed explanatory GPT-like copy, replaced the sticky newcomer story with a factual profile, rebuilt Journey as accessible Radix era tabs, and restored the third album.

### Main Changes

- Hero now contains factual identity plus direct profile/works actions.
- Static KafProfileSection replaces four slogan-driven sticky steps.
- Journey uses six Radix tabs with keyboard and previous/next controls.
- Representative works now include 狂想β without an unverified cover.
- Frontend SPEC now forbids page-explaining/rhetorical slogan copy and codifies era tabs.

### Git Commits

| Hash | Message |
|------|---------|
| `0d178b47e3d3b97f455b684094da9c58f75d3763` | (see git log) |
| `c45b9b4bf3ce1a59bec7785261103f86929f1297` | (see git log) |

### Testing

- [OK] mise run check passed: 7 Vitest files / 26 tests.
- [OK] mise run e2e passed: 12 Chromium tests.
- [OK] 320px, 200% text, reduced motion, DPR media, Gallery, and zero document overflow passed.

### Status

[OK] **Completed**


## Session 12: Guide KAF journey through responsive scrollytelling

**Date**: 2026-08-30
**Task**: Guide KAF journey through responsive scrollytelling
**Branch**: `main`

### Summary

Replaced click-required era tabs with Scrollama-guided native scrolling across desktop and mobile, removed secondary Journey imagery, and expanded responsive regression coverage.

### Main Changes

- Replaced Radix Tabs with scrollama@3.2.0 and one-image sticky Journey stages.
- Added downward/upward six-era activation, compact pixel offsets, orientation recalibration, and progressive reduced-motion/observer fallbacks.
- Expanded mobile validation to 320/360/390/430 portrait, 844x390 landscape, tablet, desktop, and 200% text.

### Git Commits

| Hash | Message |
|------|---------|
| `caa931cdc427af149e3f86f0de29a39472af7ee1` | (see git log) |
| `f2b7ff0e0fd63b67c6e5faae3352766e5d80da03` | (see git log) |

### Testing

- [OK] mise run check: 7 test files / 26 tests passed; lint/typecheck/build passed.
- [OK] mise run e2e: 13 Chromium tests passed.
- [OK] Media manifest, Trellis validation, git diff check, and production audit passed with no known vulnerabilities.

### Status

[OK] **Completed**

### Next Steps

- No active task remains; remote is intentionally unchanged.


## Session 13: Polish mobile Hero and Journey viewport UX

**Date**: 2026-08-30
**Task**: Polish mobile Hero and Journey viewport UX
**Branch**: `main`

### Summary

Redesigned the portrait mobile Hero as a stable full-viewport contained-artwork composition and converted the compact Journey stage into a flush full-bleed media dock with measured Scrollama activation.

### Main Changes

- Replaced the fixed 48rem portrait Hero and extreme cover crop with 100svh, contained high-density artwork, and a lazy generated-thumbnail ambience.
- Removed the header-to-Journey seam, removed the floating-card treatment, and derived compact Scrollama offsets from rendered header and stage geometry.
- Expanded viewport contracts for short/tall phones, portrait tablet, short landscape, 200% text, reduced motion, and whole-site overflow/touch behavior.

### Git Commits

| Hash | Message |
|------|---------|
| `46e51394b0cac7a77cb36f44e711923fb1061ad0` | (see git log) |
| `2e43aff50f0aa29fcd68d0a79dfe791fe4853e2e` | (see git log) |

### Testing

- [OK] mise run check
- [OK] mise run e2e (13 Chromium tests)
- [OK] Trellis context validation and git diff --check

### Status

[OK] **Completed**


## Session 14: Refine KAF typography with open web fonts

**Date**: 2026-08-30
**Task**: Refine KAF typography with open web fonts
**Branch**: `main`

### Summary

Adopted a self-hosted, OFL-licensed Noto Sans/Serif SC typography system with Chinese reading/display roles, Japanese-first proper-name fallbacks, measured font budgets, notices, and regression coverage.

### Main Changes

- Pinned Noto Sans SC Variable and Noto Serif SC Variable 5.3.0 and imported them once at the application root.
- Applied semantic reading, Chinese display, Japanese proper-name, and editorial numeral roles without changing page content or layout.
- Added third-party notices, deployable OFL text, typography SPEC, and documented rejection of high-cost novelty fonts.

### Git Commits

| Hash | Message |
|------|---------|
| `5af6d338d46a1a5491bf2caff7119136b78d5c97` | (see git log) |
| `efaffa7f7d4fec796fd33ce44d74e9e87e66e690` | (see git log) |

### Testing

- [OK] mise run check passed: 7 Vitest files and 26 tests.
- [OK] mise run e2e passed: 14 Chromium tests, including 40 same-origin WOFF2 requests and 2,387,612 transferred font bytes.
- [OK] Trellis context validation and git diff --check passed.

### Status

[OK] **Completed**


## Session 15: Fix Journey Chinese heading line breaks

**Date**: 2026-08-30
**Task**: Fix Journey Chinese heading line breaks
**Branch**: `main`

### Summary

Removed Latin ch-based width caps from Journey Chinese titles, let headings use the full container, added balanced CJK fallback wrapping and browser line-count regressions.

### Main Changes

- Journey article and sticky-stage titles now use full available inline width.
- Compact card horizontal padding was reduced from 20px to 16px at the narrowest supported width without shrinking type.
- Frontend SPEC now forbids ch-based width caps for CJK display headings.

### Git Commits

| Hash | Message |
|------|---------|
| `a75bd68c83a341b9cfbcdedc8be0fe0bf883a234` | (see git log) |
| `482ed710d47bfd38540f517f2fba9fea917d92fb` | (see git log) |

### Testing

- [OK] mise run check passed: 26 Vitest tests, lint, typecheck, and production build.
- [OK] mise run e2e passed: 14 Chromium tests across the responsive matrix.

### Status

[OK] **Completed**

### Next Steps

- None.


## Session 16: Deploy KAF site to GitHub Pages manually

**Date**: 2026-08-30
**Task**: Deploy KAF site to GitHub Pages manually
**Branch**: `main`

### Summary

Added a manual-only, immutable-action GitHub Pages pipeline; made Vite and React Router repository-subpath aware; enabled Pages, deployed the current site, and verified the live same-origin image/font runtime.

### Main Changes

- Added .github/workflows/deploy-pages.yml with workflow_dispatch only, pinned Actions, mise-managed validation, Pages artifact upload, and OIDC deployment.
- Added VITE_BASE_PATH handling, BrowserRouter basename normalization, workflow/artifact policy verifiers, README instructions, and deployment SPEC.
- Enabled GitHub Pages for python-rust/kafu, fast-forward pushed main, and completed the first manual deployment.

### Git Commits

| Hash | Message |
|------|---------|
| `6ab73f9b7c7ac45477201e3fdc10b1688afdeae6` | (see git log) |
| `97107e11610e125575b25a5ccfc72333ba2adbc0` | (see git log) |
| `7ac7e1ef2baf82cff97609c360b7d463855c650d` | (see git log) |

### Testing

- [OK] mise run check passed: 8 Vitest files and 27 tests, plus format/lint/typecheck/build.
- [OK] mise run e2e passed: 14 Chromium tests.
- [OK] The /kafu/ artifact and live site passed same-origin asset, Router basename, image, font, HTTP 200, and console/request smoke checks.

### Status

[OK] **Completed**

### Next Steps

- Future releases remain manual: Actions -> Deploy GitHub Pages -> Run workflow, or gh workflow run deploy-pages.yml --ref main.


## Session 17: Improve weak-network artwork loading

**Date**: 2026-08-30
**Task**: Improve weak-network artwork loading
**Branch**: `main`

### Summary

Added progressive same-origin artwork placeholders and loading feedback, width-based responsive candidates and Hero preload priorities, the verified official 狂想β cover, deterministic weak-network browser coverage, and a successful manual GitHub Pages redeployment.

### Main Changes

- Added inline WebP placeholders with loading/loaded/error states to ResponsiveArtwork.
- Changed responsive media to width descriptors and explicit sizes with reading-order fetch priorities.
- Added the verified official 狂想β cover with source-native 480/800/1600 derivatives and provenance.

### Git Commits

| Hash | Message |
|------|---------|
| `377b0950d8b6fbeb99f13eb847aba350bf07ac72` | (see git log) |
| `39d774df3e45b6d245b653a656a775b22817d092` | (see git log) |
| `45b439f50355acf26367dfcfd2eddef4e1d7f0e8` | (see git log) |

### Testing

- [OK] Vitest: 9 files / 30 tests passed; Chromium Playwright: 15 tests passed.
- [OK] GitHub Pages workflow run 33310483344 succeeded and live weak-network interception verified the placeholder/reveal flow.

### Status

[OK] **Completed**

### Next Steps

- No immediate follow-up; future Pages releases remain manual through deploy-pages.yml.


## Session 18: Fix cached artwork transitions and Hero reveal

**Date**: 2026-08-30
**Task**: Fix cached artwork transitions and Hero reveal
**Branch**: `main`

### Summary

Removed the Hero decode visibility deadlock, reused inline ambience instead of a second request, added exact responsive-request cache state, preserved clear Journey artwork during uncached transitions, prevented LQIP flashes on cached revisits, delayed adjacent prefetch until actual Journey entry, and successfully redeployed GitHub Pages.

### Main Changes

- ResponsiveArtwork now reveals on native load and recognizes complete/cached exact requests before paint.
- Hero now uses one network image with request-free inline placeholder ambience.
- Journey separates active and displayed visuals, retains the previous clear image while loading, and prefetches one neighbor only after Scrollama entry.

### Git Commits

| Hash | Message |
|------|---------|
| `91bd7208ab6f575b767d28a2f76a0287198a7a09` | (see git log) |
| `5f266b2933324a9be87314018296748c005334a1` | (see git log) |
| `f101f816b2a8425d8a43dad5209e5e1fe88fc743` | (see git log) |

### Testing

- [OK] Vitest: 9 files / 34 tests passed; Chromium Playwright: 16 tests passed.
- [OK] GitHub Pages run 33314071965 succeeded; public decode-deadlock, delayed-Hero, same-origin, and cached-Journey audits passed.

### Status

[OK] **Completed**

### Next Steps

- No immediate follow-up; future Pages releases remain manual through deploy-pages.yml.


## Session 19: Fix gallery viewport scroll anchoring

**Date**: 2026-09-05
**Task**: Fix gallery viewport scroll anchoring
**Branch**: `main`

### Summary

Reproduced the remaining Visual Archive jump in production, identified the animated decorative backdrop as an incorrect scroll-anchor candidate, added a narrow overflow-anchor exclusion, strengthened centered-rail pointer regression coverage, updated the media spec, validated Chromium/Firefox/WebKit, and deployed successfully.

### Git Commits

| Hash | Message |
|------|---------|
| `9d7ee58` | (see git log) |
| `b22f7b1` | (see git log) |

### Status

[OK] **Completed**


## Session 20: Avatar presence and model disclosure

**Date**: 2026-09-05
**Task**: Avatar presence and model disclosure
**Branch**: `main`

### Summary

Completed avatar lighting, gaze, expressions, motion and metadata dialog. Updated SPEC and archived both tasks. Passed 61 unit tests, 24 browser tests, real-model checks and full R2 hash verification. Production run 33943689832 and live browser checks passed. Final post-archive deployment follows.

### Git Commits

| Hash | Message |
|------|---------|
| `fbe5605` | (see git log) |
| `19be17a` | (see git log) |

### Status

[OK] **Completed**


## Session 21: Correct avatar sleeve penetration and skin hotspots

**Date**: 2026-09-05
**Task**: Correct avatar sleeve penetration and skin hotspots
**Branch**: `main`

### Summary

Restored authored forearm/wrist alignment with a conservative A-pose arm drop. Isolated and removed skin matcap hotspots with scoped MToon uniforms; preserved mouth behavior and immutable VRM. Passed 63 unit tests, 24 browser tests, full/oblique model review and production run 33945694706. Updated SPEC and archived the repair task; final bookkeeping revision uses the same application build.

### Git Commits

| Hash | Message |
|------|---------|
| `97fc3a8` | (see git log) |

### Status

[OK] **Completed**
