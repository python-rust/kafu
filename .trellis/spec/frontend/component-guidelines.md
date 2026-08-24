# Component Guidelines

> How components are built in this project.

---

## Overview

Components are function components written in TypeScript. The current codebase favors small components with explicit ownership boundaries: application routing in `app`, route presentation in `pages`, and global visual foundations in `styles`.

Components use semantic HTML and accessibility attributes directly instead of wrapping every primitive in a design-system abstraction.

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
import styles from './HomePage.module.css';

<main className={styles.page}>
```

Global design tokens are CSS custom properties from `src/styles/tokens.css`. Components should consume those tokens instead of redefining common palette/spacing/motion constants when an existing token fits.

Inline `style` is reserved for genuinely dynamic values that must cross from React state into CSS.

Do not move static visual declarations into JSX inline styles.

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
- Do not move static styling into JSX just because inline styles are convenient.
