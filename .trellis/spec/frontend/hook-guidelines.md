# Hook Guidelines

> How hooks are used in this project.

---

## Overview

The project currently uses no custom hooks. Stateful behavior should remain inside the owning component until there is a demonstrated reuse or complexity reason to extract it.

This is intentional current-state documentation: do not create a custom hook merely to shorten a component.

---

## Custom Hook Patterns

There is no established custom-hook API in the codebase yet.

Current behavior should stay local when it has a single owner.

If a future hook is introduced, extract it only when at least one of these is true:

- the stateful behavior is reused by more than one component,
- the lifecycle is independently testable and materially obscures the owning component,
- a browser integration needs a stable React-facing boundary.

Until then, keep behavior colocated.

---

## Effects and Cleanup

Effects must clean up resources they create.

Pattern:

```tsx
useEffect(() => {
  const timeout = window.setTimeout(onTimeout, delay);
  return () => window.clearTimeout(timeout);
}, [delay, onTimeout]);
```

The same rule applies to event listeners, animation frames, observers, and other externally managed resources.

Current page-level example: `HomePage.tsx` starts the ordered artwork warmup
controller in one effect and returns `controller.cancel`. Scheduling mechanics
stay in `artworkWarmupQueue.ts`; do not wrap this single-owner lifecycle in a
custom hook merely to hide the effect.

---

## Data Fetching

The current application has no server state and no data-fetching abstraction. There is no React Query, SWR, Axios, or project-level fetch hook.

Do not introduce a server-state library until the application actually gains remote asynchronous state with caching/synchronization needs.

Static project content should remain local/typed until requirements change.

---

## Naming Conventions

- React built-in hooks use their standard names (`useState`, `useEffect`, `useCallback`, `useRef`).
- Future custom hooks must use the `useXxx` convention required by React.
- Name hooks after the behavior they own, not the component that first happened to use them.

---

## Common Mistakes

- Do not extract a one-use event handler into a custom hook without a lifecycle or reuse benefit.
- Do not omit cleanup for timers, observers, event listeners, animation frames, or other external resources.
- Do not put high-frequency animation values through React state when CSS can own them more efficiently.
- Do not add a data-fetching library while the project has no server-state problem to solve.
