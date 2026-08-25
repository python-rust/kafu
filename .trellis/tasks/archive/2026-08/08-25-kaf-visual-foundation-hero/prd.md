# Build KAF visual foundation and hero

## Goal

Establish the dark, luminous anime / virtual-singer visual foundation and deliver independent, prop-driven `SiteHeader` and `HeroSection` components for the redesigned KAF homepage.

This task must make the first viewport feel materially different from the current warm-paper editorial page while remaining accessible, responsive, reduced-motion aware, and safe to merge in parallel. It does not compose the route and does not own content or media acquisition.

## Requirements

### R1 — Replace the global visual foundation

Update semantic tokens and global body/root defaults to support:

- near-black / midnight-indigo page foundation;
- luminous coral, magenta, violet, cyan, and white accents;
- readable muted text and rules on dark surfaces;
- display/sans typography roles;
- restrained glow, line, spacing, and motion primitives;
- accessible focus indicators.

Exact values may be tuned against representative fixtures, but the dark/luminous direction and contrast contract are fixed.

Do not scatter palette constants across component CSS when a semantic global token should own them.

### R2 — Build `SiteHeader`

Create a page-local header component that:

- exposes the KAF Observatory fan-project mark;
- visibly states unofficial/non-commercial status;
- accepts anchor-navigation items as props or uses a narrow stable local contract;
- provides direct links to Journey, Works, Gallery, and Official Links;
- remains readable over the hero without relying on JavaScript scroll state;
- provides semantic navigation and visible keyboard focus;
- uses touch-safe targets and does not require a complex mobile drawer unless evidence proves it necessary.

### R3 — Build `HeroSection`

Create a prop-driven hero component that accepts its media and link/copy data rather than importing future content modules.

The hero must display:

- `花譜 / KAF` as the dominant identity;
- the fan-project/unofficial status;
- a short fan-authored statement;
- a high-impact visual with useful alt text and credit/source link;
- an official-site CTA;
- a visible journey/scroll cue linking to `#journey`;
- optional compact metadata without reverting to a dashboard/card layout.

The visual composition should use deliberate image masking/cropping, layered display type, signal/petal/line motifs, and controlled negative space. Do not obscure critical face/detail regions by default.

### R4 — Motion and reduced motion

- Use the existing Motion dependency only for restrained first-viewport reveal and subtle decorative movement.
- Do not implement scroll-linked journey behavior in this task.
- Respect `MotionConfig reducedMotion="user"` integration and/or `useReducedMotion`.
- The hero must be complete and readable when all animation is removed.
- Avoid perpetual particles, large animated blur layers, or autoplay media.

### R5 — Responsive/accessibility contract

- Work at 360px, 390px, 768px, 1024px, and 1440px without horizontal overflow.
- Preserve semantic header/navigation/section/heading structure.
- Use a semantic link for the scroll cue and CTAs.
- Give the hero image intrinsic dimensions through props/attributes.
- Ensure focus visibility and readable text/image contrast.
- Essential content must not be hidden behind hover or animation.

### R6 — Exclusive file ownership

This task may edit:

- `src/styles/tokens.css`;
- `src/styles/base.css`;
- `src/pages/HomePage/sections/SiteHeader.tsx`;
- `src/pages/HomePage/sections/SiteHeader.module.css`;
- `src/pages/HomePage/sections/HeroSection.tsx`;
- `src/pages/HomePage/sections/HeroSection.module.css`;
- uniquely named focused tests such as `tests/SiteHeader.test.tsx` and `tests/HeroSection.test.tsx`;
- this task's Trellis artifacts.

This task must not edit:

- `src/pages/HomePage/HomePage.tsx`;
- `src/pages/HomePage/HomePage.module.css`;
- other section files;
- `src/content/**`;
- `src/assets/**`;
- integration/E2E tests.

Use prop fixtures in focused tests. Do not import future Wave 1 content modules merely to preview the component.

## Acceptance Criteria

- [x] **AC-01**: Semantic global tokens define the dark/luminous palette, typography, lines, focus, and motion roles without breaking existing CSS variable consumers.
- [x] **AC-02**: `SiteHeader` visibly identifies the fan project and unofficial status and exposes semantic anchor navigation with keyboard/touch usability.
- [x] **AC-03**: `HeroSection` clearly renders `花譜 / KAF`, fan-authored copy, one visual with credit, official CTA, and `#journey` cue through typed props.
- [x] **AC-04**: The hero composition reads as anime / virtual-singer key art rather than the previous paper editorial spread or generic glass dashboard.
- [x] **AC-05**: Hero/header remain usable at 360, 390, 768, 1024, and 1440 widths with no component-level horizontal overflow.
- [x] **AC-06**: Reduced-motion rendering contains all content and removes non-essential reveal/decorative movement.
- [x] **AC-07**: Meaningful images have alt text, decorative graphics are hidden from assistive technology, and interactive elements have visible focus.
- [x] **AC-08**: Focused DOM tests cover identity, unofficial status, accessible navigation, official CTA, journey cue, visual alt text, and credit link.
- [x] **AC-09**: No content/assets, Journey, Works/Gallery, `HomePage.tsx`, or legacy HomePage CSS files are modified.
- [x] **AC-10**: `mise run check` passes.

## Out of Scope

- Journey scroll logic, Works/Gallery/Official Links/Footer sections, route composition, content facts, media downloading, or E2E integration.
- New fonts requiring a network/runtime dependency unless the parent plan is revised.
- A global design-system component library.

## Dependencies

None for implementation. This is a Wave 1 task and can run concurrently with all other Wave 1 tasks.

## Blocking Open Questions

None. Use representative local test fixtures and the semantic palette contract; Wave 2 supplies final approved media/content.
