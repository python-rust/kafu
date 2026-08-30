# Refine KAF copy and redesign the journey experience

## Goal

Make the homepage read and behave like a deliberate artist introduction rather
than an annotated prototype. Remove explanatory and slogan-like copy, keep the
Chinese-first product orientation, replace the duplicated scroll-driven
storytelling pattern with one concise static profile and one user-controlled era
experience, and restore the missing third album.

The resulting page must let a Chinese reader identify 花谱, understand the
major stages of her career, inspect all five original albums, and continue to
official sources without encountering interface narration or generic AI-style
taglines.

## Confirmed problems

- The Hero currently explains what the page will do (`这里用几分钟讲清...`) and
  uses a promotional sentence (`她从网络里被听见...`) instead of presenting the
  artist identity and direct destinations.
- The `认识花谱` section repeats a title + slogan + explanation pattern four
  times. Phrases such as `虚拟形象是入口，真正留下人的是声音` and
  `先听起点，再看现场，最后进入第二章` are interpretive slogans rather than
  factual website content.
- `认识花谱` and `成长轨迹` both use a sticky visual controlled by page scroll,
  making the interaction repetitive and making the page feel longer than its
  information requires.
- Journey renders a Chinese title, a small Japanese subtitle, and a
  `changeFrom → changeTo` line before the actual paragraph. This duplicates the
  same idea in three text levels and creates the cramped hierarchy reported by
  the user.
- The representative works list jumps from the second album to the fourth
  album. Official discography confirms `狂想α / 狂想β` was released on
  2023-03-08 as the third original album.

## Research-backed product decisions

- Mature artist homepages reviewed (花譜, 米津玄師, 宇多田ヒカル, YOASOBI)
  foreground identity, current work, news, discography, or a short established
  brand line. They do not explain how the visitor should interpret the page.
- Hero copy will therefore be reduced to the artist name, official Japanese /
  Latin naming, one factual role line, and two direct in-page destinations.
- The existing newcomer section will become a static editorial profile. It
  will contain an official-fact-based biography, one artwork, and a small set of
  factual profile attributes. It will not retain sticky activation, slogans,
  or four artificial “questions”.
- Journey will become a controlled era theatre built with the open-source
  Radix Tabs primitive. Radix supplies the WAI-ARIA tabs pattern and keyboard
  navigation; the project continues to own visual composition and content.
- Existing Motion will animate only the active panel's image/content entrance.
  No new animation runtime, smooth-scroll library, carousel package, or WebGL
  layer is justified.
- Official Japanese work/event titles remain in paragraphs and milestone facts
  where they are actual names. A separate small “original title” line is not
  required for every era.

## Requirements

### R1. Hero becomes normal artist-site identity

- Keep one H1: `花谱`.
- Keep the naming line `花譜 / KAF`, marked as Japanese where appropriate.
- Replace statement/description prose with one factual role line:
  `日本虚拟歌手，KAMITSUBAKI STUDIO 旗下艺人。`
- Primary action is `人物介绍` and links to `#about`.
- Secondary action is `代表作品` and links to `#works`.
- Do not render copy that explains how long the page takes, what it will teach,
  or how the user should scroll/read it.

### R2. `认识花谱` becomes a concise editorial profile

- Remove the four-beat scroll observer, sticky stage, progress bars, and
  statement/summary duplication.
- Render one stable two-column profile composition on desktop and a linear
  composition on narrow viewports.
- Use factual copy grounded in official profile/history sources:
  - 2018 start;
  - age 14 at debut;
  - 3D avatar / face not publicly shown;
  - KAMITSUBAKI STUDIO affiliation;
  - original music, releases, and solo live activity;
  - Nippon Budokan in 2022 and Yoyogi First Gymnasium in 2024.
- Provide only factual profile attributes. Labels such as `开始活动`, `所属`,
  `活动形式`, and `代表舞台` are valid because they identify concrete data.
- Reuse one existing verified responsive artwork. Do not acquire new media.
- Optional reveal motion is limited to a one-time low-amplitude opacity /
  transform entrance; the content must not depend on scroll state.

### R3. Journey becomes an interactive era theatre

- Replace the sticky scroll-driven chapter activation with a controlled Radix
  Tabs implementation.
- Render six year triggers in chronological order.
- Each active panel contains:
  - one Chinese narrative title;
  - one expanded factual description;
  - the existing dated milestones and official source links;
  - the existing verified primary/secondary visuals in an editorial collage;
  - previous/next controls where applicable.
- Remove the separate `originalTitle`, `changeFrom`, and `changeTo` UI layers.
  Official Japanese names remain inside factual paragraphs/milestones.
- Arrow keys, Home, End, Tab, click, and touch must work through Radix Tabs.
- The active trigger must be visually unambiguous and expose the standard tab
  semantics supplied by Radix.
- On narrow viewports, the year trigger rail may scroll horizontally inside its
  own container; the document itself must not overflow.
