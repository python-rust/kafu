# Directory Structure

> How frontend code is organized in this project.

---

## Overview

The frontend is a single Vite + React application. Code is grouped by application shell, domain feature, route page, shared global styles, and tests.

The current project does **not** use a generic `components/` bucket. Feature-specific UI stays with the feature that owns it, while route composition stays under `pages/`.

The current top-level source layout is:

```text
src/
├── app/                 # Application shell and route composition
├── features/            # Domain or capability modules
│   └── live2d/          # 2D character stage and runtime boundary
├── pages/               # Route-level page composition
│   └── HomePage/
├── styles/              # Global reset, design tokens, and base styles
└── main.tsx             # Browser entry point and global providers
```

Tests live outside `src/`:

```text
tests/
├── HomePage.test.tsx    # Vitest + Testing Library integration test
├── setup.ts             # Vitest DOM setup
└── e2e/
    └── home.spec.ts     # Playwright browser smoke test
```

---

## Directory Layout

### `src/app/`

Owns application-level composition such as routing. It should not contain feature implementation details.

Current example: `src/app/App.tsx` defines the route table and fallback route:

```tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### `src/features/<feature>/`

Owns capability-specific components, styles, and runtime abstractions.

Current example:

```text
src/features/live2d/
├── DevelopmentPuppet.tsx
├── DevelopmentPuppet.module.css
├── Live2DStage.tsx
├── Live2DStage.module.css
└── runtime/
    └── Live2DAdapter.ts
```

The `live2d` feature keeps the future imperative Cubism runtime behind `runtime/Live2DAdapter.ts`; page code does not depend on Cubism-specific types.

### `src/pages/<PageName>/`

Owns route-level composition and page-local styles.

Current example:

```text
src/pages/HomePage/
├── HomePage.tsx
└── HomePage.module.css
```

Pages compose features, presentation, and page-level motion. They do not contain the feature's low-level runtime implementation.

### `src/styles/`

Owns only truly global CSS:

- `reset.css` — browser normalization/reset behavior.
- `tokens.css` — project-wide CSS custom properties for typography, color, spacing, radii, and motion constants.
- `base.css` — global document/body/root defaults.

Component- and page-specific visual rules belong in colocated `*.module.css` files.

---

## Module Organization

1. Put code in the narrowest domain that owns it.
2. Colocate a React component with its CSS Module when the styles are local to that component or page.
3. Keep runtime/vendor boundaries in a dedicated subdirectory such as `runtime/` rather than leaking SDK objects into React pages.
4. Keep application routing and provider composition under `src/app/` or `src/main.tsx`.
5. Do not create broad shared directories until code is genuinely reused across more than one feature/page.

The existing Live2D boundary is the reference pattern for vendor isolation:

```text
HomePage
  -> Live2DStage
     -> DevelopmentPuppet today
     -> runtime/Live2DAdapter for future Cubism integration
```

---

## Naming Conventions

- React component and page files use `PascalCase.tsx`.
- Component/page directories use `PascalCase` when named after a component (`HomePage/`).
- CSS Modules mirror the component name: `HomePage.module.css`, `Live2DStage.module.css`.
- Runtime/interface files use `PascalCase.ts` when exporting the primary named type (`Live2DAdapter.ts`).
- Global stylesheet filenames use lowercase descriptive names (`tokens.css`, `base.css`).
- Tests use `*.test.tsx`; Playwright specs live under `tests/e2e/` and use `*.spec.ts`.

---

## Examples

- `src/main.tsx` — browser entry point, global CSS imports, `BrowserRouter`, and `StrictMode`.
- `src/app/App.tsx` — route composition only.
- `src/pages/HomePage/HomePage.tsx` — route-level composition using Motion and the Live2D feature.
- `src/features/live2d/Live2DStage.tsx` — feature component that owns local interaction state.
- `src/features/live2d/runtime/Live2DAdapter.ts` — stable boundary around an imperative third-party runtime.

