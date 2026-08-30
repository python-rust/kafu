# Guide KAF journey through responsive scrollytelling

## Goal

Make `成长轨迹` guide readers through all six eras through normal upward and
downward page scrolling on both desktop and mobile. The interaction must not
require clicking a timeline, must preserve complete factual content, and must
use one dominant image at a time without the current secondary-image collage.

The rest of the homepage must continue to behave as a mobile-first product,
including narrow portrait phones, short landscape viewports, large user text,
reduced motion, touch interaction, and the existing fixed navigation.

## Confirmed baseline

- Journey currently uses Radix Tabs. A reader sees only one era and must click,
  tap, or use the keyboard before the narrative changes.
- The current panel composes one large image with a smaller overlapping image.
  The smaller image competes with the era narrative and is explicitly no longer
  wanted.
- The page already has verified responsive media, Motion, fixed Chinese
  navigation, a static profile, Gallery lightbox, and browser tests at 320–1440
  widths.
- Current measured page height is approximately 6,966px at 1440×900 and 8,367px
  at 390×844. Reintroducing a guided Journey may increase page length, but the
  increase must come from real chronological reading steps rather than empty
  viewport padding.

## Research decision

Use `scrollama@3.2.0` as the single scrollytelling dependency and remove
`@radix-ui/react-tabs`.

Reasons:

- Scrollama is purpose-built for step-driven scrollytelling and uses
  `IntersectionObserver` rather than scroll-event polling.
- Its official patterns cover sticky side-by-side graphics and a dedicated
  mobile offset strategy.
- Version 3 includes ResizeObserver-based dimension refresh and accepts actual
  step elements, so the integration can remain local to Journey.
- It does not alter native scrolling. This is scrollytelling, not scroll-jacking.
- Motion already owns image/text transitions; GSAP/ScrollTrigger would duplicate
  animation responsibilities and add substantially more runtime surface.
- The community React wrapper has an open maintainer request and weaker test/
  TypeScript evidence. Use the mature vanilla package behind one section-local
  React effect instead.

## Requirements

### R1. Scroll-guided chronological progression

- Render six chronological semantic step articles in source order.
- Scrollama must activate an era when its step crosses the configured reading
  line.
- Scrolling downward advances the active image/title/year; scrolling upward
  restores the previous era.
- No click, tap, keyboard command, autoplay, timer, wheel interception, or
  synthetic scroll is required to experience the full chronology.
- Keep native browser scrolling and all existing section anchors.

### R2. One dominant Journey image

- Render exactly one active sticky-stage image at a time.
- Remove secondary/overlapping Journey images from rendering and from the
  Journey chapter contract.
- Preserve `object-fit: contain`, intrinsic dimensions, responsive 1×/2×
  candidates, lazy loading, and verified provenance.
- Image transitions use only opacity and a restrained transform through the
  existing Motion runtime.

### R3. Desktop composition

- At wide viewports, use Scrollama's side-by-side pattern: sticky image stage on
  one side, chronological steps on the other.
- Each step contains one year, one Chinese title, substantive factual paragraphs,
  and its verified milestones/source links.
- Inactive steps remain readable but visually subordinate; the active step is
  unmistakable without relying on animation alone.
- The sticky stage releases before `代表作品`.

### R4. Mobile and tablet composition

- Mobile uses the same six source-ordered steps and the same Scrollama state.
- The active image remains visible in a top sticky stage beneath the fixed
  header; opaque content surfaces scroll through the remaining reading area.
- Use a pixel Scrollama trigger offset near 72% of the stable layout viewport on
  compact layouts, following the
  official mobile pattern, so dynamic browser chrome does not repeatedly shift
  the activation line.
- Use stable `svh` sizing rather than dynamic `vh`/`dvh` for the stage and step
  pacing.
- Support portrait phones, tablet portrait, and short landscape viewports.
- No horizontal page overflow; internal horizontal scrolling remains limited to
  existing explicit controls such as navigation and Gallery thumbnails.

