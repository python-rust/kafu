# Research: artist-site copy and era interaction

## Official KAF evidence

### Artist identity

- `https://kamitsubaki.jp/artist/kaf/`
- Official profile calls KAF the virtual singer at the beginning of
  KAMITSUBAKI STUDIO, states a 2018 debut at age 14 using a 3D avatar without
  revealing her face, and records the 2022 Nippon Budokan and 2024 Yoyogi First
  Gymnasium solo shows.

### Official homepage composition

- `https://kaf.kamitsubaki.jp/`
- The homepage foregrounds the KAF identity/visual, schedule, news,
  discography, and movies. It does not use copy that explains how the homepage
  will teach the visitor or how long reading will take.

### Third album

- `https://kaf.kamitsubaki.jp/discography/20230308/199/`
- Official page identifies `狂想β` as the third album, released 2023-03-08,
  with 15 tracks.
- `https://kaf.kamitsubaki.jp/discography/` independently lists both `狂想α`
  and `狂想β` on that date.

## Comparable official artist sites

### 米津玄師 / REISSUE RECORDS

- `https://reissuerecords.net/`
- Homepage uses current news, live information, discography, gallery, and
  profile navigation. It does not place an explanatory “this site will help you
  understand the artist” paragraph in the Hero.

### 宇多田ヒカル

- `https://www.utadahikaru.jp/`
- Homepage foregrounds current release/video and direct product/navigation
  labels. Biography is delegated to Profile/Biography rather than compressed
  into a Hero slogan.

### YOASOBI

- `https://www.yoasobi-music.jp/`
- Uses the established concise identity line `NOVEL INTO MUSIC`; it is a brand
  proposition, not an instruction describing the page layout or reading time.

## Content-design guidance

### Material Design 3

- Labels should concisely describe content, purpose, or behavior. This supports
  factual controls (`人物介绍`, `代表作品`) and argues against rhetorical helper
  text that does not explain an action.
- `https://m3.material.io/foundations/designing/elements`

### GOV.UK Design System

- Task/hint guidance says titles should be short and hint text should only be
  used when evidence shows users need additional information.
- This reinforces removing a repeated subtitle under every meaningful heading.
- `https://design-system.service.gov.uk/components/task-list/`

## Interaction research

### Radix Tabs

- `https://www.radix-ui.com/primitives/docs/components/tabs`
- Official primitive supports controlled/uncontrolled state, horizontal or
  vertical orientation, automatic/manual activation, and full keyboard
  navigation.
- It adheres to the WAI-ARIA Tabs pattern.
- Documentation reports an approximately 3.96 kB component size.
- Package registry check on 2026-08-30:

```json
{
  "version": "1.1.21",
  "peerDependencies": {
    "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
    "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
  }
}
```

### WAI-ARIA APG

- `https://www.w3.org/WAI/ARIA/apg/patterns/tabs/`
- Tabs are an appropriate pattern for a visible list of labels where one
  associated panel is displayed at a time. This matches six always-visible era
  labels controlling one detailed stage.

### Motion

- `https://motion.dev/docs/react-animate-presence`
- Existing `AnimatePresence`/keyed transitions are sufficient for active image
  and text changes. No second animation system is required.

### CSS scroll snap

- `https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_snap`
- Scroll snap can contain the narrow-screen tab rail, but it is not selected as
  the primary narrative mechanic. The user explicitly reported too much
  scroll-driven storytelling.

## Three review rounds

### Round 1 — Copy/content hierarchy

Rejected preserving the current Hero/section slogans. Official artist sites
use identity, releases, dates, works, and direct navigation. Selected a factual
Hero and a dedicated biography section.

### Round 2 — Story architecture

Rejected two consecutive sticky stories. Selected a static Profile plus one
interactive chronology so each section has a different user purpose and
interaction grammar.

### Round 3 — Interaction implementation

Compared native handmade tabs, Scrollama, swipe carousel, WebGL, and Radix.
Selected Radix Tabs + existing Motion because it supplies mature keyboard/ARIA
behavior, keeps the dependency narrow, and supports direct exploration without
auto-play or scroll interception.

## Final design rules

1. Hero identifies; it does not explain the page.
2. Profile states verified biography; it does not sell an interpretation.
3. Journey has one title per era and substantive facts beneath it.
4. Official Japanese names appear as actual content, not decorative subtitles.
5. Interaction is user-controlled, keyboard-complete, and never auto-advances.
6. Visual impact comes from composition, artwork, and state change—not extra
   slogans or animation frameworks.

## Post-implementation review

### Copy review

- Hero now contains one factual role line and two destination labels.
- Profile contains two official-fact-based paragraphs plus four concrete
  attributes; no repeated question/slogan pattern remains.
- Journey uses one Chinese title and substantive factual paragraphs per era;
  original-title and change-pair microcopy were removed.

### Interaction review

- Chromium confirmed six tab triggers, standard tab/panel ARIA linkage,
  ArrowRight, Home, End, pointer selection, and previous/next controls.
- Narrow-screen year navigation is contained inside its own scroll rail.
- Biography and chronology no longer repeat the same sticky-scroll mechanism.

### Discography review

- Representative works now cover the five original albums in descending
  homepage order: `深愛`, `寓話`, `狂想β`, `魔法α`, `観測α`.
- `狂想β` intentionally has no image because no verified local cover is
  available; tests prevent an unrelated visual from being assigned.
