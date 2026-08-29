# Localize KAF storytelling for Chinese audiences

## Goal

Turn the existing image-led KAF archive into a product that a first-time
Simplified Chinese reader can understand without prior knowledge. The page must
answer three questions in order:

1. Who is 花谱 / 花譜 (KAF)?
2. Why is her development as a virtual singer significant?
3. What should a new listener watch or hear next?

The redesign must also fix the low-contrast Hero navigation, provide persistent
orientation across the long page, and make the historical chapters communicate
visible transformation rather than only changing an image while scrolling.

## Confirmed baseline

- The header is absolutely positioned over the Hero image. Navigation text uses
  a muted light color without a stable surface, so the four items lose contrast
  where the artwork is pale.
- Primary navigation and section identity are Japanese (`軌跡`, `作品`, `視覚`,
  `公式`) even though the document language is `zh-CN` and the target audience is
  now mainland Chinese.
- The Hero currently says only that this is a private archive. It does not
  explain that KAF debuted in 2018 at age 14, performs through a 3D avatar, is a
  foundational KAMITSUBAKI artist, or how a newcomer should read the site.
- Journey provides chronology and a sticky image, but the chapter title and
  image change do not explicitly state how the artist changed from one period to
  the next.
- Motion, AnimatePresence, IntersectionObserver-based chapter activation,
  responsive verified media, reduced-motion handling, and browser tests already
  exist. They are the preferred implementation foundation.

## Evidence and product decisions

- Official KAMITSUBAKI and KAF profiles describe KAF as the virtual singer at
  the origin of KAMITSUBAKI STUDIO, debuting in 2018 at age 14 through a 3D
  avatar without revealing her face, later reaching the Nippon Budokan and an
  arena-scale Yoyogi performance.
- KAF has an official Bilibili presence using the Simplified Chinese display
  name `花谱`; this is the preferred Chinese UI name. Official Japanese titles
  such as `観測`, `不可解`, `怪歌`, `寓話`, and `深愛` remain unchanged as proper
  nouns.
- Microsoft localization guidance treats market-specific language and style as
  a product contract, not literal translation. W3C Chinese-language resources
  likewise require explicit Chinese-script layout support.
- Scroll storytelling should connect a visible content step to a meaningful
  visual/state change. Existing Motion AnimatePresence and native
  IntersectionObserver already provide this without a new runtime dependency.
- Non-essential movement must respect reduced-motion preferences.

## Requirements

### R1. Stable navigation contrast and page orientation

- Replace the transparent absolute header with a persistent warm-dark navigation
  surface that remains legible over light and dark artwork.
- Use Simplified Chinese navigation labels:
  `认识花谱`, `成长轨迹`, `代表作品`, `视觉档案`, `官方入口`.
- Add the new `#about` destination and preserve the existing section anchors for
  Journey, Works, Gallery, and Official Links.
- Observe page sections and mark the active destination with
  `aria-current="location"` plus an unambiguous visual state.
- Header and mobile navigation targets remain at least 44px high.
- The header must not use a light-artwork-dependent text color or an ornamental
  glass card.

### R2. Simplified Chinese localization

- Set visible interface headings, action labels, explanations, accessibility
  labels, and footer disclosures to natural Simplified Chinese.
- Use `花谱` for Chinese interface identity and explain once that the official
  Japanese spelling is `花譜` and the Latin name is `KAF`.
- Preserve official Japanese work/event names in their authoritative form and
  mark them with `lang="ja"` where rendered separately.
- Replace Traditional Chinese glyphs in UI copy (`視覚`, `軌跡`, etc.) and remove
  Japanese UI phrases such as `新しいタブで開く`.
- Prioritize Simplified Chinese system fonts for Chinese copy while keeping a
  Japanese font role for official Japanese names.
- Update page title and meta description for Chinese discovery.

### R3. Newcomer onboarding story

- Add a `认识花谱` section immediately after Hero.
- The section must communicate four concise beats:
  1. who she is;
  2. why the voice/virtual identity matters;
  3. how the activity moved from the internet into major physical venues;
  4. a recommended starting path through the works already on the page.
- On capable desktop layouts, use one sticky visual stage and in-flow narrative
  steps. The active step changes the stage image, title, key statement, and
  progress state.
- On mobile and reduced-motion modes, render all four beats linearly in source
  order with their own images and no sticky dependency.
- Reuse verified local media and the shared responsive artwork component. No new
  image acquisition is needed.
- Add official profile/history references to a bottom disclosure rather than
  adding citation clutter to every paragraph.

### R4. Make Journey communicate transformation

- Keep all six chapters, milestone facts, anchors, images, source links, and
  sticky desktop stage.
- Give every chapter a Chinese narrative title and retain the original Japanese
  era/work label as a proper noun.
- Add one concise transformation pair per chapter, for example
  `网络中的声音 → 第一次个人现场`.
- The sticky stage must animate the transformation pair together with the image
  and year when the active chapter changes.
- Chapter articles must expose the same transformation in normal document flow,
  so mobile and reduced-motion readers receive equivalent information.
