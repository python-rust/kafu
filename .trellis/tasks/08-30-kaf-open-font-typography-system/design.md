# Typography design

## Architecture

Typography remains token-owned:

```text
src/main.tsx -> imports Fontsource variable-face CSS once
src/styles/tokens.css -> assigns semantic family roles
section CSS modules -> consume roles, never font URLs
```

## Selected role matrix

| Role | Family | Main consumers |
| --- | --- | --- |
| Reading/UI | Noto Sans SC Variable | body, navigation, controls, descriptions, metadata |
| Editorial display | Noto Serif SC Variable | Chinese Hero, section, Journey, and official-link titles |
| Japanese proper names | native Japanese Mincho first, Noto Serif SC fallback | Hero original name, album titles, Gallery work titles |
| Editorial numerals | Noto Serif SC Variable | Journey year and prominent chronology numerals |

Variable axes allow existing weights such as 550, 600, and 650 without shipping
separate static files.

## Tracking adjustments

The previous negative tracking was calibrated around platform Songti fonts.
Noto Serif SC has different proportions, so tracking is reduced:

- Hero title: `-0.065em` -> `-0.04em`;
- shared section heading: `-0.045em` -> `-0.025em`;
- Japanese work titles: remove negative tracking and let the Japanese role use
  its native proportions;
- Journey display titles are tightened less aggressively.

## Loading strategy

The root imports:

```ts
import '@fontsource-variable/noto-sans-sc/wght.css';
import '@fontsource-variable/noto-serif-sc/wght.css';
```

Fontsource supplies versioning, `font-display: swap`, variable ranges,
Unicode-range segmented WOFF2 files, and Vite URL rewriting. No preload list is
added because guessed CJK fragments can force unused downloads.

## Measured production-preview result

At the 1440x900 production preview after `document.fonts.ready`:

```text
loaded families: Noto Sans SC Variable + Noto Serif SC Variable
font requests: 40
font transfer: 2,387,612 bytes
font formats: WOFF2 only
font origins: application origin only
font origins: same application origin only
```

The regression budget is 3.5 MB / 60 requests.

## License distribution

The static application redistributes WOFF2 assets, so it includes:

```text
THIRD_PARTY_NOTICES.md
public/font-licenses/Noto-OFL-1.1.txt
```

The public license file is copied into production output by Vite.

## Rejected alternatives

- Klee One: strong Japanese character, but about 1.8 MB for each reviewed
  Japanese static weight.
- LXGW WenKai: attractive, but upstream Reserved Font Name/webfont-subsetting
  conditions add approval complexity for a custom delivery path.
- Remote font CSS: adds a cross-origin dependency and weakens target-network
  reliability.

