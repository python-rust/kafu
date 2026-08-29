# Anti-template content and gallery research

Research date: 2026-08-29

## Local audit

Measured before implementation at 1440×900:

- document height: 11,014px;
- recurring sub-14px visible strings: more than 50;
- repeated template strings include:
  - `VOICE / IMAGE / MEMORY`;
  - `KAF / CHRONOLOGY`;
  - `KAF / SELECTED DISCOGRAPHY`;
  - `KAF / VISUAL NOTES`;
  - `KAF / OFFICIAL CHANNELS`;
  - `CHAPTER 03` / `03 / 06`;
  - `CURRENT WORK`;
  - `ARCHIVE / 01`;
  - `VISUAL CREDIT` / `SOURCE`;
  - English chapter subtitles paired with Japanese titles.

The Journey and Gallery section introductions also describe the interface
instead of adding content: they explain scrolling mode, layout, and how credits
are placed. This is implementation narration, not user-facing information.

The current gallery renders eight figures with five rhythm variants. Each item
has an index, title, full credit, and source action, so every item competes at
the same hierarchy level. The irregular grid creates movement but no focal path.

## Why the result reads as AI-generated

The problem is a cluster of patterns, not any single design element:

1. Tiny all-caps overlines with wide tracking and slash-separated categories.
2. Leading-zero section/item numbering even when sequence has no user value.
3. Oversized editorial serif headings above generic explanatory prose.
4. Repeated “this section lets you…” copy that describes the interface.
5. Generic English labels added to non-English content for atmosphere.
6. Repeated cards/gradients that are independent of the actual artist/media.

The discussion around eyebrow text is nuanced: preheaders are legitimate
editorial devices, but the specific tiny all-caps + decorative line + generic
category implementation has become a common AI-builder tell. The correct rule
is therefore not “eyebrows are always forbidden”; it is “do not add one unless
it communicates information the heading cannot.” In this homepage, none of the
current overlines pass that test.

Sources:

- Kyle Chayka, “The generic style of AI web design”:
  https://kylechayka.substack.com/p/the-generic-style-of-ai-web-design
- Copywriting discussion identifying the tiny all-caps, tracked, decorated
  overline and leading-zero combination:
  https://www.reddit.com/r/copywriting/comments/1u9836d/eyebrows_are_now_considered_an_ai_tell/

## Content design findings

NN/g's informational microcopy guidance prioritizes clarity and concision;
character comes after usefulness. GOV.UK content-design guidance starts from a
valid user need and explicitly recommends reducing or removing content when it
does not meet that need. Applied here, a sentence explaining that users should
scroll downward or that a section is a curated gallery should be deleted: the
layout already communicates it and the text does not help users complete an
action or learn a fact.

Sources:

- https://www.nngroup.com/articles/3-cs-microcopy/
- https://www.nngroup.com/articles/ui-copy/
- https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/plan-manage-content/understand-content-design/
- https://www.gov.uk/guidance/content-design/user-needs

Applied content test:

> Keep a visible string only if removing it would damage identity, factual
> understanding, navigation/action clarity, attribution, or legal meaning.

## Visual hierarchy findings

NN/g describes hierarchy as the ordering of attention through color/contrast,
scale, and grouping, and warns that too many contrast variations reduce
hierarchy. The current page repeatedly uses the same large-heading/tiny-label
contrast, which makes the pattern noticeable rather than the content.

Source:

- https://www.nngroup.com/articles/visual-hierarchy-ux-definition/

Applied decision:

- keep one Hero display scale;
- keep section headings moderate;
- keep metadata close to body size;
- create hierarchy through artwork scale, spatial grouping, and active state.

## KAF-specific reference

KAF's official site was art-directed and designed by .MP. The official
KAMITSUBAKI artist page uses direct navigation and factual content, while .MP's
own work index uses media/project identity rather than verbose section
explanations.

Sources:

- https://dotmp.jp/en/work/88549
- https://kaf.kamitsubaki.jp/
- https://kamitsubaki.jp/artist/kaf/
- https://dotmp.jp/en/

Applied decision:

- use direct Japanese section names;
- let KAF imagery provide color and atmosphere;
- keep explanatory prose only where it communicates real historical facts.

## Gallery architecture research

### React Photo Album

`react-photo-album` provides mature responsive rows, columns, and masonry
algorithms and preserves image proportions. It is a strong option when the
problem is mathematically packing many images.

Source:

- https://github.com/igordanchenko/react-photo-album

Rejected for the primary gallery composition because the user specifically
objects to eight competing images and an incoherent overview. Better packing
would not create one intentional focal path.

### PhotoSwipe

PhotoSwipe is a mature framework-independent lightbox with responsive images,
touch gestures, and dynamic import. It would work, but React integration would
require an imperative lifecycle wrapper and cleanup layer.

Sources:

- https://photoswipe.com/
- https://github.com/dimsemenov/photoswipe

### Yet Another React Lightbox

YARL provides a React component, intrinsic image dimensions, keyboard and swipe
navigation, focus/no-scroll behavior, Escape close, lifecycle callbacks, and a
modular API. The current package metadata explicitly supports React 19; the
latest researched version is `3.32.2`, released 2026-07-30 under MIT.

Sources:

- https://yet-another-react-lightbox.com/documentation
- https://github.com/igordanchenko/yet-another-react-lightbox
- https://github.com/igordanchenko/yet-another-react-lightbox/releases

Selected use:

- custom inline KAF visual theatre for product-specific composition;
- lazy-loaded YARL only for the difficult dialog/focus/gesture layer;
- no captions/counter/thumbnails plugins unless acceptance testing proves they
  are needed;
- current inline active index synchronizes through `on.view`.

## Final direction

1. Dark, warm, image-led page; no neon grid and no pale template foundation.
2. Direct Japanese navigation and section titles.
3. No eyebrow API and no section-explanation copy.
4. One reusable media-credit component and one heading component.
5. One gallery stage, eight thumbnail buttons, active-image backdrop, and a
   lazy open-source lightbox.
6. Preserve the successful Journey observer/sticky interaction while stripping
   decorative English/numbering from its presentation.

## Implemented outcome

- The generic all-caps/slash/leading-zero system was removed rather than merely
  translated or enlarged. The shared heading component exposes no API for an
  eyebrow or generic explanatory paragraph.
- The mostly light page was replaced by warm near-black/plum surfaces with
  off-white text, limited KAF pink, chapter-specific blue/lilac accents, and
  image-derived gallery atmosphere. No radial glow, neon grid, glass card, or
  backdrop-filter pattern remains.
- The archive now presents one selected artwork at approximately `991×620px` on
  the 1440×900 reference viewport, plus an eight-item horizontal selection rail.
- The selected lightbox is `yet-another-react-lightbox@3.32.2`. It remains
  behind a lazy local adapter and Vite emits its JavaScript and stylesheet as
  separate chunks.
- Desktop document height changed from the second-pass baseline `11,014px` to
  `8,549px` (`-22.4%`). The original first-round baseline was `15,693px`, so the
  two refinements together reduce desktop height by approximately `45.5%` while
  retaining every chapter, work, visual, source, and official destination.
- The browser matrix verifies 14px recurring text, 16px body text, <=72px
  section headings, dark-surface contrast, 320px reflow, 200% root text,
  reduced motion, sticky release, gallery keyboard/Escape behavior, and no
  document overflow.
