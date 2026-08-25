# Media rights and acquisition research

## Research objective

Define the gate for downloading additional KAF imagery into the repository without treating public availability or general fan-creation guidance as blanket asset permission.

Research date: 2026-08-25.

## Primary sources

### KAMITSUBAKI secondary-creation guidelines

- Source: https://kamitsubaki.jp/guidelines/
- The guidelines permit secondary creation within stated conditions and require unofficial work not to be mistaken for official material.
- They explicitly distinguish secondary creation from simply reusing official material or another creator's work.
- The guidelines can change; the relevant source must be rechecked when distribution context changes.

### Piapro per-work license conditions

- Source: https://piapro.jp/license/pc/icon
- Every downloaded work must follow its own displayed conditions.
- Icons can require non-commercial use only, prohibit modification, require creator attribution, or point to an additional original license.
- A public Piapro page is not enough; the exact work page and all icons/original-license text must be checked.

### Piapro usage introduction

- Source: https://piapro.jp/intro/
- Works with compatible displayed terms may be used under those terms; works without a compatible license require separate permission.

## Acquisition gate

For each candidate image:

1. Open the original work page, not only a search result or image URL.
2. Identify the publishing account and named creator/rightsholder.
3. Record every displayed license icon.
4. Read any original-license text in full.
5. Confirm non-commercial website use is compatible.
6. Determine whether resizing, compression, responsive derivatives, cropping, or recoloring are permitted.
7. Record the required credit string.
8. Download only after steps 1–7 pass.
9. Add the file and provenance entry in the same commit.

When any element is unclear, exclude the asset.

## Candidate discovery list — not pre-approved

These pages were identified during planning as possible sources. The media subagent must independently reopen and verify each page before acquisition:

- https://piapro.jp/t/tP6O
- https://piapro.jp/t/Qq5E
- https://piapro.jp/t/qPE1
- https://piapro.jp/t/VdzA
- https://piapro.jp/t/O1BV
- https://piapro.jp/t/M1dg
- https://piapro.jp/t/nle8
- https://piapro.jp/t/PC68
- https://piapro.jp/t/3Llh
- https://piapro.jp/t/uWCF
- https://piapro.jp/t/bLjk

Some candidates display attribution, no-modification, or original-license conditions. They are deliberately listed as research leads, not as approved shipping assets.

## Explicit exclusions

- Do not download key visuals directly from official special sites solely because they are visible in the browser.
- Do not reuse campaign wallpapers or downloadable bonuses without compatible terms for repository distribution.
- Do not use screenshots, copied logos, social-media reposts, or album covers when the reuse basis is unclear.
- Do not use generative-AI character artwork for this iteration.

## Provenance schema

Every `ATTRIBUTION.md` entry must include:

- local filename;
- original work page URL;
- creator/rightsholder or publishing account;
- license/permission condition;
- original-license text or link when present;
- required credit;
- whether modification is allowed;
- retrieval date;
- notes about generated derivatives, if any.
