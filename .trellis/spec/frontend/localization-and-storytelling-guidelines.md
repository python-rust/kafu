# Chinese Localization and Storytelling Guidelines

> Product, content, navigation, and narrative-motion contracts for the
> Simplified Chinese KAF homepage.

---

## Scope

Read this file before changing:

- page navigation or section order;
- Chinese/Japanese naming;
- biography, chronology, onboarding, or editorial summaries;
- active-section state, sticky narrative stages, or scroll-triggered motion;
- footer factual-reference disclosures;
- page title, metadata, or accessible UI labels.

The homepage is not only a visual archive. It is an introduction product for a
mainland-Chinese reader who may know nothing about KAF. A successful version
must explain the subject, establish why the career matters, reveal change over
time, and provide a concrete next step.

---

## Audience and Naming Contract

### Primary audience

- The primary product language is Simplified Chinese (`zh-CN`).
- Interface copy assumes a first-time Chinese reader, not an existing Japanese
  fandom participant.
- Navigation, actions, accessibility labels, explanatory copy, dates, and
  generic work types use natural Simplified Chinese.

### Subject naming

- Use `花谱` for Chinese interface identity and Chinese prose.
- Explain once near the Hero identity that the official Japanese spelling is
  `花譜` and the Latin name is `KAF`.
- Use `lang="ja"` for separately rendered Japanese proper names.
- Do not alternate `花谱` and `花譜` as decorative variants.

### Proper nouns

Keep authoritative Japanese names unchanged when they identify an official work,
event, era label, or creator-facing source record. Examples:

```text
観測
不可解
魔法
怪歌
寓話
深愛
花譜ちゃん
過去を喰らう
```

Do not silently invent an “official” Chinese title. A Chinese editorial title
may accompany the original name, but the two roles must remain visibly distinct.

### Wrong vs correct

```tsx
// Wrong: Japanese interface chrome for a Chinese product.
<nav aria-label="花譜サイト内ナビゲーション">
  <a href="#journey">軌跡</a>
</nav>

// Correct: Chinese navigation; Japanese remains content only.
<nav aria-label="花谱观察站页面导航">
  <a href="#journey">成长轨迹</a>
</nav>
```

```tsx
// Correct: Chinese orientation plus authoritative original label.
<h3>进入创作的第二章</h3>
<p lang="ja">寓話 / 第二章</p>
```

---

## Product Story Architecture

The homepage order is a stable product contract:

```text
Hero
认识花谱
成长轨迹
代表作品
视觉档案
官方入口
Footer
```

Each layer answers a different user question:

| Section | User question |
| --- | --- |
| Hero | What is this page promising me? |
| 认识花谱 | Who is she and why should I care? |
| 成长轨迹 | How did the artist change over time? |
| 代表作品 | What should I listen to first? |
| 视觉档案 | What does this evolving visual world look like? |
| 官方入口 | Where can I verify and continue? |

Do not merge `认识花谱` and `成长轨迹`. The first is a short comprehension path;
the second is a detailed chronology.

---

## Fixed Navigation and Orientation Contract

Primary navigation has exactly these destinations unless the product structure
changes deliberately:

```text
认识花谱   -> #about
成长轨迹   -> #journey
代表作品   -> #works
视觉档案   -> #visuals
官方入口   -> #links
```

Required behavior:

- Header stays fixed and uses a stable warm-dark surface; it must not rely on
  the underlying Hero image for contrast.
- Navigation text/background contrast is at least 4.5:1 against the worst-case
  pale artwork beneath the translucent surface.
- The current section is exposed through `aria-current="location"`.
- Active state remains visible without animation through color, background, and
  a persistent indicator.
- Anchor scroll offsets account for the fixed header.
- Mobile navigation may scroll horizontally inside its own container but must
  not widen the document.
- Every navigation target remains at least 44px high.

Use one native `IntersectionObserver` owned by `SiteHeader`. Do not add a routing,
scrollspy, or smooth-scroll package for this static page.

---

## Newcomer Story Contract

`KafPrimerSection` owns the `认识花谱` onboarding path. It contains four concise
beats in this order:

1. `她是谁` — identity, debut context, and virtual presentation;
2. `为什么特别` — voice/world relationship rather than “character only” framing;
3. `她走到了哪里` — movement from network activity to major physical venues;
4. `从哪里开始` — a concrete listening/viewing route using works already on the
   page.

### Content rules

- Every beat has one title, one thesis statement, one short explanatory
  paragraph, and one verified local visual.
