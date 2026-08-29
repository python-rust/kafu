# Frontend Development Guidelines

> Project-specific conventions for the KAF frontend.

---

## Overview

This project is a Vite + React + TypeScript frontend. The current architecture emphasizes explicit page ownership, native CSS/CSS Modules, typed static content, rights-tracked local media, small React state boundaries, and mise-managed development commands.

These files document the codebase as it exists now. Do not treat future possibilities (a state library, server state, feature modules, etc.) as established conventions until they are actually adopted.

---

## Guidelines Index

| Guide | Description | Status |
|-------|-------------|--------|
| [Directory Structure](./directory-structure.md) | `app` / `pages` / styles and test ownership | Active |
| [Component Guidelines](./component-guidelines.md) | Function components, props, CSS Modules, accessibility | Active |
| [Hook Guidelines](./hook-guidelines.md) | Built-in hooks, cleanup, extraction threshold | Active |
| [State Management](./state-management.md) | Local React state ownership and escalation rules | Active |
| [Visual System Guidelines](./visual-system-guidelines.md) | KAF palette, type hierarchy, layout rhythm, and motion budget | Active |
| [Quality Guidelines](./quality-guidelines.md) | mise workflow, lint/type/test/build requirements | Active |
| [Type Safety](./type-safety.md) | Local types, stable contracts, assertion rules | Active |

---

## Pre-Development Checklist

Before changing frontend code:

1. Read the guideline file(s) relevant to the layer being changed.
2. Identify the current owner of the behavior: application shell, route page, typed static content, local media, or global style.
3. Check whether a real existing pattern already solves the problem before creating a new abstraction/dependency.
4. Keep implementation details in the narrowest owner instead of leaking them into unrelated route/page state.
5. For page visuals, typography, responsive layout, or motion, read [Visual System Guidelines](./visual-system-guidelines.md) before editing section CSS/animation behavior.
6. Use `mise run ...` tasks for project commands so the pinned Node/pnpm toolchain is used.
7. Before adding third-party media, verify its usage terms and add durable provenance metadata alongside the asset set.

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