- Reduced motion removes panel entrance transitions but does not change
  content, controls, or keyboard behavior.

### R4. Complete original-album sequence

- Add the third original album `狂想β` (2023-03-08) to representative works,
  sourced to the official discography page.
- The displayed original-album sequence must include:
  `観測α`, `魔法α`, `狂想β`, `寓話`, `深愛`.
- Keep the fifth album as the single featured/current work.
- Do not misrepresent an existing verified artwork as the official `狂想β`
  cover. The third-album card may use the existing typographic fallback.
- Supporting work layout must handle four items without awkward orphaning at
  desktop, tablet, and mobile widths.

### R5. Copy discipline

- Every visible line must be identity, fact, work/event name, navigation,
  action, attribution, or legal/source information.
- Remove or forbid the following production strings and close variants:
  - `她从网络里被听见`;
  - `这里用几分钟讲清`;
  - `一个从网络深处被发现的声音`;
  - `虚拟形象是入口`;
  - `从屏幕里的歌`;
  - `先听起点`;
  - `网络中的投稿` / `第一次被看见` as decorative change labels.
- Do not replace removed slogans with new poetic or rhetorical taglines.
- Official proper nouns remain unchanged.

### R6. Dependency and architecture boundary

- Add only `@radix-ui/react-tabs` as the new runtime dependency, pinned to the
  verified registry version compatible with React 19.
- Keep the dependency behind the Journey section; do not create a global design
  system or generic tab abstraction for one use case.
- Reuse `ResponsiveArtwork`, `SectionHeading`, Motion, current content data,
  and existing source/provenance records.
- Remove obsolete primer/Journey observer state and related tests/styles.

### R7. Accessibility and quality

- Preserve fixed-header contrast, page-level active navigation, one H1,
  sequential headings, source links, lightbox behavior, responsive images, and
  one eager Hero image.
- Add unit/browser coverage for:
  - factual Hero copy and absence of banned slogans;
  - static profile facts;
  - six accessible Journey tabs and keyboard navigation;
  - panel previous/next controls;
  - all five original albums including `狂想β`;
  - mobile trigger-rail containment;
  - reduced-motion equivalence.
- Preserve 320px reflow, 200% text reflow, 44px controls, and zero document
  horizontal overflow.

## Acceptance Criteria

- [x] Hero contains only `花谱`, `花譜 / KAF`, the factual role line, and the
      `人物介绍` / `代表作品` actions.
- [x] No page-explaining or slogan-like Hero paragraph remains.
- [x] `认识花谱` is a static factual profile and has no IntersectionObserver,
      sticky stage, progress indicator, or four artificial question cards.
- [x] The profile includes 2018, age 14, KAMITSUBAKI STUDIO, and the 2022 / 2024
      venue facts.
- [x] Journey uses Radix Tabs with six chronological triggers and no
      scroll-driven active chapter.
- [x] Journey panels have one title, expanded description, milestones, source
      links, and verified imagery; no separate original-title or change-pair
      rows remain.
- [x] Keyboard ArrowLeft/ArrowRight/Home/End changes the active era.
- [x] Previous/next controls change the active era and are disabled/absent at
      the correct boundaries.
- [x] Representative works include all five original albums and `狂想β` links
      to the official 2023-03-08 discography page.
- [x] No unverified album-cover image is added.
- [x] The banned GPT-like strings are absent from production rendering/source.
- [x] `@radix-ui/react-tabs` is the only dependency delta.
- [x] Existing media, Gallery, footer, navigation, and provenance contracts
      remain intact.
- [x] `mise run check`, `mise run e2e`, task context validation, and
      `git diff --check` pass.
- [x] Frontend SPEC records artist-site copy boundaries, static-profile rules,
      interactive-era tabs, and complete-discography expectations.

## Out of Scope

- New images, album-cover scraping, audio/video embeds, autoplay, analytics,
  comments, accounts, or CMS features.
- Translating official Japanese work titles into unofficial Chinese titles.
- Replacing the Gallery lightbox or responsive-media generation pipeline.
- WebGL, canvas, 3D scenes, continuous parallax, smooth-scroll interception, or
  auto-advancing content.

## Risks and mitigations

- **Risk:** Tabs hide non-active chronology at a glance. **Mitigation:** keep all
  six years visible in the rail and preserve milestone detail in each panel.
- **Risk:** A new dependency conflicts with React 19. **Mitigation:** registry
  peer metadata was checked before selection; pin the exact compatible version.
- **Risk:** Removing slogans makes the page feel empty. **Mitigation:** replace
  them with verified biography and richer factual era descriptions, not filler.
- **Risk:** A typographic third-album card feels inconsistent. **Mitigation:**
  treat it deliberately as an editorial title card and do not imply an
  unrelated image is the official cover.

## Blocking questions

None. The user delegated research, interaction selection, copy editing,
implementation, SPEC updates, and archival.