### R5. Reduced motion and progressive content

- With `prefers-reduced-motion: reduce`, remove crossfade/translation motion.
- All six eras, summaries, milestones, source links, and one full-size image per
  era remain available in normal document flow.
- Reduced-motion readers must not depend on a changing sticky image to access
  visual content.

### R6. Whole-site mobile regression pass

- Re-audit Header, Hero, Profile, Journey, Works, Gallery, Official Links, and
  Footer at 320, 360, 390, 430, 768, and short landscape widths.
- Preserve 44px interactive targets, fixed-header anchor offsets, readable type,
  responsive images, and no essential-content clipping.
- Add a short-landscape browser case and keep 200% root-text coverage.
- Adjust non-Journey mobile CSS only where browser evidence identifies an actual
  defect; do not redesign already-correct sections speculatively.

### R7. Dependency and architecture discipline

- Add only `scrollama@3.2.0` and remove `@radix-ui/react-tabs`.
- Do not add GSAP, ScrollTrigger, Scrollama React wrappers, Lenis, Swiper, an
  icon package, or a second animation runtime.
- Scrollama setup, callbacks, breakpoint offset updates, and destruction stay in
  `JourneySection` or one narrowly owned local adapter.
- Do not reimplement step detection, progress observation, or resize observation.

## Acceptance Criteria

- [x] `成长轨迹` contains six semantic chronological steps in source order.
- [x] Natural downward scrolling activates 2018 → 2019 → 2020–2021 →
      2022–2023 → 2024 → 2025–2026.
- [x] Natural upward scrolling reactivates earlier eras.
- [x] Journey renders one active stage image and no secondary image.
- [x] Desktop uses a sticky side stage and the stage releases before Works.
- [x] Mobile uses a sticky top stage with a pixel trigger offset and does not
      require horizontal timeline interaction.
- [x] Reduced motion renders six in-flow images and complete text without image
      transition motion.
- [x] Scrollama is destroyed on unmount and updates its compact/wide offset when
      the layout breakpoint or device orientation changes.
- [x] `scrollama@3.2.0` replaces `@radix-ui/react-tabs`; there is no other
      intentional dependency delta.
- [x] The full site has no document-level horizontal overflow at 320, 360, 390,
      430, 768, 1024, and 1440 widths.
- [x] A short mobile-landscape viewport remains usable and Journey leaves room
      for readable text beneath the sticky stage.
- [x] 200% root text, keyboard focus, fixed-header anchors, 44px touch targets,
      Gallery/lightbox, responsive media, and one eager Hero image remain green.
- [x] `mise run check`, `mise run e2e`, task validation, and `git diff --check`
      pass.
- [x] Frontend SPEC records Scrollama ownership, mobile pixel-offset rules,
      one-image Journey composition, and reduced-motion fallback.

## Out of Scope

- Rewriting the already-approved Hero/Profile/Works/Gallery content.
- New KAF media acquisition, image upscaling, video, audio, or autoplay.
- Continuous parallax, progress-scrubbed timelines, canvas/WebGL, or scroll snap
  that takes control of the document scroll position.
- Restoring the previous secondary Journey image.

## Risks and mitigations

- **Mobile browser chrome changes viewport height.** Use stable `svh` geometry
  and a pixel activation offset; update it on breakpoint/orientation changes,
  not on every visual-viewport resize.
- **A sticky stage can leave too little reading space in landscape.** Add a
  short-height layout that reduces stage height and verify it in Chromium.
- **Long steps can make the page feel padded.** Let content determine height,
  then apply only the minimum spacing required for reliable step activation.
- **Dynamic visual changes can affect motion-sensitive users.** Provide a
  complete in-flow reduced-motion variant with no transition.
- **Replacing Tabs can reduce direct random access.** The product requirement
  prioritizes guided chronology; each step retains a stable anchor and remains
  directly linkable.

## Blocking questions

None. The user delegated research, interaction choice, responsive design,
implementation, SPEC updates, validation, and archival.