- Do not add continuous parallax, per-frame React state, or decorative motion.

### R5. Chinese-first product entry points

- Hero primary action becomes `开始认识花谱` and moves to `#about`.
- Hero secondary action becomes `查看成长轨迹` and moves to `#journey`.
- Official links remain available in the final section and use Chinese notes and
  Chinese accessible names.
- Works and Gallery section identity becomes `代表作品` and `视觉档案`.
- The footer remains the single fan-project disclaimer location and adds a
  compact `资料来源` disclosure for official profile/history references.

### R6. Motion, reuse, and architecture discipline

- Reuse Motion already installed in the project. Use native
  IntersectionObserver, AnimatePresence, and transform/opacity transitions for
  narrative state changes.
- Reuse the existing responsive media, SectionHeading, lightbox, and Journey
  observer contracts.
- Do not add Scrollama, GSAP, Lenis, another animation framework, an icon
  package, a carousel package, or a generic design-system layer.
- A new page-local component is valid only for the independently owned Chinese
  onboarding story or a cross-section reference disclosure.
- Keep state low-frequency and component-local.

### R7. Accessibility and regression coverage

- Preserve one H1 and sequential semantic section headings.
- Preserve all existing keyboard, focus, image-loading, intrinsic-size,
  lightbox, reduced-motion, 320px, and 200% text contracts.
- Add browser tests for header contrast, active navigation, Chinese labels,
  onboarding step progression, Journey transformation progression, and absence
  of legacy Japanese UI labels.
- The active nav state must remain understandable without motion.

## Acceptance Criteria

- [x] Header navigation is readable against the pale Hero region and has a
      measured text/background contrast ratio of at least 4.5:1.
- [x] The header remains available after leaving Hero and updates
      `aria-current="location"` for `#about`, `#journey`, `#works`, `#visuals`,
      and `#links`.
- [x] Primary navigation labels are `认识花谱`, `成长轨迹`, `代表作品`,
      `视觉档案`, and `官方入口`.
- [x] Hero and all interface/accessibility copy are Simplified Chinese; no
      visible legacy UI labels `軌跡`, `視覚`, `公式`, `新しいタブで開く`, or
      `画像を選ぶ` remain.
- [x] Official Japanese names remain intact where they are content rather than
      interface chrome.
- [x] A new `#about` section renders four source-ordered newcomer story beats.
- [x] Desktop onboarding uses one sticky active visual; mobile and
      reduced-motion modes expose all four beats linearly.
- [x] Journey has six Chinese narrative titles and six transformation pairs;
      early, middle, and final chapter transitions update the sticky stage.
- [x] Hero actions lead to `#about` and `#journey` with Chinese labels.
- [x] Works/Gallery/Official section headings are `代表作品`, `视觉档案`, and
      `官方入口`.
- [x] The footer includes one fan-project disclaimer, media provenance, and a
      collapsed official `资料来源` disclosure.
- [x] No runtime dependency is added.
- [x] Existing responsive media and lightbox contracts remain green.
- [x] `mise run check` and `mise run e2e` pass.
- [x] Frontend SPEC records Chinese localization, navigation-orientation,
      onboarding-story, and narrative-motion contracts.

## Implementation results

- Desktop 1440×900: fixed header 81px, document height 11,091px, five H2s at
  57.2px, zero horizontal overflow.
- Mobile 390×844: fixed header 109px, all four onboarding beats and six Journey
  chapters remain linear, zero horizontal overflow.
- The browser suite measured header/nav contrast against a worst-case pale
  artwork composite and passed the 4.5:1 threshold.
- Five primary destinations update `aria-current="location"`; Journey continues
  to use `aria-current="step"` for its six years.
- Seven Vitest files / 26 tests and thirteen Chromium Playwright tests pass.
- Production build remains code-split for GalleryLightbox, and `package.json` /
  `pnpm-lock.yaml` are unchanged.

## Out of Scope

- Audio/video embedding, autoplay, a playlist player, user accounts, comments,
  likes, CMS features, or analytics.
- Adding unverified biography facts, new media, or translated official work
  titles that could be mistaken for official titles.
- Replacing the existing image-quality pipeline or Gallery lightbox.
- Continuous scroll-linked parallax or a third-party scrollytelling runtime.

## Risks and mitigations

- **Risk:** A fixed header reduces usable viewport height. **Mitigation:** keep it
  compact, update global scroll padding, and test all anchor destinations.
- **Risk:** A second sticky story feels repetitive beside Journey.
  **Mitigation:** keep onboarding to four short steps with a different purpose:
  comprehension first, chronology second.
- **Risk:** Chinese summaries become unverified interpretation. **Mitigation:**
  distinguish official facts from concise editorial framing and keep official
  source URLs in the footer disclosure.
- **Risk:** Added motion causes discomfort or page weight. **Mitigation:** animate
  only opacity/transform at low-frequency active-step changes and fully support
  reduced motion.

## Blocking questions

None. The user delegated product definition, research, implementation, SPEC
updates, and archival for this iteration.
