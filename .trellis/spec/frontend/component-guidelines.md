# Component Guidelines

> How components are built in this project.

---

## Overview

Components are function components written in TypeScript. The current codebase favors small components with explicit ownership boundaries:

- route composition in page components,
- feature behavior in feature components,
- imperative third-party runtime details outside React components.

Components use semantic HTML and accessibility attributes directly instead of wrapping every primitive in a design-system abstraction.

---

## Component Structure

The existing component structure is:

1. External imports.
2. Internal imports.
3. Local type/interface declarations.
4. Local constants.
5. Exported function component.
6. Event handlers/effects kept close to the state they operate on.

Do not introduce class components or default exports unless an external integration specifically requires them.

---

## Props Conventions

- Define component props as a named local `interface` when the component has props.
- Keep props narrow and behavior-oriented.
- Optional callbacks use optional function props rather than no-op defaults.
- Avoid passing third-party runtime objects through page/component props when an adapter boundary can contain them.

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
- Mark purely decorative geometry with `aria-hidden="true"`.
- Use `aria-live="polite"` for non-critical interaction feedback that changes after user input.
- SVG artwork with meaningful content uses `role="img"` plus `<title>` and `<desc>`.
- Preserve native keyboard interaction whenever possible by using semantic elements.

Examples:

```tsx
<a className={styles.brand} href="/" aria-label="KAF Observatory 首页">
```

```tsx
<span className={styles.statusDot} aria-hidden="true" />
```

---

## Common Mistakes

- Do not make a non-semantic element clickable when a native button/link fits.
- Do not leak renderer/runtime implementation objects into route/page component props.
- Do not create a global component abstraction for code that currently has only one owner.
- Do not duplicate project-wide constants inside component CSS if an existing token already represents the value.
- Do not use React state for per-frame rendering/runtime objects; keep imperative runtime state behind the adapter boundary.

