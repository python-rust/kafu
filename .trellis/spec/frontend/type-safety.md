# Type Safety

> Type safety patterns in this project.

---

## Overview

The project uses TypeScript 5.9.3 with project references and `tsc -b` as the authoritative type check. Type definitions stay close to the code that owns them unless they form a stable cross-module contract.

---

## Type Organization

### Local component types

Keep props and small domain shapes in the component file when they are used only there.

### Stable contracts

Move a type/interface to a dedicated module only when it defines a stable boundary used across modules. Do not extract types solely to make a component file shorter.

---

## Validation

There is currently no external input/schema-validation library because the application has no untrusted structured API payloads or forms requiring schema validation.

Do not introduce Zod/Yup/etc. until runtime validation is required by real external input boundaries.

For DOM invariants, fail explicitly instead of asserting away nullability. `src/main.tsx` is the reference:

```ts
const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element #root was not found.');
}
```

---

## Common Patterns

### Use literal inference when a narrow component contract benefits from it

`HomePage.tsx` keeps final anchor navigation literal and checks it against the section component's narrow contract without widening or asserting the values:

```ts
const homeNavItems = [
  { label: 'Journey', href: '#journey' },
  { label: 'Works', href: '#works' },
] as const satisfies readonly SiteHeaderNavItem[];
```

---

## Type Assertions

Avoid assertions by default. A narrow assertion is acceptable when bridging a platform typing limitation and the value is locally controlled.

Do not use broad assertions to suppress uncertainty from external data or vendor APIs.

---

## Forbidden Patterns

- Do not use `any` to bypass type errors.
- Do not use non-null assertions where a runtime invariant can be checked explicitly.
- Do not duplicate a type into several files when one stable contract already exists.
- Do not add a runtime validation dependency until there is an actual untrusted input boundary.
