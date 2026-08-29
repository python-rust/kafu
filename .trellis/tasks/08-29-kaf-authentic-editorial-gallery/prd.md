# Remove AI-template copy and redesign KAF gallery

## Goal

Make the homepage feel authored for 花譜 rather than assembled from common
AI-generated landing-page patterns. Remove decorative microcopy and explanatory
copy that merely narrates the interface, replace the remaining generic English
labels with direct Japanese or content-specific wording, and redesign the
eight-image archive around one clear visual focus.

The result must be more visually striking than the current pale editorial pass,
while preserving the existing verified media, factual content, direct anchors,
accessibility, reduced-motion behavior, and source attribution.

## Confirmed baseline

- The repository is on `main`, clean, and five commits ahead of `origin/main`
  before this task starts.
- The desktop page still contains more than fifty recurring sub-14px labels or
  fragments, including slash-separated all-caps overlines, leading-zero
  sequence numbers, English chapter subtitles, repeated credit prefixes, and
  decorative status metadata.
- Current examples include `VOICE / IMAGE / MEMORY`, `KAF / CHRONOLOGY`,
  `CHAPTER 03`, `CURRENT WORK`, `ARCHIVE / 01`, and interface-narrating prose
  such as “沿着时间向下阅读……”.
- The current Visual Archive renders eight independently captioned figures in
  an irregular 12-column grid. It has no single focal image, no deliberate
  browsing state, and no immersive inspection mode.
- The project already has Motion, intrinsic image dimensions, typed media
  records, CSS Modules, reduced-motion handling, and browser tests. Those are
  the preferred foundations.

## Requirements

### R1. Remove decorative and AI-template microcopy

- Remove eyebrow/overline text from Hero, Journey, Works, Gallery, and Official
  Links unless a string has a concrete content or navigation purpose.
- Remove leading-zero indexes, faux-system labels, slash-separated category
  strings, English chapter subtitles, `CURRENT`/`FEATURED` markers, and repeated
  `SOURCE`/`VISUAL CREDIT` prefixes used as decoration.
- Do not replace removed English microcopy with equally decorative Japanese.
  Japanese is acceptable only when it is the actual title, action, fact, or
  meaningful brand text.
- Every visible string must serve at least one of these jobs: identity, factual
  content, navigation/action, attribution, or legal/disclaimer.
- Remove prose that explains how the page scrolls, how a section is arranged,
  or what the interface implementation does. The interface must communicate
  that behavior directly.

### R2. Replace the pale template with image-led KAF art direction

- Move away from the current mostly white/pink page without returning to the
  former generic neon-grid/cyber-dashboard treatment.
- Use a restrained theatrical palette: warm near-black / plum surfaces,
  off-white text, KAF pink as a limited accent, and image-derived color where
  possible.
- Avoid repeated radial glow backgrounds, glass cards, pills, arbitrary rounded
  containers, decorative grids, and generic “premium” gradients.
- Let KAF artwork, cropping, whitespace, contrast, and composition create the
  visual identity.
- Keep headings controlled and close to body scale; do not create hierarchy by
  pairing giant display text with tiny captions.

### R3. Redesign the eight-image archive

- Replace the irregular eight-card grid with one coherent visual theatre:
  one active image, a clear title/credit area, and a selectable thumbnail rail.
- Preserve all eight images, source order, intrinsic dimensions, alt text,
  credits, and source URLs.
- The active image must preserve artwork aspect ratio. Thumbnails may crop for
  consistency, but the selected image and full-screen view must not distort it.
- Selecting a thumbnail must update the active image with a restrained
  transform/opacity transition and a clear selected state.
- Opening the active image must use a mature open-source lightbox rather than a
  custom modal. It must support keyboard navigation, Escape close, focus
  management, touch/swipe navigation, and intrinsic image sizing.
- The gallery must remain linear and usable without motion, and the thumbnail
  rail must remain usable at 320px width and with 200% user text.

### R4. Simplify the rest of the page

- Header navigation uses direct Japanese section names and no repeated fan-site
  status label.
- Hero keeps the 花譜 identity, one content-specific statement, image, two
  explicit actions, and required attribution; remove project metadata and
  repeated disclaimer/status strings.
- Journey keeps its sticky desktop visual behavior, Japanese chapter titles,
  factual summaries, milestones, and sources; remove English subtitle and
  chapter-number decoration.
- Works keeps one featured work and supporting works, but metadata and actions
  must be concise and content-specific.
- Official Links keeps direct destinations and useful link notes; remove the
  generic section explanation.
- Keep the fan-project disclaimer once in the footer, in direct Japanese.

### R5. Component reuse without speculative abstraction

- Introduce page-local shared components only where the same contract is used
  by multiple homepage sections.
- At minimum, consolidate repeated media-credit rendering and repeated section
  heading structure if the final markup still repeats them.
- Reuse Motion and the selected open-source lightbox. Do not add a second
  animation framework, gallery layout framework, icon library, or design-system
  package.
- Keep section-specific composition in section components and CSS Modules.

