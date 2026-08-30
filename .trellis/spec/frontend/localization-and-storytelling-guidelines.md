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
成长轨迹        interactive era theatre
代表作品        five original albums
视觉档案
官方入口
Footer / sources
```

| Section | Product job |
| --- | --- |
| Hero | Identify the artist and provide direct destinations. |
| 认识花谱 | State verified biography and profile facts. |
| 成长轨迹 | Let the user inspect six career eras. |
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

## Interactive Era Theatre Contract

`JourneySection` owns `#journey` and uses one controlled Radix Tabs instance.

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
secondaryVisual?: KafMedia;
```

Do not add a separate Japanese subtitle or `changeFrom` / `changeTo` line by
default. Official Japanese names belong inside factual narrative or milestone
copy where they identify real works/events.

### Interaction contract

- Six chronological year triggers remain visible as the navigation model.
- Radix owns `tablist`, `tab`, `tabpanel`, `aria-selected`, `aria-controls`,
  roving focus, ArrowLeft/ArrowRight, Home, End, Enter, and Space behavior.
- The section may control the active value to support previous/next buttons.
- Do not override Radix trigger/panel IDs in a way that breaks `aria-controls`.
- On narrow layouts the tab rail may scroll horizontally inside itself; it must
  not widen the document.
- No autoplay or timed advancement.

### Panel content

One active panel contains:

- year and one Chinese narrative title;
- two concise factual paragraphs where necessary for useful density;
- existing verified primary/secondary artwork in an editorial composition;
- dated milestones with direct official source links;
- previous/next stage controls.

The active panel is progressive disclosure, not hidden essential form content:
all six labels remain visible and all panels are reachable by pointer, touch,
keyboard, and previous/next controls.

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
- A work without a verified local cover uses the deliberate typographic
  fallback. Never present an unrelated visual as its official cover.
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

- existing Motion opacity/transform entrance for the newly active era panel;
- Gallery state transitions already defined elsewhere;
- persistent CSS transitions for navigation/tab active states.

Forbidden motion:

- biography activation based on scroll;
- Journey activation based on page scroll;
- per-frame React scroll values, parallax, autoplay, or smooth-scroll
  interception;
- hiding/delaying factual content for cinematic pacing;
- adding another animation runtime while Motion is installed.

Reduced motion keeps the same profile, tabs, panels, controls, and content with
zero-duration transitions.

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
- absence of banned explanatory/slogan copy;
- static profile facts and absence of primer sticky/observer markup;
- six Radix tabs, tab/tabpanel associations, Arrow/Home/End behavior, and
  previous/next controls;
- one visible active era panel and no Journey sticky stage;
- the complete five-album sequence including `狂想β` and its official URL;
- no image assigned to the third album without a verified asset;
- fixed-header contrast/current section;
- mobile tab-rail containment, 320px and 200% reflow;
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
- Reusing the same sticky-scroll pattern in adjacent sections.
- Building tabs/focus behavior manually despite the approved Radix primitive.
- Removing official Japanese proper nouns in the name of localization.
- Omitting an album because no verified cover image exists.
