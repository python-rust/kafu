# Fix Journey Chinese heading line breaks

## Goal

Remove Latin ch-based width constraints from Journey Chinese headings, use full container width with balanced fallback wrapping, and add browser regressions for the long 2020–2023 titles.

## Requirements

- Remove the `15ch` width cap from Journey article headings. The `ch` unit is
  based on the advance width of the `0` glyph and is not a reliable measure of
  Simplified Chinese ideograph capacity.
- Allow both in-flow Journey headings and sticky-stage headings to consume the
  full inline width of their owning container.
- Use native CJK line-breaking rules and `text-wrap: balance` only as a fallback
  when a title genuinely cannot fit on one line.
- Preserve the existing type scale. On the narrowest supported phones, recover
  the small amount of missing width by reducing compact card horizontal padding,
  not by shrinking the heading text or forcing `nowrap` overflow.
- Add browser regression coverage for `在无法相聚时重构舞台` and
  `把虚拟歌声带进武道馆` across the supported viewport matrix.
- Keep Journey scrolling, media, content, dependencies, and reduced-motion
  behavior unchanged.

## Acceptance Criteria

- [x] Both reported Journey titles render on one line from 320px through the
      desktop reference viewport at the default root size.
- [x] Sticky-stage titles use the full stage width and do not produce isolated
      `舞台` or `道馆` fragments.
- [x] At constrained user text sizes, wrapping remains allowed and balanced
      rather than overflowing the container.
- [x] No content string, dependency, image, or scroll interaction changes.
- [x] Vitest and Chromium Playwright suites pass.

## Notes

- This is a lightweight typography correction; no separate design document is
  required.
