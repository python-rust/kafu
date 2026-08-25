# Directory Structure

> How frontend code is organized in this project.

---

## Overview

The frontend is a single Vite + React application. Code is grouped by application shell, route page, typed static content, local media, shared global styles, and tests.

The current project does **not** use generic `components/` or `features/` buckets. Route composition stays under `pages/`, and code should remain with the narrowest owner that actually exists.

The current top-level source layout is:

```text
src/
├── assets/              # Local shipping media plus provenance records
├── app/                 # Application shell and route composition
├── content/             # Typed static editorial/product content
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
└── sections/
    ├── SiteHeader.tsx
    ├── SiteHeader.module.css
    ├── HeroSection.tsx
    ├── HeroSection.module.css
    ├── JourneySection.tsx
    ├── JourneySection.module.css
    ├── WorksSection.tsx
    ├── WorksSection.module.css
    ├── GallerySection.tsx
    ├── GallerySection.module.css
    ├── OfficialLinksSection.tsx
    ├── OfficialLinksSection.module.css
    ├── SiteFooter.tsx
    └── SiteFooter.module.css
```

`HomePage.tsx` owns declarative route composition and small production-data adapters. The independently owned homepage sections keep their presentation and responsive behavior in colocated CSS Modules under `sections/`. Extract a separate module only after a real capability has an independent ownership boundary; do not recreate a second page-wide monolith beside the section modules.

### `src/content/`

Owns typed static content that is rendered by pages but should not be buried inside JSX. Use this for curated records whose values are independently reviewable, such as KAF works, visual metadata, or official outbound destinations.

Current example: `src/content/kaf.ts` defines the homepage's selected works, visual metadata, and official links. The page imports those records and owns presentation only.

```ts
export interface KafWork {
  title: string;
  releaseDate: string;
  kind: string;
  description: string;
  sourceUrl: string;
}
```

Do not introduce runtime fetching merely to move static editorial content out of JSX.

### `src/assets/`

Owns local media shipped by the frontend. Third-party media with usage conditions must live with a durable provenance record that identifies source, rightsholder/creator, usage basis, retrieval date, and any required credit.

Current example:

```text
src/assets/kaf/
├── ATTRIBUTION.md
├── hero-kaihou.jpg
├── visual-fukakai.jpg
└── visual-wasurete-shimae.jpg
```

An asset whose reuse basis is unclear must not be added to the shipping tree. Removing a third-party asset also requires removing or updating its corresponding provenance entry.

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
3. Keep curated static records in `src/content/` when they are independently reviewable product/content data rather than presentation markup.
4. Keep shipping media under `src/assets/`; third-party media with licensing constraints must have provenance documentation in the owning asset directory.
5. Keep application routing and provider composition under `src/app/` or `src/main.tsx`.
6. Do not create broad shared directories until code is genuinely reused across more than one owner.

---

## Naming Conventions

- React component and page files use `PascalCase.tsx`.
- Component/page directories use `PascalCase` when named after a component (`HomePage/`).
- CSS Modules mirror the component name: `HeroSection.module.css`.
- Global stylesheet filenames use lowercase descriptive names (`tokens.css`, `base.css`).
- Tests use `*.test.tsx`; Playwright specs live under `tests/e2e/` and use `*.spec.ts`.

---

## Examples

- `src/main.tsx` — browser entry point, global CSS imports, `BrowserRouter`, and `StrictMode`.
- `src/app/App.tsx` — route composition only.
- `src/content/kaf.ts` — typed KAF editorial records and outbound-source metadata.
- `src/assets/kaf/ATTRIBUTION.md` — provenance and usage conditions for local KAF visuals.
- `src/pages/HomePage/HomePage.tsx` — route-level composition and page-local presentation.
