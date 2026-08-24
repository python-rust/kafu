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

### Use literal inference when a library configuration benefits from it

`HomePage.tsx` uses `as const` on the Motion reveal configuration so tuple/literal values remain precise:

```ts
const reveal = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
} as const;
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
