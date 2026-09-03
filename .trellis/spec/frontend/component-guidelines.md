# Component Guidelines

> How components are built in this project.

---

## Overview

Components are function components written in TypeScript. The current codebase favors small components with explicit ownership boundaries: application routing in `app`, route presentation in `pages`, and global visual foundations in `styles`.

Components use semantic HTML and accessibility attributes directly instead of wrapping every primitive in a design-system abstraction. Page-local shared components are valid when several independently owned sections need the same semantic contract.

---

## Component Structure

The existing component structure is:

1. External imports.
2. Internal imports.
3. Local type/interface declarations when needed.
4. Local constants.
5. Exported function component.
6. Event handlers/effects kept close to the state they operate on.

Do not introduce class components or default exports unless an external integration specifically requires them.

---

## Props Conventions

- Define component props as a named local `interface` when the component has props.
- Keep props narrow and behavior-oriented.
- Optional callbacks use optional function props rather than no-op defaults.
- Keep a value in its narrowest owner instead of threading it through unrelated components.

---

## Styling Patterns

Component and page styles use CSS Modules:

```tsx
import styles from './HeroSection.module.css';

<section className={styles.hero}>
```

Global design tokens are CSS custom properties from `src/styles/tokens.css`. Components should consume those tokens instead of redefining common palette/spacing/motion constants when an existing token fits.

Homepage visual, type, responsive, and motion changes must also follow
[Visual System Guidelines](./visual-system-guidelines.md). In particular, a
section may alias semantic tokens locally, but it must not invent an independent
brand palette or microtype scale.

Chinese audience, naming, navigation, and narrative components must also follow
[Chinese Localization & Storytelling](./localization-and-storytelling-guidelines.md).

Inline `style` is reserved for genuinely dynamic values that must cross from React state into CSS.

Do not move static visual declarations into JSX inline styles.

---

## Page-Local Reuse

The homepage may place shared presentation under
`src/pages/HomePage/components/` when all of the following are true:

- at least two independently owned homepage sections consume the same contract;
- the shared behavior or semantics must change together;
- the API does not introduce generic slots for content the product does not
  need;
- keeping copies in each section would create accessibility, attribution, or
  hierarchy drift.

Current examples:

- `ResponsiveArtwork` owns width candidates, intrinsic dimensions, native-load
  reveal, placeholder/error feedback, fetch priority, alt text, and
  thumbnail/high-density role selection for Hero, Journey, Works, and Gallery.
- `artworkLoadCache.ts` owns the page-session exact-request cache and detached
  responsive/thumbnail preloader used by remounts, Journey transitions, and the
  page warmup queue. It is not a generic application cache or an HTTP-cache
  replacement.
- `artworkSizes.ts` owns the exact responsive `sizes` expressions consumed by
  both rendered sections and background warmup jobs. Do not duplicate those
  strings in a scheduler.
- `artworkWarmupQueue.ts` owns the reusable browser scheduling mechanics for
  ordered, low-priority, bounded-concurrency image warmup. The page-specific
  group order stays in `HomePage/homeArtworkWarmup.ts` rather than becoming a
  generic queue configuration API.
- `SectionHeading` owns the semantic `h2` and shared rule/scale. It deliberately
  has no eyebrow, preheader, or generic description prop.
- `MediaSources` owns the single page-bottom creator/source/license index.

`KafProfileSection` remains a section-owned product component. It owns one
factual profile composition and semantic fact list; it has no observer,
stepper, carousel, or sticky-stage responsibility.

Do not extract a one-use layout wrapper or a purely cosmetic one-line element.
Shared components are not a license to create a route-independent design-system
package.

### Open-source integration boundary

Keep third-party UI behind the narrowest local adapter that owns its styles and
loading behavior. For the gallery:

```text
GallerySection.tsx           -> active/open state + KAF-specific composition
GalleryLightbox.tsx          -> package import + package stylesheet
yet-another-react-lightbox   -> portal/focus/keyboard/swipe mechanics
```

The adapter is lazy-loaded. Do not leak the package API through unrelated
sections or create a generic app-wide modal abstraction for one gallery.

For the guided Journey:

```text
JourneySection.tsx           -> active/displayed era state, Scrollama lifecycle, step markup
artworkLoadCache.ts           -> exact-request state + adjacent responsive preload
scrollama                     -> IntersectionObserver step activation + resize
Motion                        -> bounded clear-image/metadata transition only
```

Keep direct Scrollama usage inside `JourneySection`. The section passes actual
step elements, owns compact/wide offset selection, validates callback indices,
updates low-frequency React state, and calls `destroy()` on cleanup. Do not wrap
Scrollama in a generic app-wide hook while there is only one domain-specific
consumer. Do not add a React wrapper merely to avoid one explicit lifecycle.
If IntersectionObserver or ResizeObserver is unavailable, Journey uses its
complete in-flow image/text fallback instead of initializing a partial runtime.

For page image warmup:

```text
HomePage.tsx                  -> start/cancel lifecycle after mount
homeArtworkWarmup.ts          -> Profile/Journey/Works/Gallery group order
artworkSizes.ts               -> shared rendered/warmup selection contexts
artworkWarmupQueue.ts         -> load/idle/visibility/concurrency scheduling
artworkLoadCache.ts           -> exact request + browser Image preload
```

Keep this lifecycle as one page-owned effect. Do not extract a custom hook while
there is one page owner, and do not let individual sections create competing
page-wide queues. A section may still use its own narrow demand preloader, as
Journey does for the active/adjacent chapter; both paths must converge through
`artworkLoadCache.ts`.

---

## Accessibility

Accessibility is part of the component contract, not a separate pass.

Current patterns include:

- Use semantic interactive elements instead of clickable generic containers.
- Give interactive controls an explicit accessible name.
- Mark purely decorative geometry with `aria-hidden="true"` when it exists.
- Preserve native keyboard interaction whenever possible by using semantic elements.

Current example:

```tsx
<a className={styles.brand} href="#top" aria-label="花谱观察站，返回页面顶部">
```

For primary page navigation, use `aria-current="location"` on the observed
active section. Journey articles use semantic source order and `aria-labelledby`;
the changing sticky stage is decorative and must not duplicate the chronology in
the accessibility tree.

---

## Common Mistakes

- Do not make a non-semantic element clickable when a native button/link fits.
- Do not create a global component abstraction for code that currently has only one owner.
- Do not duplicate project-wide constants inside component CSS if an existing token already represents the value.
- Do not recreate a separate visual language for each homepage section; use the shared KAF semantic roles and let composition/media provide variation.
- Do not add generic `eyebrow`, `overline`, `intro`, or `description` slots to a shared heading component; visible copy must pass the content job test.
- Do not write raw `<img>` markup in a homepage section; extend the shared
  responsive-artwork contract when a real media role is missing.
- Do not hand-build dialog focus trapping, Escape handling, swipe navigation, or body-scroll locking when the approved lightbox dependency already owns them.
- Do not hand-build Journey step observation, scroll-direction tracking, or
  resize observation when Scrollama owns those mechanics.
- Do not attach `scroll`, `wheel`, or touchmove listeners to drive Journey state.
- Do not gate a visible DOM image on `decode()` or replace the browser's native
  responsive/lazy-loading pipeline with a fetch/blob wrapper for fake progress.
- Do not add an image package merely for placeholder CSS when it cannot preserve
  the project's exact `srcset`/`sizes` request and cached-remount contracts.
- Do not make each section independently “preload everything”; one page-owned
  warmup plan must preserve reading order and use the shared scheduler/cache.
- Do not move static styling into JSX just because inline styles are convenient.
