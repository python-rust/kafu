# Design

## Product structure

Final homepage order:

```text
Header (fixed orientation)
Hero / first promise
认识花谱 / four-beat newcomer story
成长轨迹 / six-stage chronology
代表作品 / selected listening path
视觉档案 / image theatre
官方入口 / current destinations
Footer / disclaimer, media sources, factual references
```

This separates two user needs that the previous page mixed together:

- `认识花谱` answers “why should I care?” in under a minute;
- `成长轨迹` answers “how did the artist change over time?” in depth.

## Data contracts

### Chinese identity and references

Add production content records in `src/content/kaf.ts`:

```ts
interface KafReferenceSource {
  id: string;
  label: string;
  note: string;
  href: string;
}

interface KafPrimerBeat {
  id: string;
  title: string;
  summary: string;
  statement: string;
  visual: KafMedia;
}
```

Reference sources are visible only in the Footer native disclosure. Primer
facts must be traceable to official KAF/KAMITSUBAKI pages or the official KAF
Bilibili account.

### Journey chapter extension

Keep existing IDs and source records. Extend each chapter with:

```ts
titleZh: string;
originalTitle: string;
changeFrom: string;
changeTo: string;
```

`originalTitle` is authoritative Japanese content; `titleZh` and the
transformation pair are Chinese editorial orientation.

## Header architecture

`SiteHeader` observes the section IDs derived from nav hrefs:

```text
#about -> #journey -> #works -> #visuals -> #links
```

Use one native IntersectionObserver with a narrow center band. The nearest
intersecting section becomes active. Fallback is `#about` until Hero is passed.

Output:

```tsx
<a aria-current={active ? 'location' : undefined}>...</a>
```

CSS uses a persistent warm-dark surface. Active state combines stronger text,
an accent line, and a small filled marker; it does not depend on animation.

## Chinese onboarding section

Create:

```text
src/pages/HomePage/sections/KafPrimerSection.tsx
src/pages/HomePage/sections/KafPrimerSection.module.css
```

### Desktop

- two-column track;
- sticky visual stage on the left;
- four in-flow narrative articles on the right;
- one native IntersectionObserver watches the four semantic steps and updates
  the parent when a step enters the center band;
- stage uses AnimatePresence to crossfade one responsive image and one text
  block;
- a four-segment progress indicator reflects active state.

### Mobile/reduced motion

- no sticky stage;
- each article includes its own responsive image;
- source order is the reading and keyboard order;
- no content depends on animation.

The section reuses `ResponsiveArtwork` and `SectionHeading`; no new generic
abstraction is introduced.

## Journey narrative treatment

The existing Journey observer remains authoritative. Stage additions:

```text
year
Chinese narrative title
official Japanese era/work label
changeFrom ─────> changeTo
```

The arrow line scales on active chapter changes. Because the pair conveys the
chapter thesis, the same markup is rendered in each in-flow article.

The section background may transition between restrained theme surfaces using
CSS custom properties, but only the stage image/text uses Motion. No per-frame
scroll progress is introduced.

## Typography localization

Global roles:

```css
--font-display-zh: 'Songti SC', 'STSong', ...;
--font-display-ja: 'Hiragino Mincho ProN', 'Yu Mincho', ...;
--font-sans: 'PingFang SC', 'Microsoft YaHei', ...;
```

Chinese interface headings use `--font-display-zh`. Official Japanese proper
names use `lang="ja"` and `--font-display-ja` through a local class.

## Motion budget

- Header active state: CSS transition only.
- Primer active image/text: opacity + y/scale, 280–460ms.
- Primer step reveal: one-time opacity + y, 360ms.
- Journey active image/text/transformation: existing keyed transition plus one
  scaleX line.
- Reduced motion: zero-duration state changes, no sticky onboarding stage.

This reuses Motion's presence APIs plus native IntersectionObserver. Scrollama
was reviewed but rejected because the current four-step story does not need
another runtime on top of the existing observer pattern.

## Accessibility

- Fixed header does not trap focus and retains semantic anchors.
- Active nav uses `aria-current="location"`.
- Primer articles are real `<article>` elements with H3 headings.
- Sticky stage is `aria-hidden`; all narrative content exists in document flow.
- Japanese original names carry `lang="ja"`.
- All animation respects `MotionConfig reducedMotion="user"` and CSS
  `prefers-reduced-motion`.
- Anchor scroll offsets account for fixed header height.

## Testing design

Vitest:

- Chinese nav and section order;
- four onboarding beats;
- Journey Chinese titles/original labels/transformation pairs;
- Chinese actions and accessibility names;
- footer reference disclosure.

Playwright:

- header computed background and contrast;
- active nav on about/journey/works/gallery/links;
- Primer early/middle/final active stage;
- Journey transformation pair changes;
- no legacy Japanese UI phrases;
- existing viewport/reflow/reduced-motion/image/lightbox gates.
