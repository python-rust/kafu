# Type Safety

> Type safety patterns in this project.

---

## Overview

The project uses TypeScript 5.9.3 with project references and `tsc -b` as the authoritative type check. Type definitions stay close to the code that owns them unless they form a stable cross-module contract.

Runtime/vendor boundaries are expressed through explicit interfaces instead of exposing untyped third-party objects to React code.

---

## Type Organization

### Local component types

Keep props and small domain shapes in the component file when they are used only there.

### Stable feature contracts

Move a type/interface to a dedicated module when it defines a stable boundary used to isolate a runtime or vendor.

Contracts at vendor/runtime boundaries should remain implementation-agnostic so page-level code does not depend on third-party types.

---

## Validation

There is currently no external input/schema-validation library because the application has no untrusted structured API payloads or forms requiring schema validation.

Do not introduce Zod/Yup/etc. until runtime validation is required by real external input boundaries.

For DOM/runtime invariants, fail explicitly instead of asserting away nullability. `src/main.tsx` is the reference:

```ts
const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element #root was not found.');
}
```

---

## Common Patterns

### Import React event/types explicitly as types

```ts
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
```

### Clamp or validate bounded values at the boundary where they are produced

Do not allow invalid ranges to propagate and become implicit assumptions in downstream components.

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
- Do not expose renderer/vendor types directly through page-level props or application state.
- Do not use non-null assertions where a runtime invariant can be checked explicitly.
- Do not duplicate a type into several files when one stable feature contract already exists.
- Do not add a runtime validation dependency until there is an actual untrusted input boundary.

