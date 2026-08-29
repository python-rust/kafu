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

- `MediaCredit` owns the actual credit/source-link contract used by Hero,
  Journey, Works, and Gallery.
- `SectionHeading` owns the semantic `h2` and shared rule/scale. It deliberately
  has no eyebrow, preheader, or generic description prop.

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
<a className={styles.brand} href="/" aria-label="KAF Observatory 首页">
```

---

## Common Mistakes

- Do not make a non-semantic element clickable when a native button/link fits.
- Do not create a global component abstraction for code that currently has only one owner.
- Do not duplicate project-wide constants inside component CSS if an existing token already represents the value.
- Do not recreate a separate visual language for each homepage section; use the shared KAF semantic roles and let composition/media provide variation.
- Do not add generic `eyebrow`, `overline`, `intro`, or `description` slots to a shared heading component; visible copy must pass the content job test.
- Do not hand-build dialog focus trapping, Escape handling, swipe navigation, or body-scroll locking when the approved lightbox dependency already owns them.
- Do not move static styling into JSX just because inline styles are convenient.
