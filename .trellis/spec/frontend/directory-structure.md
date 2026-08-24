# Directory Structure

> How frontend code is organized in this project.

---

## Overview

The frontend is a single Vite + React application. Code is grouped by application shell, route page, shared global styles, and tests.

The current project does **not** use generic `components/` or `features/` buckets. Route composition stays under `pages/`, and code should remain with the narrowest owner that actually exists.

The current top-level source layout is:

```text
src/
├── app/                 # Application shell and route composition
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

Owns application-level composition such as routing. It should not contain page implementation details.

Current example: `src/app/App.tsx` defines the route table and fallback route:

```tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### `src/pages/<PageName>/`

Owns route-level composition and page-local styles.

Current example:

```text
src/pages/HomePage/
├── HomePage.tsx
└── HomePage.module.css
```

Pages currently own the user-visible presentation for their route. Extract a separate module only after a real capability has an independent ownership boundary.

### `src/styles/`

Owns only truly global CSS:

- `reset.css` — browser normalization/reset behavior.
- `tokens.css` — project-wide CSS custom properties for typography, color, spacing, radii, and motion constants.
- `base.css` — global document/body/root defaults.

Page-specific visual rules belong in colocated `*.module.css` files.

---

## Module Organization

1. Put code in the narrowest domain that owns it.
2. Colocate a React component with its CSS Module when the styles are local to that component or page.
3. Keep application routing and provider composition under `src/app/` or `src/main.tsx`.
4. Do not create broad shared directories until code is genuinely reused across more than one owner.

---

## Naming Conventions

- React component and page files use `PascalCase.tsx`.
- Component/page directories use `PascalCase` when named after a component (`HomePage/`).
- CSS Modules mirror the component name: `HomePage.module.css`.
- Global stylesheet filenames use lowercase descriptive names (`tokens.css`, `base.css`).
- Tests use `*.test.tsx`; Playwright specs live under `tests/e2e/` and use `*.spec.ts`.

---

## Examples

- `src/main.tsx` — browser entry point, global CSS imports, `BrowserRouter`, and `StrictMode`.
- `src/app/App.tsx` — route composition only.
- `src/pages/HomePage/HomePage.tsx` — route-level composition and page-local presentation.
