# Frontend Development Guidelines

> Project-specific conventions for the KAF frontend.

---

## Overview

This project is a Vite + React + TypeScript frontend. The current architecture emphasizes explicit feature ownership, native CSS/CSS Modules, small React state boundaries, an SDK-agnostic Live2D runtime adapter, and mise-managed development commands.

These files document the codebase as it exists now. Do not treat future possibilities (Cubism implementation details, a state library, server state, etc.) as established conventions until they are actually adopted.

---

## Guidelines Index

| Guide | Description | Status |
|-------|-------------|--------|
| [Directory Structure](./directory-structure.md) | `app` / `pages` / `features` / styles and test ownership | Active |
| [Component Guidelines](./component-guidelines.md) | Function components, props, CSS Modules, accessibility | Active |
| [Hook Guidelines](./hook-guidelines.md) | Built-in hooks, cleanup, extraction threshold | Active |
| [State Management](./state-management.md) | Local React state and imperative runtime separation | Active |
| [Quality Guidelines](./quality-guidelines.md) | mise workflow, lint/type/test/build requirements | Active |
| [Type Safety](./type-safety.md) | Local types, stable adapter contracts, assertion rules | Active |

---

## Pre-Development Checklist

Before changing frontend code:

1. Read the guideline file(s) relevant to the layer being changed.
2. Identify the current owner of the behavior: application shell, route page, feature, runtime adapter, or global style.
3. Check whether a real existing pattern already solves the problem before creating a new abstraction/dependency.
4. For Live2D/Cubism work, keep SDK/runtime objects behind `src/features/live2d/runtime/Live2DAdapter.ts`.
5. Use `mise run ...` tasks for project commands so the pinned Node/pnpm toolchain is used.

---

## Quality Check

For normal frontend changes, run:

```bash
mise run check
```

Also run:

```bash
mise run e2e
```

when browser-level behavior, navigation, or an E2E-covered interaction changes.

Review the more detailed checklist in [quality-guidelines.md](./quality-guidelines.md) before completion.

---

**Language**: Trellis spec documentation is written in English. User-facing project communication may remain Chinese.

