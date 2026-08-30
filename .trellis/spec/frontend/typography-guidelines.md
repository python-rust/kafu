# Typography Guidelines

> Font-family, loading, licensing, performance, and role contracts for the KAF
> frontend.

---

## Scope

Read this file before changing global family tokens, font dependencies,
`@font-face` imports, Japanese proper-name handling, webfont loading/subsetting,
or font license files.

The product uses a restrained two-family Chinese system. Visual variety comes
from clear reading and display roles, not from adding a novelty font to every
section.

---

## Approved Families

```text
@fontsource-variable/noto-sans-sc@5.3.0
@fontsource-variable/noto-serif-sc@5.3.0
```

Both are Noto CJK Simplified Chinese variable faces under SIL OFL 1.1.

### Reading/UI role

`--font-sans` starts with `Noto Sans SC Variable` and owns body paragraphs,
navigation, controls, descriptions, metadata, dates, milestones, and labels.

### Editorial display role

`--font-display-zh` and `--font-display` start with
`Noto Serif SC Variable` and own Hero identity, section headings, Journey
titles, and major official-link identity. Prominent Journey years may use
`--font-display-latin`, which resolves to the same serif face.

### Japanese proper-name role

`--font-display-ja` keeps native Japanese Mincho families first:

```css
'Hiragino Mincho ProN', 'Yu Mincho', 'Noto Serif JP',
'Noto Serif SC Variable', serif
```

Do not put the SC face ahead of available Japanese fonts for separately marked
`lang="ja"` text. Current consumers are the Hero original-name line, album
titles, Gallery active titles, and Gallery thumbnail titles.

---

## Import and Ownership

Fontsource CSS is imported once in `src/main.tsx`, before project CSS:

```ts
import '@fontsource-variable/noto-sans-sc/wght.css';
import '@fontsource-variable/noto-serif-sc/wght.css';
```

- Components and CSS Modules never import font packages directly.
- Font URLs never appear in component CSS.
- `src/styles/tokens.css` owns semantic family stacks.
- Variable faces serve all approved weights; do not add static weight packages
  beside them.
- Remote font stylesheets/CDNs are not permitted for these roles.

---

## Loading Contract

- Keep Fontsource's `font-display: swap` behavior.
- Keep default Unicode-range segmentation so the browser selects only fragments
  containing characters used by the page.
- Do not manually preload guessed CJK fragments.
- Do not create a project-specific subset without separate glyph-coverage,
  regeneration, naming, and license review.
- All production font requests must resolve to the application origin.

Current production-preview baseline after `document.fonts.ready`:

```text
font requests: 40
transferred font bytes: 2,387,612
formats: WOFF2 only
origins: application origin only
```

Regression budget: no more than 60 WOFF2 requests and 3.5 MB transferred font
bytes. This is a regression threshold, not permission to add fonts until it is
exhausted.

---

## Weight, Tracking, and Synthesis

- Noto Sans SC Variable supports weights 100–900.
- Noto Serif SC Variable supports weights 200–900.
- Intermediate weights such as 550 and 650 are intentional variable weights.
- Keep `font-synthesis: none` on the document to avoid manufactured faces.
- Chinese display tracking must stay restrained, roughly `-0.02em` to
  `-0.04em`; do not restore aggressive `-0.065em` compression.
- Body text remains normal tracking with line-height around 1.7–1.9.
- Font changes must preserve the size floors and ceilings in
  `visual-system-guidelines.md`.

---

## Licensing Contract

The shipped font software is covered by SIL Open Font License 1.1.

Required files:

```text
THIRD_PARTY_NOTICES.md
public/font-licenses/Noto-OFL-1.1.txt
```

The notice records package versions and upstream references. Vite copies the
license file into production output.

Do not sell font files by themselves, remove copyright/license information,
claim upstream endorsement, or add a personal-use/non-commercial-only family
without an explicit deployment review.

---

## Evaluating Another Font

Before adding or replacing a family, document:

1. authoritative upstream and exact version;
2. redistribution/web-embedding license;
3. Reserved Font Names and subsetting restrictions;
4. Simplified Chinese/Japanese coverage;
5. web formats and variable axes;
6. real production-preview transfer and request count;
7. which existing semantic role it replaces;
8. why approved/system families cannot meet that role.

Do not add a third family merely to decorate one label. Klee One and LXGW
WenKai were reviewed for this iteration and deliberately not added because the
incremental payload/licensing complexity was not justified by the sparse role.

---

## Required Validation

Run `mise run check` and `mise run e2e`.

Browser coverage must verify computed sans/display roles, loaded faces,
same-origin WOFF2 resources, transfer/request budgets, deployed OFL text, and
all existing 320px/mobile/200%-text/reduced-motion/overflow contracts.

## Common Mistakes

- Importing the same package from multiple section files.
- Loading static weights beside an approved variable face.
- Adding a handwriting font to many labels merely to appear Japanese.
- Forcing an SC font ahead of native Japanese fonts for `lang="ja"` names.
- Judging CJK performance from unpacked NPM size instead of browser-selected
  Unicode-range resources.
- Using a remote font CDN despite the same-origin requirement.
- Omitting license text from a static bundle that redistributes WOFF2 files.

