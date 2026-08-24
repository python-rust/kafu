# State Management

> How state is managed in this project.

---

## Overview

The project currently uses React's built-in state primitives only. No global state library or server-state library is installed.

State is owned by the smallest component that needs to coordinate it. Imperative renderer/runtime objects should stay outside React state behind feature-owned boundaries.

---

## State Categories

### Local UI state

Use `useState` for component-local interaction state.

### URL / route state

Routes are owned by React Router in `src/app/App.tsx`. Route selection should remain URL state rather than being duplicated in a store.

### Imperative runtime state

Imperative renderer objects, animation managers, graphics contexts, and textures must not live in React state. They belong behind a feature-owned runtime boundary and should be addressed through explicit methods such as:

```ts
mount(target: HTMLCanvasElement): Promise<void>;
setActive(active: boolean): void;
dispose(): void;
```

### Server state

There is currently no server state.

---

## When to Use Global State

There is currently no global state store.

Do not introduce Zustand, Redux, Jotai, or another store simply because data crosses one component boundary. First use normal composition, props, and React context/reducer if a true application-level concern appears.

A dedicated global store should only be reconsidered when state is simultaneously:

- shared by multiple distant routes/features,
- not naturally represented by the URL,
- difficult to manage through normal ownership/composition,
- and stable enough to justify a new application-wide dependency.

This is an escalation rule; it is not current project architecture.

---

## Server State

No remote API cache/synchronization layer exists today. Do not add TanStack Query, SWR, or equivalent until remote data becomes an actual product requirement.

If a simple one-off HTTP request is introduced before a server-state layer is justified, prefer the browser `fetch` API and keep ownership local to the feature.

---

## Derived State

Prefer deriving display values directly from source state rather than storing duplicates.

---

## Common Mistakes

- Do not mirror route state in a global store.
- Do not place imperative renderer/runtime objects in React state.
- Do not introduce a store for state that has one clear owner.
- Do not store a derived display value when it can be computed from existing state.
- Do not add server-state dependencies before server state exists.

