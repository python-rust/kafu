# Implementation research record — KAF media/content pack

Research rechecked: 2026-08-25.

## Chronology evidence

Primary official sources used for the six journey chapters:

- KAF official history: https://kaf.kamitsubaki.jp/history/
  - 2018-10-18 activity launch and 2018-12-31 `Count-0` appearance.
  - 2019-08-01 1st ONE-MAN LIVE `不可解` and 2019-09-11 1st Album `観測α / 観測β`.
  - 2020-11-25 2nd Album `魔法α / 魔法β`, 2021-03-13 V.W.P formation, and 2021-06-11–12 `不可解弐REBUILDING`.
  - 2022-08-24 Nippon Budokan `不可解参(狂)` and 2023-03-08 3rd Album `狂想α / 狂想β`.
  - 2024-01-14 4th ONE-MAN LIVE `怪歌`.
- KAF official profile/about: https://kaf.kamitsubaki.jp/about/
  - Describes `怪歌` as an opening of KAF's second chapter.
- KAF 4th Album `寓話`: https://kaf.kamitsubaki.jp/discography/20241115/857/
  - Confirms 2024-12-25 release and the changed production structure.
- KAF81 announcement: https://kaf.kamitsubaki.jp/news/20251018/1113/
  - Confirms the 2025-10-18 KAF×avex overseas project and major-debut announcement.
- 5th ONE-MAN LIVE `宿声 / 深愛`: https://kaf.kamitsubaki.jp/schedule/20260301/1147/
  - Confirms the 2026-03-01 Pia Arena MM live.
- KAF official discography: https://kaf.kamitsubaki.jp/discography/
  - Confirms 5th Album `深愛` release on 2026-05-27.

Wave 1 main-agent review rechecked the missing fixed narrative nodes against current official pages:

- `不可解(再)`: https://kaf.kamitsubaki.jp/schedule/20200323/574/
  - Confirms the 2020-03-23 Zepp DiverCity performance was changed to a no-audience streamed live, with paid streaming platforms and a limited YouTube Live stream.
- `組曲`: https://kaf.kamitsubaki.jp/suite/ and https://kaf.kamitsubaki.jp/history/
  - Confirms the collaboration series continued through 2022–2023; the Expansion chapter uses the 2022-05-11 eighth entry, KAF × MIYAVI `Beyond META`, as a concrete cross-boundary collaboration milestone.
- `廻花`: https://kaf.kamitsubaki.jp/news/20240114/367/
  - Confirms the `廻花` virtual singer-songwriter project was announced/started at the 2024-01-14 `怪歌` live, alongside the fourth-album announcement.

All chapter summaries in `src/content/kaf.ts` are fan-authored synthesis rather than copied official promotional prose.

## Rights interpretation

- Piapro icon reference: https://piapro.jp/license/pc/icon
- Piapro FAQ: https://piapro.jp/faq/
- KAMITSUBAKI secondary-creation guidelines: https://kamitsubaki.jp/guidelines/

The shipping gate uses each **image work page** as the controlling per-resource evidence. General KAMITSUBAKI fan-creation guidance is not treated as blanket permission to copy official-site imagery.

Piapro's FAQ states that all works are non-commercial and that a work without the no-modification condition may be modified, subject to the platform's restrictions. The project still uses piapro's own generated display thumbnails without local crop, recolor, or recompression.

## Selected new image works

All six selected pages displayed a compatible non-commercial license at the implementation-time check:

1. `糸` — https://piapro.jp/t/e9Ho — 花譜 — non-commercial; no creator-name/no-modification/original-license icon.
2. `過去を喰らう` — https://piapro.jp/t/M1dg — 花譜 — non-commercial; no creator-name/no-modification/original-license icon.
3. `景色` — https://piapro.jp/t/1vdD — 花譜 — non-commercial; no creator-name/no-modification/original-license icon.
4. `チューイン・ディスコ` — https://piapro.jp/t/PC68 — 花譜 — non-commercial + creator-name credit; no no-modification/original-license icon.
5. `ユーフォーを見にいこう` (image work) — https://piapro.jp/t/RpJG — 花譜 — non-commercial + creator-name credit; no no-modification/original-license icon on this image work page.
6. `花譜ちゃん` — https://piapro.jp/t/3Llh — とり — non-commercial + creator-name credit; no no-modification/original-license icon.

The existing `邂逅`, `忘れてしまえ`, and `不可解` image pages were also rechecked on 2026-08-25. Current search/page evidence continued to show the non-commercial condition and no additional creator-name, no-modification, or original-license condition for those image works.

## Rejected / not selected candidates

- https://piapro.jp/t/WSoo — explicitly states that no license is attached; separate creator permission would be required. Rejected.
- https://piapro.jp/t/qPE1 — displayed an original-license condition in planning research. Not selected because the chosen set met the media target without adding an extra bespoke-license review surface.
- https://piapro.jp/t/Qq5E — license conditions were not surfaced consistently enough during implementation-time retrieval to support a conservative acquisition decision. Rejected rather than inferred.
- Official special-site key visuals, campaign wallpapers, album covers, logos, screenshots, and social reposts were excluded because public availability is not a per-asset reuse grant.
- Additional compatible piapro candidates were not added after the repository reached nine distinct visuals / six new acquisitions; increasing the count further would add provenance and future recheck cost without an acceptance-criteria benefit.

## SPEC sync decision

No shared `.trellis/spec/**` file was modified. The existing frontend specs already define the durable project conventions established here: typed static content under `src/content`, local third-party media under `src/assets`, per-resource rights verification, synchronized provenance, and `mise run check` as the quality gate. The more detailed KAF-specific fields (source/local dimensions, SHA-256, derivative notes, exact credits) remain task/asset provenance rather than a new cross-project implementation convention. This also preserves the child task's explicit file-ownership boundary.
