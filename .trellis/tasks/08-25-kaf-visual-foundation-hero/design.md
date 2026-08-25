# Design — KAF visual foundation and hero

## 1. Visual objective

The first viewport should feel like entering KAF's virtual visual world: dark spatial depth, one dominant character visual, large Japanese identity, luminous but disciplined accent color, and a clear invitation to descend into the journey.

The component must not resemble a dashboard, ecommerce hero, or warm magazine cover.

## 2. Global token migration

Retain existing token names where current code still consumes them, but evolve/add semantic dark-theme roles. During Wave 1 the old page must remain compilable and reasonably readable; Wave 2 performs final route composition.

Recommended roles:

```css
--color-void;
--color-surface;
--color-surface-raised;
--color-text;
--color-text-muted;
--color-coral;
--color-magenta;
--color-violet;
--color-cyan;
--color-line-on-dark;
--focus-ring;
--shadow-glow-soft;
```

Do not define chapter-specific colors globally; the Journey section owns local theme properties.

## 3. Header contract

Suggested shape:

```ts
interface SiteHeaderNavItem {
  label: string;
  href: `#${string}`;
}

interface SiteHeaderProps {
  projectName?: string;
  statusLabel?: string;
  navItems: readonly SiteHeaderNavItem[];
}
```

The defaults may reflect the current KAF Observatory identity, but externally visible copy should still be overridable. Use native `<header>`, `<nav>`, and `<a>` elements.

Avoid a JavaScript-controlled mobile drawer unless direct compact navigation demonstrably fails. A horizontally scrollable or wrapping navigation is preferable to unnecessary state.

## 4. Hero contract

Suggested shape:

```ts
interface HeroVisual {
  src: string;
  alt: string;
  width: number;
  height: number;
  credit: string;
  sourceUrl: string;
  objectPosition?: string;
}

interface HeroSectionProps {
  visual: HeroVisual;
  titleJa?: string;
  titleEn?: string;
  eyebrow?: string;
  statement: string;
  description: string;
  officialUrl: string;
  journeyHref?: `#${string}`;
}
```

Use narrow local interfaces; structural typing will allow Wave 2 to pass the media task's richer records.

## 5. Composition

### Desktop

- Minimum-height near the viewport height without relying on fragile `100vh` alone; prefer modern viewport units with fallback.
- Character image occupies the dominant visual area.
- Large `花譜` display type may overlap safe negative space but must not cover the face/essential detail.
- A controlled gradient/mask ensures text readability without flattening the art.
- Scroll cue remains visible near the lower edge.

### Mobile

- Deliberate image/title/copy sequence rather than a collapsed two-column grid.
- Keep important image content in view through a configurable object-position or non-destructive frame.
- Avoid text over busy image regions.
- Keep CTAs and navigation touch-safe.

## 6. Graphic language

- Original CSS lines, signal traces, petal fragments, registration marks, and sequence labels.
- Decorative elements use pseudo-elements or lightweight original geometry and are `aria-hidden` when represented in DOM.
- Use glow sparingly around the focal visual or accent rule; do not glow every text element.
- Limit rounded containers. Prefer masks, rules, crop frames, and open spatial composition.

## 7. Motion

- Initial copy/image reveal may use bounded opacity/translation/scale.
- Decorative signal/petal movement must be low amplitude and non-essential.
- Reduced motion renders final states immediately.
- Do not create a global scroll listener or journey progress in this task.

## 8. Tests

Use Testing Library with local fixtures to verify:

- header/navigation landmarks and anchor names;
- visible unofficial status;
- `h1` identity;
- official CTA and journey link destinations;
- image alt/intrinsic dimensions;
- source/credit link;
- no required interaction state for mobile navigation.

CSS visual acceptance is completed in Wave 2; focused tests should not inspect class names.

## 9. Compatibility and rollback

Do not remove old tokens abruptly when legacy HomePage CSS still consumes them. Add aliases or preserve values until Wave 2 removes legacy CSS. Reverting this PR should restore previous tokens/base and remove the additive header/hero modules without content migration.
