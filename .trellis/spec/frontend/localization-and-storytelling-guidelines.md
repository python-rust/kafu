# Chinese Localization and Editorial Storytelling Guidelines

> Product, copy, navigation, biography, chronology, and interaction contracts
> for the Simplified Chinese KAF homepage.

---

## Scope

Read this file before changing:

- page navigation, section order, or fixed-header orientation;
- Chinese/Japanese naming;
- Hero identity copy, biography, chronology, or editorial summaries;
- era selection, transition motion, or official-reference disclosures;
- page title, metadata, or accessible UI labels.

The homepage is an artist introduction for a mainland-Chinese reader. It must
identify 花谱, provide verified biography, show the major eras, present the
original-album sequence, and lead to official destinations. It is not a tutorial
about how to read the page and it must not manufacture personality through
generic slogans.

---

## Audience and Naming Contract

- Primary product language is Simplified Chinese (`zh-CN`).
- Use `花谱` in Chinese interface copy and prose.
- Introduce the authoritative Japanese spelling `花譜` and Latin name `KAF`
  once in the Hero identity.
- Use `lang="ja"` when an authoritative Japanese name is rendered separately.
- Keep official work, event, and creator names unchanged, including `観測`,
  `不可解`, `魔法`, `怪歌`, `狂想`, `寓話`, and `深愛`.
- Never invent a Chinese title that could be mistaken for an official title.
- Traditional/Japanese UI chrome is not permitted when a natural Simplified
  Chinese equivalent exists.

---

## Stable Product Structure

```text
Hero
认识花谱        factual profile
成长轨迹        guided scroll chronology
代表作品        five original albums
视觉档案
官方入口
Footer / sources
```

| Section | Product job |
| --- | --- |
| Hero | Identify the artist and provide direct destinations. |
| 认识花谱 | State verified biography and profile facts. |
| 成长轨迹 | Guide the reader through six career eras in order. |
| 代表作品 | Present the original-album sequence. |
| 视觉档案 | Inspect the existing verified visual archive. |
| 官方入口 | Continue to official channels. |

Do not make Hero explain this structure. Do not split biography into artificial
questions merely to create more scroll steps.

---

## Hero Contract

Hero contains only:

```text
花谱
花譜 / KAF
日本虚拟歌手，KAMITSUBAKI STUDIO 旗下艺人。
[人物介绍] [代表作品]
```

Rules:

- The role line is a factual identity statement, not a poetic campaign line.
- Actions identify their destinations and use native anchors.
- The initial Hero covers at least the stable small viewport. On supported
  portrait phones/tablets, `#about` must begin at or below the initial visual
  viewport edge; a fixed `rem` height is not a viewport contract.
- Portrait layouts preserve the complete `邂逅` composition with a contained
  responsive foreground. The same shell's inline placeholder provides the
  decorative blurred ambience; do not issue a second image request or force the
  landscape artwork through a full-height `cover` crop.
- Keep exactly one network-backed eager/high-priority Hero image.
- Use stable `svh` for the initial mobile scene. Do not use `dvh` as the primary
  Hero height because browser chrome would resize the composition while the
  reader scrolls.
- Short portrait and landscape viewports may tighten image height, typography,
  and spacing, but must preserve the identity, role, and both actions.
- Do not state how many minutes the page takes, what it will “teach”, how to
  scroll, or how the visitor should feel.
- Do not add rhetorical constructions such as `X 是入口，Y 才会留下人`,
  `从 A 走向 B`, or `先做 A，再做 B` unless they are literal instructions for
  an actual task.
- Current releases or official campaign lines may replace the role line only
  when sourced and deliberately adopted as the product focus.

---

## Factual Profile Contract

`KafProfileSection` owns `#about`.

Required structure:

- one `h2` (`认识花谱`);
- one verified responsive artwork;
- one or more factual biography paragraphs;
- a semantic description list for concise profile attributes.

Current facts include:

- activity began in 2018;
- age 14 at debut;
- KAMITSUBAKI STUDIO affiliation;
- 3D-avatar activity without publicly showing her face;
- original music, albums, and solo live performances;
- Nippon Budokan in 2022 and Yoyogi First Gymnasium in 2024.

Forbidden profile structures:

- four generic questions such as `她是谁`, `为什么特别`, or `从哪里开始`;
- a title + slogan + explanatory paragraph repeated for every card;
- a sticky stage, progress indicator, or IntersectionObserver whose only job is
  to reveal biography;
