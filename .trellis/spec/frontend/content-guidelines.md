# Interface Content Guidelines

> Executable rules for visible homepage copy. These rules prevent generic
> generated-site prose from replacing real product content.

---

## Scope

Apply this file whenever a frontend change adds or edits:

- headings, section labels, navigation, buttons, or links;
- supporting copy, captions, dates, metadata, or status text;
- accessibility names that describe a visible action;
- component props that invite callers to supply visible copy.

The homepage is a Simplified Chinese introduction and archive about 花谱. Copy must identify the subject, state a
fact, enable an action, credit a source, or communicate a legal constraint. It
must not narrate the interface or manufacture atmosphere through generic labels.

---

## The Visible-String Job Test

Every visible string must do at least one concrete job:

1. **Identity** — the actual person, project, work, or section name.
2. **Fact** — a date, work type, historical description, or verified note.
3. **Navigation / action** — where a link goes or what a control does.
4. **Attribution** — the actual creator, publisher, or source credit.
5. **Legal meaning** — the non-commercial / unaffiliated disclaimer.

If removing a string does not damage one of those jobs, remove it.

### Good / base / bad cases

- **Good:** `开始认识花谱`, `2024.12.25`, `花譜 / piapro`, `成长轨迹`.
- **Base:** a one-sentence factual summary that adds information not visible in
  the title, media, or adjacent metadata.
- **Bad:** `KAF / VISUAL NOTES`, `CURRENT WORK`, `ARCHIVE / 01`, or “scroll down
  to read the six chapters.”

---

## Forbidden Template Patterns

Do not add any of these by default:

- tiny uppercase English eyebrow / preheader text above every heading;
- slash-separated category strings used only for atmosphere;
- leading-zero item or chapter numbers without a real ordering task;
- faux system/status text such as `CURRENT`, `SIGNAL`, `FIELD`, or `OBSERVATION`;
- an English subtitle that merely repeats an existing Japanese title;
- generic section prose that explains scrolling, layout, curation, cards,
  galleries, sticky behavior, or how credits are positioned;
- labels such as `SOURCE` or `VISUAL CREDIT` when the actual credit/link is
  already clear;
- replacing removed English filler with equally decorative Japanese filler.

An eyebrow is permitted only when it adds information the heading cannot carry
and that information passes the Visible-String Job Test. The shared
`SectionHeading` API intentionally has no eyebrow or generic summary prop.

### Wrong vs correct

```tsx
// Wrong: the copy describes a template, not KAF content.
<header>
  <p>KAF / VISUAL NOTES</p>
  <h2>Visual Archive</h2>
  <p>A curated sequence of eight images with credits beside every image.</p>
</header>

// Correct: direct section identity; the interface reveals its own structure.
<SectionHeading id="visuals-title" tone="light">
  视觉档案
</SectionHeading>
```

```tsx
// Wrong: every image interrupts the composition with the same source row.
<figure>
  <img src={sourceUrl} alt="..." />
  <figcaption>VISUAL CREDIT — 花譜 / piapro</figcaption>
</figure>

// Correct: page media stays clean; one bottom index owns source detail.
<MediaSources media={kafMedia} />
```

---

## Language Rules

- Use natural Simplified Chinese for navigation, section identity, actions,
  explanations, accessibility names, generic metadata, and legal copy.
- Use `花谱` in Chinese prose. Introduce the official Japanese spelling `花譜`
  and Latin name `KAF` once near the Hero identity.
- Keep official Japanese work/event names, creator credits, and sourced metadata
  in their authoritative form; mark separately rendered Japanese text with
  `lang="ja"`.
- Mixed language is acceptable only when the underlying proper noun or source
  requires it. Mixed language is not decorative texture.
- Use direct Chinese action labels such as `查看官方页面`, `来源`, `放大`, and
  `关闭`; do not retain Japanese UI strings in aria labels.
- Do not use Traditional Chinese UI glyphs when a Simplified Chinese interface
  equivalent exists.
- Keep accessibility names in the same Chinese language as the visible control,
  while preserving sourced proper nouns inside the name.

Detailed naming and story rules live in
[Chinese Localization & Storytelling](./localization-and-storytelling-guidelines.md).

---

## Legal and Attribution Placement

- The unaffiliated, non-commercial fan-project disclaimer appears once in the
  footer. Do not repeat it in the header, Hero metadata, or every section.
- Media attribution is consolidated in the page-bottom source area. Required
  creator names remain visible; per-work source and license links remain in the
  adjacent native disclosure.
- Never remove a source URL, credit, or license/provenance record merely to make
  a composition cleaner.

---

## Required Tests

When copy hierarchy changes, tests must assert:

- direct section and navigation names;
- Simplified Chinese UI plus preserved Japanese proper names;
- the absence of removed template strings;
- the one-footer disclaimer contract;
- no image-source work-page links inside `<main>`;
- visible bottom creator names and the complete source/license disclosure;
- no reintroduction of `eyebrow` markup or decorative `data-rhythm` indexes in
  the homepage composition.

Current examples live in:

- `tests/HomePage.test.tsx`;
- `tests/HeroSection.test.tsx`;
- `tests/e2e/home.spec.ts`.
