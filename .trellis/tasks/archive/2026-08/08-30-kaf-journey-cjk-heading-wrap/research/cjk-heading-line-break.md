# CJK heading line-break review

## Verified cause

The Journey article heading used `max-width: 15ch`. CSS `ch` represents the
advance width of the `0` glyph, not one Chinese ideograph. With the self-hosted
Noto Serif SC variable font, the resulting width held roughly eight Han
characters, so ten-character headings wrapped as eight plus two:

```text
在无法相聚时重构
舞台

把虚拟歌声带进武
道馆
```

Browser measurements confirmed the same constraint at 320, 390, 768, 1024,
and 1440px widths.

## Standards review

- MDN `text-wrap` documents `balance` as the appropriate native strategy for
  short headings and captions when wrapping is genuinely necessary:
  https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-wrap
- MDN `line-break` documents the CJK-specific line-breaking control and its
  widely available `strict` value:
  https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/line-break
- CSS Text Level 4 defines line breaking and wrapping behavior; no JavaScript
  text-balancing dependency is required:
  https://www.w3.org/TR/css-text-4/

## Selected correction

1. Remove the `ch`-based maximum width.
2. Let each heading use `width: 100%` of its actual content container.
3. Apply `line-break: strict` and `text-wrap: balance` as native progressive
   enhancement.
4. Reduce only the compact card's horizontal padding floor from 20px to 16px,
   giving the 320px viewport enough inline space for both ten-character titles
   without reducing the type size.

Post-change Chromium measurements show all six Journey article headings on one
line at 320, 360, 390, 768, 1024, and 1440px default-size viewports.
