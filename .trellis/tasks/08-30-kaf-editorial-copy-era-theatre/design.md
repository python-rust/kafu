# Design

## Product structure

The page retains its current top-level order:

```text
Hero
认识花谱 — static profile
成长轨迹 — interactive era theatre
代表作品 — complete five-album sequence
视觉档案
官方入口
Footer / sources
```

The key correction is that only Journey is interactive. The profile is a normal
editorial section, so the visitor does not encounter two consecutive sticky
scroll experiences.

## Copy architecture

### Hero

```text
花谱
花譜 / KAF
日本虚拟歌手，KAMITSUBAKI STUDIO 旗下艺人。

[人物介绍] [代表作品]
```

No page promise, duration estimate, instruction, or emotional slogan.

### Profile

Desktop:

```text
认识花谱

┌─────────────────────────┬────────────────────────────┐
│ verified portrait       │ two factual biography       │
│                         │ paragraphs                  │
│                         │                              │
│                         │ 2018 / 14岁 / 所属 / 活动    │
└─────────────────────────┴────────────────────────────┘
```

Mobile: image, biography, then facts in normal document flow.

### Era theatre

```text
成长轨迹

[2018] [2019] [2020–21] [2022–23] [2024] [2025–26]

┌───────────────────────────────────────────────────────┐
│ primary visual                        secondary visual │
│                                                       │
├──────────────────────────────┬────────────────────────┤
│ Chinese era title            │ dated milestones       │
│ expanded factual narrative   │ source links           │
│                              │                        │
│ [上一阶段]        [下一阶段] │                        │
└──────────────────────────────┴────────────────────────┘
```

The year rail is always visible. The panel changes only through a deliberate
tab/previous/next action, not the page scroll position.

## Interaction implementation

### Radix Tabs boundary

Use `@radix-ui/react-tabs@1.1.21` directly inside `JourneySection.tsx`:

```tsx
<Tabs.Root value={activeId} onValueChange={setActiveId}>
  <Tabs.List aria-label="花谱成长阶段">
    <Tabs.Trigger value={chapter.id}>{chapter.yearLabel}</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value={chapter.id}>...</Tabs.Content>
</Tabs.Root>
```

Reasons:

- WAI-ARIA tab/panel semantics;
- Arrow keys, Home, End, Tab behavior;
- controlled state for previous/next buttons;
- React 19 peer support verified from the package registry;
- small, focused primitive rather than a visual framework.

Do not wrap it in a generic app-level Tabs abstraction; this page currently has
one domain-specific era selector.

### Motion boundary

Within the active `Tabs.Content`, key the visual/text group by chapter ID and
use the existing Motion runtime for a restrained entry:

```text
image: opacity 0 → 1, x 20 → 0
copy:  opacity 0 → 1, y 12 → 0
duration: roughly 320–460ms
```

No autoplay. No exit animation is required if Radix unmounting would hide it.
When reduced motion is requested, use zero-duration transitions and preserve all
controls/content.

### Trigger rail

- Desktop: six equal tracks.
- Narrow widths: `grid-auto-flow: column`, horizontal overflow contained in the
  tab list, `scroll-snap-type: inline proximity`.
- Focused triggers naturally scroll into view.
- Active trigger uses data-state from Radix, not duplicated React flags.

## Data model changes

### Profile

Replace `KafPrimerBeat[]` with a single `KafProfile` record:

```ts
interface KafProfileFact {
  label: string;
  value: string;
}

interface KafProfile {
  paragraphs: readonly string[];
  facts: readonly KafProfileFact[];
  visual: KafMedia;
}
```

### Journey

Remove:

```ts
originalTitle
changeFrom
changeTo
```

Keep:

```ts
id
period
yearLabel
titleZh
summary
theme
milestones
primaryVisual
secondaryVisual
```

Expand `summary` into two factual paragraphs where the current single sentence
would leave the panel too sparse. This can be represented as
`readonly string[]` to avoid embedding line-break semantics in content strings.

### Works

Add:

```ts
{
  id: 'album-kyousou-beta-2023',
  title: '狂想β',
  releaseDate: '2023.03.08',
  kind: '第 3 张专辑',
  sourceUrl: 'https://kaf.kamitsubaki.jp/discography/20230308/199/',
  visual: undefined
}
```

The absence of a visual is intentional because the repository does not contain
a verified album-cover asset. `WorksSection` already supports a typographic
fallback; style it as an intentional title card.

## Accessibility

- Radix owns tab roles, aria-controls, aria-selected, and keyboard movement.
- The tab list has the accessible name `花谱成长阶段`.
- Previous/next controls are native buttons and announce the destination era.
- Inactive tab panels are not presented as active content.
- Profile facts use a semantic description list.
- Official source links retain explicit new-window accessible names.
- Reduced motion affects transitions only.

## Responsive behavior

- 320–767px: profile stacks, tab list scrolls horizontally, panel visuals stack,
  milestone list remains linear.
- 768–1023px: profile uses balanced columns where space permits; era panel may
  use a two-column visual/copy composition.
- 1024px+: year rail spans six columns; main/secondary visuals form an
  asymmetric collage; text and milestones use two columns.
- No viewport-height chapter tracks or sticky positioning remain in Profile or
  Journey.

## Alternatives reviewed

### Keep both sticky scroll stories

Rejected. It preserves the exact repetition the user reported and keeps page
length coupled to activation mechanics.

### Horizontal swipe-only carousel

Rejected as the primary control. It is less discoverable for keyboard users and
would require additional carousel semantics. A horizontally scrollable tab rail
is used only as a narrow-screen containment strategy.

### Scrollama

Rejected. Mature, but it solves scroll-driven step activation; the selected
design intentionally removes scroll as the chapter control.

### WebGL / 3D / canvas

Rejected. No content requirement justifies the cost, accessibility burden, or
new rendering runtime.

### Hand-built roving-tabindex selector

Rejected. Radix already implements the WAI-ARIA tabs behavior and avoids
rebuilding focus/keyboard mechanics.

## Rollback boundaries

- Hero copy/API changes are isolated to Hero and HomePage.
- Static profile replaces one section/data record without affecting other
  sections.
- Radix is used only by Journey and can be removed with that section.
- The third-album addition is one content record plus supporting-grid CSS.