- editorial claims presented as official self-description.

The profile must remain normal document flow at every viewport and with reduced
motion.

---

## Guided Scroll Journey Contract

`JourneySection` owns `#journey` and uses one Scrollama instance to connect
normal document scrolling to six discrete chronology states.

### Data contract

Every chapter contains:

```ts
id: string;
period: string;
yearLabel: string;
titleZh: string;
summary: readonly string[];
milestones: readonly KafJourneyMilestone[];
primaryVisual: KafMedia;
```

Do not add a separate Japanese subtitle or `changeFrom` / `changeTo` line by
default. Official Japanese names belong inside factual narrative or milestone
copy where they identify real works/events.

### Interaction contract

- Six chronological `<article>` steps remain in source order and normal document
  flow.
- Scrollama owns discrete `onStepEnter` detection through IntersectionObserver.
- Downward native scrolling advances the active year/image; upward native
  scrolling restores the previous state.
- Do not intercept `wheel`, touchmove, keyboard page navigation, or browser
  scrolling. This is guided scrollytelling, not scroll-jacking.
- The chronology requires no click, tap, autoplay, timer, horizontal swipe, or
  hidden control to reveal all six eras.
- Every step keeps a stable `#journey-<id>` anchor and contains its complete
  factual text and source links.
- Scrollama must be destroyed on unmount. Compact/wide breakpoint and orientation
  changes update its offset and call `resize()`.
- A local `ResizeObserver` may watch the occupied fixed-header and stage geometry
  so font zoom or a real layout change recalibrates the compact trigger. Do not
  attach continuous scroll or `visualViewport` listeners.

### Visual-stage contract

- Normal-motion layouts render exactly one active Journey image in one sticky
  stage. `secondaryVisual` is not part of the chapter contract.
- The stage is contextual/decorative (`aria-hidden`); the ordered articles are
  the authoritative reading and accessibility content.
- Desktop uses a side-by-side sticky stage and chronology steps.
- Compact layouts use one full-bleed sticky media dock attached to the occupied
  fixed-header edge and opaque story surfaces in the remaining reading area.
  Do not present it as an inset floating card.
- The measured header-to-stage seam is between -1px and +1px. Do not leave a
  gutter where scrolling article text can appear above the image.
- Compact activation uses a pixel Scrollama offset derived from the rendered
  header height plus rendered stage height. Content padding, not an arbitrary
  percentage or extra trigger gap, provides the reading separation.
- Use stable `svh` geometry for stage/step pacing. Short landscape viewports
  require a reduced stage height that leaves readable space beneath it. Tested
  portrait layouts leave at least 180px below the media dock; short landscape
  leaves at least 120px.
- The sticky stage must release before `代表作品`.
- `activeIndex` represents the current narrative step while the stage may keep
  the previous `displayedVisualIndex` until an uncached next image is ready.
  During that interval, preserve the previous clear image and show a restrained
  pending indicator; never replace it with the next chapter's LQIP.
- Record successful responsive requests by exact source role, `srcset`, `sizes`,
  viewport width, and DPR. Revisited eras in the same selection context must
  switch clear-to-clear without loading or placeholder state.
- After Scrollama confirms that the reader has entered Journey and the displayed
  stage image is clear, preload only the adjacent era in the current scroll
  direction at low priority. Do not start this speculative request merely
  because browser lazy-loading fetched the offscreen first stage near the fold.
  A bounded Motion crossfade may briefly overlap the outgoing and incoming clear
  layers, but persistent previous/current/next image stacks are forbidden.

### Step content

Each article contains:

- year and one Chinese narrative title;
- two concise factual paragraphs where necessary for useful density;
- dated milestones with direct official source links.

Do not add a second image, decorative subtitle, change-pair label, or instruction
telling the reader to scroll.

### Reduced motion

- Do not initialize Scrollama when reduced motion is requested.
- Do not render the changing sticky stage.
- Render one full responsive image inside each of the six articles so all visual
  content remains available in normal document flow.
- Remove opacity/translation transitions without removing facts, milestones,
  links, or anchors.
- Use the same linear fallback when IntersectionObserver or ResizeObserver is
  unavailable; progressive enhancement must not leave a permanently stale stage.

---

## Original-Album Contract

The representative original-album sequence currently includes:

```text
観測α   2019-09-11   first album
魔法α   2020-11-25   second album
狂想β   2023-03-08   third album
寓話     2024-12-25   fourth album
深愛     2026-05-27   fifth album
```

