# Typography Guidelines

> System-font roles, Chinese/Japanese fallback order, and zero-WebFont
> performance contracts for the KAF frontend.

---

## Scope

Read this file before changing global family tokens, font dependencies,
Japanese proper-name handling, font loading, or typography performance budgets.

The production site deliberately uses fonts already available on the visitor's
device. First-time visitors must not download font files merely to read this
single static page.

---

## Zero-WebFont Contract

The application ships no WOFF, WOFF2, TTF, or OTF resource and imports no
Fontsource package. This is an initial-load performance decision:

- CJK WebFonts can require many Unicode-range files and substantial transfer;
- the page must leave constrained bandwidth available for its editorial images;
- text must remain immediately renderable even on an unstable connection;
- there is no brand-exclusive typeface that justifies a font download.

Do not add a remote font stylesheet, local `@font-face`, font package, preload,
or runtime font loader without a separate measured review. Such a review must
show the exact production transfer/request cost, the visual role that system
fonts cannot satisfy, glyph coverage, licensing, and the effect on first-visit
image timing under the project's weak-network profile.

---

## Semantic Font Roles

`src/styles/tokens.css` is the only owner of the family stacks.

### Reading and UI

`--font-sans` owns paragraphs, navigation, controls, descriptions, metadata,
dates, milestones, and labels:

```css
'PingFang SC', 'Microsoft YaHei', 'Noto Sans CJK SC',
'Source Han Sans SC', system-ui, -apple-system, BlinkMacSystemFont,
'Segoe UI', sans-serif
```

The order provides native Chinese faces on macOS and Windows, common installed
CJK alternatives elsewhere, and a platform UI fallback.

### Chinese editorial display

`--font-display-zh` and `--font-display` own the Chinese Hero identity, section
headings, Journey titles, and major official-link identity:

```css
'Songti SC', STSong, SimSun, 'Noto Serif CJK SC',
'Source Han Serif SC', serif
```

### Japanese proper names

`--font-display-ja` keeps Japanese Mincho families first for separately marked
`lang="ja"` text:

```css
'Hiragino Mincho ProN', 'Yu Mincho', YuMincho,
'Noto Serif JP', 'Noto Serif CJK JP', serif
```

Current consumers are the Hero original-name line, album titles, Gallery active
titles, and Gallery thumbnail titles. Do not force a Simplified Chinese face
ahead of available Japanese fonts for these strings.

### Editorial Latin and numerals

`--font-display-latin` owns prominent Journey years and similar editorial Latin
content:

```css
'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua',
Palatino, Georgia, 'Times New Roman', serif
```

---

## Rendering Contract

- Keep `font-synthesis: none` on the document.
- Components and CSS Modules consume semantic tokens; they do not repeat family
  stacks locally.
- Preserve the Japanese-first `lang="ja"` role.
- System fonts differ slightly by operating system. Preserve hierarchy,
  readability, line-height, reflow, and clipping contracts instead of asserting
  identical glyph geometry across platforms.
- Intermediate weights such as 550 and 650 may resolve to the closest installed
  face. Do not compensate by introducing a WebFont.
- Chinese display tracking remains restrained, approximately `-0.02em` to
  `-0.04em`.
- Body text remains normal tracking with line-height around 1.7–1.9.

---

## Performance Budget

Production and preview builds must contain:

```text
font requests: 0
bundled font files: 0
font transfer bytes: 0
```

`scripts/verify_static_build.py` rejects bundled font files. Browser coverage
also inspects resource timing and rejects WOFF/WOFF2/TTF/OTF requests.

This budget concerns the application bundle. A platform may internally use its
own installed fonts without a network request.

---

## Required Validation

Run:

```bash
mise run check
mise run e2e
python3 scripts/verify_static_build.py dist
```

Browser coverage must verify:

- sans, Chinese display, Japanese proper-name, and Latin display tokens remain
  assigned to the intended elements;
- no font resource is requested;
- desktop/mobile, 200% text, reduced-motion, and overflow checks stay green.

---

## Common Mistakes

- Reintroducing a font package because one operating system's glyph shape looks
  slightly different.
- Adding a remote font CDN to avoid bundling files; it still consumes the
  visitor's constrained network and adds another origin.
- Copying complete family stacks into section CSS instead of using tokens.
- Putting a Chinese face ahead of Japanese Mincho fallbacks for `lang="ja"`
  names.
- Testing only on a warm browser cache and missing first-visit font contention.

