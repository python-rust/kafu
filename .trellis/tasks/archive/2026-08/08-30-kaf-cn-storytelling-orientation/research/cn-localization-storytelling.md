# Chinese localization and storytelling research

Research date: 2026-08-30

## Official KAF identity and chronology

### KAMITSUBAKI artist profile

- https://kamitsubaki.jp/artist/kaf/
- Describes KAF as the virtual singer at the origin of KAMITSUBAKI STUDIO.
- Confirms 2018 debut at age 14, 3D-avatar activity without revealing her real
  face, the Nippon Budokan performance in 2022, and the arena-scale Yoyogi
  performance opening the second chapter in 2024.
- Product use: the newcomer story is organized around identity, voice/world,
  movement into physical venues, and a second chapter.

### KAF official About and History

- https://kaf.kamitsubaki.jp/about/
- https://kaf.kamitsubaki.jp/history/
- Product use: factual profile and milestone references remain in the bottom
  source disclosure and existing Journey milestone links.

### Official Bilibili presence

- https://space.bilibili.com/488970166/
- The official account uses the Simplified Chinese display name `花谱` and
  describes her as a virtual singer.
- Product use: Chinese interface identity becomes `花谱`; authoritative Japanese
  names remain untranslated proper nouns.

## Localization and Chinese layout

### Microsoft localization style guides

- https://learn.microsoft.com/en-us/globalization/reference/microsoft-style-guides
- Localization rules include market-specific language/style conventions rather
  than literal string replacement.
- Product use: navigation, actions, accessibility names, and explanatory copy
  are rewritten for Chinese user intent.

### Microsoft Writing Style Guide

- https://learn.microsoft.com/en-us/style-guide/welcome/
- Emphasizes natural, simple, clear wording and making every word matter.
- Product use: direct Chinese actions and short explanatory sentences; no
  decorative bilingual microcopy.

### W3C Chinese language enablement

- https://www.w3.org/TR/hani-lreq/
- https://w3c.github.io/clreq/home.html
- Documents Simplified/Traditional Chinese web layout needs.
- Product use: Chinese-first font order, `zh-CN` document language, and explicit
  `lang="ja"` for Japanese proper names.

## Scroll storytelling and motion

### Motion presence APIs and native viewport observation

- https://motion.dev/docs/react-animate-presence
- AnimatePresence handles keyed enter/exit transitions. Native
  IntersectionObserver already powers the existing Journey and is sufficient
  for four onboarding steps and five page locations.
- Product use: low-frequency observer state plus existing Motion transitions.

### Scrollama evaluation

- https://github.com/russellsamora/scrollama
- Scrollama is a mature IntersectionObserver-based scrollytelling library.
- Decision: do not add it. The project already has Motion and a proven Journey
  observer; another runtime would duplicate the needed mechanism for four steps.

### Motion accessibility

- https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions
- https://www.w3.org/WAI/WCAG22/Techniques/css/C39
- Non-essential motion should be suppressible through reduced-motion user
  preferences.
- Product use: sticky/on-enter effects are presentation enhancements only; all
  content remains in normal flow and transitions become zero-duration when
  reduced motion is requested.

## Final product decision

1. Stable fixed Chinese navigation with active location.
2. One short onboarding story before the existing chronology.
3. Chinese narrative titles plus authoritative Japanese names.
4. Transformation pairs that explain what changed in every historical stage.
5. Existing Motion/IntersectionObserver only; no new dependency.

## Implemented evidence

- Stable header surface and active location passed browser contrast/navigation
  assertions at 1440×900.
- Four onboarding steps and six Journey chapters update their sticky stage at
  early, middle, and final scroll positions.
- Mobile 390×844 and 200% root-text tests retain all content without document
  overflow.
- Reduced-motion mode removes both sticky stages while preserving all articles,
  images, controls, and sources.