- `深愛` remains the single featured/current work while that is the intended
  homepage emphasis.
- `狂想β` uses the reviewed official 1600×1600 cover from its KAF discography
  page. It remains a local, non-commercial fan-site asset with source-native
  technical derivatives and explicit provenance.
- A future work without a verified local cover uses the deliberate typographic
  fallback. Never present an unrelated visual as an official cover.
- Album order, release date, ordinal, and source URL must be covered by content
  tests.

---

## Navigation and Orientation Contract

Primary navigation remains:

```text
认识花谱   -> #about
成长轨迹   -> #journey
代表作品   -> #works
视觉档案   -> #visuals
官方入口   -> #links
```

- Fixed header uses a stable warm-dark surface and >=4.5:1 text/background
  contrast against pale artwork.
- Current page section uses `aria-current="location"` plus a persistent visual
  state.
- Fixed-header scroll offsets keep destination headings visible.
- Mobile navigation may scroll inside its own container; targets remain at
  least 44px high.
- `SiteHeader` may use one native `IntersectionObserver`; do not add a scrollspy
  or smooth-scroll package.

---

## Motion Contract

Approved motion:

- existing Motion opacity/transform transition for the newly active Journey
  image and stage metadata;
- Gallery state transitions already defined elsewhere;
- persistent CSS transitions for navigation and active-step state.

Forbidden motion:

- biography activation based on scroll;
- per-frame React scroll values, parallax, autoplay, or smooth-scroll
  interception;
- hiding/delaying factual content for cinematic pacing;
- adding another animation runtime while Motion is installed.

Journey scroll activation is the approved exception because chronology order is
the product interaction. It must remain discrete and Scrollama-driven rather
than progress-scrubbed. Reduced motion renders the complete linear chronology
and all six images without the changing stage.

---

## Factuality and Source Boundary

- Identity, dates, venue claims, album order, and milestones require official
  evidence; do not add them from memory.
- Chinese narrative titles are editorial navigation, not official titles.
- Footer keeps the collapsed `资料来源` disclosure for page-level biography and
  chronology references.
- Milestone source links remain beside the specific dated claim.
- Source links must not be replaced by decorative citation labels throughout
  the profile.

---

## Required Validation

Tests must verify:

- factual Hero identity and direct actions;
- initial mobile Hero coverage, no premature `#about` exposure, contained
  portrait foreground, decorative generated-thumbnail ambience, and one
  eager/high-priority image;
- absence of banned explanatory/slogan copy;
- static profile facts and absence of primer sticky/observer markup;
- six semantic Journey steps in source order;
- downward and upward scroll activation for early, middle, and final eras;
- one sticky Journey image, no secondary image, and release before Works;
- compact full-bleed sticky-stage geometry, a <=1px header seam, measured pixel
  trigger behavior, >=180px portrait / >=120px short-landscape reading space,
  and no document-level horizontal overflow;
- reduced-motion linear chronology with six in-flow images;
- the complete five-album sequence including `狂想β` and its official URL;
- the third album uses the verified `kyousou-beta` local media record rather
  than the former typographic fallback;
- fixed-header contrast/current section;
- 320×568, 360×640, 360×800, 390×844, 430×932, 768×1024,
  844×390, 1024×768, 1440×900, and 200% reflow;
- reduced-motion equivalence;
- preserved media, Gallery, and source contracts.

Current references:

```text
tests/HeroSection.test.tsx
tests/KafProfileSection.test.tsx
tests/JourneySection.test.tsx
tests/KafMediaContent.test.ts
tests/e2e/home.spec.ts
```

## Common Mistakes

- Treating “understandable” as permission to annotate the interface with page
  instructions.
- Replacing one deleted slogan with another rhetorical slogan.
- Using several small subtitle lines where one title and substantive paragraph
  would be clearer.
- Reintroducing sticky scroll to the factual Profile; only Journey owns guided
  chronology.
- Reimplementing step observation instead of using the approved Scrollama
  boundary.
- Adding a horizontal timeline that again requires the user to discover a
  separate gesture or control.
- Letting mobile story content appear in a seam above the sticky image, keeping
  an inset floating stage, or using dynamic/legacy viewport geometry so browser
  chrome changes the composition while scrolling.
- Treating `object-position` as a fix for an extreme portrait `cover` crop; it
  only chooses which part of the artwork is removed.
- Removing official Japanese proper nouns in the name of localization.
- Omitting an album because no verified cover image exists.