### R6. Quality and regression coverage

- Preserve section IDs, chapter IDs, outbound destinations, semantic heading
  order, intrinsic image sizing, lazy/eager image loading, focus visibility,
  reduced motion, and horizontal-overflow protections.
- Add regression coverage for the absence of banned template copy, Japanese
  navigation labels, gallery selection, lightbox open/close/navigation, and the
  eight-image contract.
- Update frontend SPEC with concrete anti-template copy rules, content-job
  rules, page-local component reuse rules, and gallery/lightbox contracts.

## Acceptance Criteria

- [x] No visible eyebrow/overline element remains in the homepage sections.
- [x] The rendered page does not contain `VOICE / IMAGE / MEMORY`,
      `KAF / CHRONOLOGY`, `SELECTED DISCOGRAPHY`, `VISUAL NOTES`,
      `OFFICIAL CHANNELS`, `CHAPTER`, `CURRENT WORK`, `ARCHIVE /`,
      `VISUAL CREDIT`, or the interface-explaining Journey/Gallery paragraphs.
- [x] Primary navigation labels are `軌跡`, `作品`, `視覚`, and `公式`.
- [x] Hero metadata and repeated fan-project status strings are removed; the
      legal/fan disclaimer remains once in the footer.
- [x] Journey renders Japanese chapter titles without visible English subtitle
      or chapter-number decoration, while all six chapters and milestone source
      links remain available.
- [x] The Visual Archive renders exactly one active stage image plus eight
      selectable thumbnail controls in source order.
- [x] Selecting a thumbnail updates the stage title, image, attribution, and
      selected state.
- [x] Clicking the stage opens an open-source lightbox at the selected image;
      keyboard next/previous and Escape close work in Chromium.
- [x] The selected lightbox package supports React 19 and is the only new
      runtime dependency.
- [x] The page uses a dark/image-led KAF visual system without neon grids,
      repeated glow fields, or a mostly white page foundation.
- [x] At 1440×900, recurring visible text is at least 14px, body copy is at
      least 16px, and section headings stay below 72px.
- [x] At 320px and 200% root text, the document has no horizontal overflow and
      essential text/actions are not clipped.
- [x] Existing content/media/source contracts remain intact.
- [x] `mise run check` and `mise run e2e` pass.
- [x] Frontend SPEC records the new content, component, gallery, and visual
      constraints.

## Out of Scope

- Adding new artwork, fonts, audio, video, WebGL, canvas, or remote content.
- Rewriting the historical facts, changing official URLs, or changing asset
  licensing/provenance.
- A site-wide design-system package, CMS, theme switcher, or reusable gallery
  framework for hypothetical routes.
- Replacing the existing Journey observer/sticky behavior that the user already
  considers successful.

## Risks and mitigations

- **Risk:** Darkening the page can regress contrast or revive the former neon
  aesthetic. **Mitigation:** use flat warm dark surfaces, limited KAF pink, no
  grid/glow motifs, and browser contrast assertions.
- **Risk:** A lightbox dependency can inflate the initial bundle. **Mitigation:**
  select a React-19-compatible modular package and lazy-load the lightbox code
  only when opened.
- **Risk:** Removing labels can hide important provenance. **Mitigation:** keep
  creator/source attribution visible, but render the credit itself rather than
  adding decorative prefixes.
- **Risk:** Thumbnail controls can become cramped at narrow widths. **Mitigation:**
  use a horizontal scroll-snap rail with 44px minimum targets and test at 320px
  plus 200% root text.

## Blocking questions

None. The user explicitly delegated visual direction, research, implementation,
SPEC updates, and task archival for this second pass.

## Completion evidence

- Desktop 1440×900 document height: `8,549px`, down from the second-pass
  baseline of `11,014px` (`-22.4%`) without hiding content.
- Desktop section headings: `57.2px`; body: `16px`; smallest recurring visible
  text: `14.752px`; horizontal overflow: `0px`.
- Mobile 390×844 smallest recurring visible text: `14px`; document overflow:
  `0px`; the gallery rail scrolls internally without widening the document.
- Gallery stage at 1440×900: approximately `991×620px`, followed by eight
  source-ordered semantic thumbnail controls.
- `yet-another-react-lightbox@3.32.2` is the only new runtime dependency and
  supports React 19 through its declared peer range.
- Vite emits the lightbox as separate lazy chunks (approximately `27.5kB` JS /
  `10.4kB` gzip and `5.3kB` CSS / `1.4kB` gzip), keeping it out of the initial
  route chunk.
- Vitest: 6 files / 22 tests passed.
- Chromium Playwright: 10 tests passed, including keyboard navigation, Escape
  close, 320px, 200% root text, reduced motion, type floors, contrast, sticky
  release, and intrinsic image loading.
- Source scans found no remaining banned copy, `eyebrow`, `data-rhythm`,
  `useScroll`, `useTransform`, radial glow, glass/backdrop-filter, or decorative
  chapter/index rendering in the homepage implementation.