- Facts must be supported by official KAF/KAMITSUBAKI references stored in the
  bottom `资料来源` disclosure.
- Editorial interpretation must be phrased as explanation, not as an invented
  official quote or official self-description.
- Keep the entire onboarding readable in roughly one minute; do not turn it into
  a second exhaustive biography.

### Desktop presentation

- One sticky visual stage and four in-flow semantic `<article>` steps.
- A native observer updates only when the active step changes.
- The stage updates image, title, thesis, and four-segment progress state.
- The stage is decorative (`aria-hidden`); equivalent content remains in the
  articles.

### Mobile and reduced motion

- No sticky dependency.
- Every beat includes its own image in source order.
- No content is hidden because the viewport is narrow or motion is reduced.

---

## Journey Transformation Contract

Each Journey chapter must expose four different concepts:

```ts
titleZh: string;       // Chinese narrative orientation
originalTitle: string; // authoritative Japanese era/work label
changeFrom: string;    // previous state or constraint
changeTo: string;      // resulting state or expansion
```

Examples:

```text
屏幕里的歌声 -> 个人现场与首张专辑
无法按计划相聚 -> 线上现场与重返会场
网络与小型会场 -> 武道馆与更大的表达
```

Requirements:

- The Chinese title explains the chapter to a newcomer; it does not merely
  translate one Japanese noun.
- The original Japanese label remains visible and uses `lang="ja"`.
- The transformation pair appears in the sticky stage and in normal article
  flow.
- Year, Chinese title, original name, transformation, image, summary, and
  verified milestone links describe one coherent stage.
- A chapter without a meaningful transformation pair is not ready to ship.

---

## Narrative Motion Contract

Motion communicates content-state change. It must not be added merely to make a
section feel expensive.

Approved mechanisms:

- native `IntersectionObserver` for low-frequency active step/chapter/location;
- installed Motion `AnimatePresence` and keyed `motion.*` elements for state
  transitions;
- CSS transitions for persistent navigation and active-border states;
- transform and opacity as the default animated properties.

Approved effects:

- active image crossfade/very small scale settlement;
- title/thesis enter/exit on a real narrative change;
- transformation line `scaleX` when a new chapter becomes active;
- restrained section-surface transition tied to the active chapter theme.

Forbidden effects:

- per-frame React state driven by scroll position;
- decorative parallax unrelated to meaning;
- simultaneous previous/current/next visual layers without a tested need;
- autoplaying motion that hides or delays content;
- another scrollytelling, animation, or smooth-scroll runtime while the existing
  primitives satisfy the requirement.

`prefers-reduced-motion` / `MotionConfig reducedMotion="user"` must yield the
complete content with zero-duration state changes and no required sticky stage.

---

## Factuality and Source Boundary

Official facts and editorial guidance are different data roles:

- milestones and biographical claims require an official reference URL;
- Chinese narrative titles and transformation pairs are editorial orientation;
- official Japanese names remain source-faithful;
- no statistic, date, ranking, venue claim, or identity claim is added from
  memory alone.

The Footer owns a native collapsed `资料来源` disclosure for page-level profile
and chronology references. Keep detailed milestone links beside the milestones
because they support a specific historical claim.

Do not repeat source links beside every onboarding sentence. Do not remove the
bottom reference disclosure to make the footer shorter.

---

## Required Validation

Browser coverage must verify:

- Simplified Chinese page title, headings, navigation, actions, and accessible
  labels;
- absence of legacy Japanese UI labels such as `軌跡`, `視覚`, `公式サイト`,
  `新しいタブで開く`, and `画像を選ぶ`;
- preservation of official Japanese content names;
- fixed header position and >=4.5:1 worst-case contrast;
- `aria-current="location"` for all five primary sections;
- anchor headings are not obscured by the fixed header;
- four onboarding articles and early/middle/final stage changes;
- six Journey transformations and early/middle/final stage changes;
- complete mobile and reduced-motion content;
- 320px and 200% text reflow;
- no added runtime dependency.

Current browser reference:

```text
tests/e2e/home.spec.ts
```

## Common Mistakes

- Translating only navigation while leaving Japanese accessible labels and
  generic work types.
- Replacing Japanese UI with literal or awkward Chinese rather than writing for
  Chinese user intent.
- Removing all Japanese text, including official proper names that should remain
  authoritative.
- Treating a chronology as sufficient onboarding for someone who does not know
  the subject.
- Adding animation without defining what new state or transformation it
  communicates.
- Making the active navigation state motion-only or color-only with weak
  contrast.
