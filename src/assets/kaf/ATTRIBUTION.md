# KAF visual asset provenance

This repository is an **unofficial, non-commercial fan project**. Nine local images in this directory are tied to individual piapro work pages whose current license conditions were checked again on **2026-08-25**. The separately documented `狂想β` album cover is sourced from the official KAF discography page and is included only for non-commercial fan-site identification under the KAMITSUBAKI secondary-creation guidelines. Public availability alone is not treated as permission to copy unrelated assets.

License references:

- piapro license-icon meanings: https://piapro.jp/license/pc/icon
- piapro FAQ on license conditions and modification: https://piapro.jp/faq/
- KAMITSUBAKI secondary-creation guidelines: https://kamitsubaki.jp/guidelines/

Piapro states that its work-specific icons control use: the non-commercial icon limits use to non-commercial purposes, the creator-name icon requires attribution, and the no-modification icon prohibits modification. The FAQ states that a work without the no-modification condition may be modified, subject to the platform's restrictions. None of the nine piapro image work pages below displayed an original-license condition at the 2026-08-25 check.

The original local files use piapro's published display thumbnails and remain unchanged as provenance inputs. The public work pages report larger source dimensions, but original downloads require a piapro account; this repository does not bypass that access boundary or substitute unverified reposts.

## Responsive display derivatives

On **2026-08-30**, the nine verified piapro preview inputs were converted into responsive display derivatives under `src/assets/kaf/generated/`. The delivery ladder was re-encoded on **2026-09-03** to reduce first-visit transfer:

- tool: official `waifu2x-ncnn-vulkan` portable macOS release `20250915`;
- model: `models-cunet`;
- processing: 4× scale with noise level `-1` (no denoise), preserving the verified preview as closely as the selected model permits;
- outputs: longest-edge 480/960/1280/1920/2560 WebP candidates downsampled from the verified 4× master;
- WebP quality: 78 for thumbnails and 82 for larger candidates;
- reproducibility: `scripts/generate_kaf_media_variants.py` verifies every source SHA-256 before generation;
- derivative dimensions, byte sizes, and SHA-256 values: `src/assets/kaf/generated/manifest.json`.

The official 1600×1600 `狂想β` cover is not AI-upscaled. Its responsive files are source-native technical derivatives only: 480/960/1200/1440/1600 WebP candidates and a 32px inline placeholder. No creative alteration is applied.

These derivatives improve display density and reduce browser enlargement. They do **not** restore the inaccessible original pixels and must not be represented as source originals. The source preview files listed below remain the authoritative local provenance inputs.

## `hero-kaihou.jpg`

- Work: `邂逅`
- Source page: https://piapro.jp/t/N-95
- Direct asset URL: https://cdn.piapro.jp/thumb_i/c4/c4yijyktluire9br_20230711163237_0860_0600.jpg
- Publisher / rights-granting piapro account: 花譜 (`virtual_kaf`)
- License / permission observed: non-commercial use only
- Original-license condition: none displayed
- Modification allowed: yes; no no-modification icon displayed
- Required credit: none required by the creator-name icon; the bottom source index renders `花譜 / piapro`
- Source dimensions: 1920×1080
- Local dimensions: 860×484
- Display derivatives: `generated/kaihou-{thumb,medium,display,large,high}.webp`; see generated manifest for dimensions and hashes
- Retrieval date: 2026-08-24; license rechecked 2026-08-25
- SHA-256: `850e38af66e1f28a9ad00677d53568ea9fa52ff5a12e8317b84207e609acd516`

## `visual-wasurete-shimae.jpg`

- Work: `忘れてしまえ`
- Source page: https://piapro.jp/t/_tAG
- Direct asset URL: https://cdn.piapro.jp/thumb_i/uf/uf9a8v5e19pn23ia_20191030191300_0860_0600.jpg
- Publisher / rights-granting piapro account: 花譜 (`virtual_kaf`)
- Credited on source page: character design PALOW; 3DCG design 川サキケンジ
- License / permission observed: non-commercial use only
- Original-license condition: none displayed
- Modification allowed: yes; no no-modification icon displayed
- Required credit: none required by the creator-name icon; project voluntarily credits `Character design: PALOW. · 3DCG: 川サキケンジ · via 花譜 / piapro`
- Source dimensions: 1280×720
- Local dimensions: 860×484
- Display derivatives: `generated/wasurete-shimae-{thumb,medium,display,large,high}.webp`; see generated manifest for dimensions and hashes
- Retrieval date: 2026-08-24; license rechecked 2026-08-25
- SHA-256: `cf39ce8eefbc57ef9652bd434d1a250454b26bffa3fb960e2f2cfbb6ef01d7d8`

## `visual-fukakai.jpg`

- Work: `不可解`
- Source page: https://piapro.jp/t/ZGwt
- Direct asset URL: https://cdn.piapro.jp/thumb_i/j2/j2rpec69ek7es5zk_20191030190841_0860_0600.jpg
- Publisher / rights-granting piapro account: 花譜 (`virtual_kaf`)
- Credited on source page: character design PALOW; 3DCG design 川サキケンジ
- License / permission observed: non-commercial use only
- Original-license condition: none displayed
- Modification allowed: yes; no no-modification icon displayed
- Required credit: none required by the creator-name icon; project voluntarily credits `Character design: PALOW. · 3DCG: 川サキケンジ · via 花譜 / piapro`
- Source dimensions: 1280×720
- Local dimensions: 860×484
- Display derivatives: `generated/fukakai-{thumb,medium,display,large,high}.webp`; see generated manifest for dimensions and hashes
- Retrieval date: 2026-08-24; license rechecked 2026-08-25
- SHA-256: `caef91a45a66d9c9a5e720446d2a81c030b9b45973e77588cca60d72beeb531a`

## `journey/2018-origin-ito.jpg`

- Work: `糸`
- Source page: https://piapro.jp/t/e9Ho
- Direct asset URL: https://cdn.piapro.jp/thumb_i/wk/wke4xlhvfydnnvid_20191030191544_0860_0600.jpg
- Publisher / rights-granting piapro account: 花譜 (`virtual_kaf`)
- Credited on source page: character design PALOW; 3DCG design 川サキケンジ
- License / permission observed: non-commercial use only
- Original-license condition: none displayed
- Modification allowed: yes; no no-modification icon displayed
- Required credit: none required by the creator-name icon; project voluntarily credits `Character design: PALOW · 3DCG design: 川サキケンジ · via 花譜 / piapro`
- Source dimensions: 1280×720
- Local dimensions: 860×484
- Display derivatives: `generated/origin-ito-{thumb,medium,display,large,high}.webp`; see generated manifest for dimensions and hashes
- Retrieval date: 2026-08-25
- SHA-256: `0d2a25eae4996247ee4272ef8e29ee7ef206348d496dd2b5faf0a95c7071c44c`

## `journey/2019-observation-past.jpg`

- Work: `過去を喰らう`
- Source page: https://piapro.jp/t/M1dg
- Direct asset URL: https://cdn.piapro.jp/thumb_i/rh/rh3mcwiuc81bimfm_20191030190256_0860_0600.jpg
- Publisher / rights-granting piapro account: 花譜 (`virtual_kaf`)
- Credited on source page: character design PALOW; 3DCG design 川サキケンジ
- License / permission observed: non-commercial use only
- Original-license condition: none displayed
- Modification allowed: yes; no no-modification icon displayed
- Required credit: none required by the creator-name icon; project voluntarily credits `Character design: PALOW · 3DCG design: 川サキケンジ · via 花譜 / piapro`
- Source dimensions: 1920×1080
- Local dimensions: 860×484
- Display derivatives: `generated/observation-past-{thumb,medium,display,large,high}.webp`; see generated manifest for dimensions and hashes
- Retrieval date: 2026-08-25
- SHA-256: `a445f01b893a93e38c7c977c00997763b160ebc0bea30fd12907916b12c6f523`

## `journey/2020-magic-keshiki.jpg`

- Work: `景色`
- Source page: https://piapro.jp/t/1vdD
- Direct asset URL: https://cdn.piapro.jp/thumb_i/h5/h5ul69nyfrgmg2hl_20201204185812_0860_0600.jpg
- Publisher / rights-granting piapro account: 花譜 (`virtual_kaf`)
- License / permission observed: non-commercial use only
- Original-license condition: none displayed
- Modification allowed: yes; no no-modification icon displayed
- Required credit: none required by the creator-name icon; the bottom source index renders `花譜 / piapro`
- Source dimensions: 1280×720
- Local dimensions: 860×484
- Display derivatives: `generated/magic-keshiki-{thumb,medium,display,large,high}.webp`; see generated manifest for dimensions and hashes
- Retrieval date: 2026-08-25
- SHA-256: `5fab05560238bf1ff0e1a0bcf4fa01c21ab855086fc8004ac81c5999208d0169`

## `journey/2024-fable-chewing-disco.png`

- Work: `チューイン・ディスコ`
- Source page: https://piapro.jp/t/PC68
- Direct asset URL: https://cdn.piapro.jp/thumb_i/4z/4zk5jy0rybw7d89d_20240822154843_0860_0600.png
- Publisher / rights-granting piapro account: 花譜 (`virtual_kaf`)
- License / permission observed: non-commercial use only + creator-name credit required
- Original-license condition: none displayed
- Modification allowed: yes; no no-modification icon displayed
- Required credit: `花譜`; project renders `花譜 / piapro`
- Source dimensions: 1920×1080
- Local dimensions: 860×484
- Display derivatives: `generated/fable-chewing-disco-{thumb,medium,display,large,high}.webp`; see generated manifest for dimensions and hashes
- Retrieval date: 2026-08-25
- SHA-256: `42dd8bf80d83f2bc306f31c778d5ddbed9f5aac66779edb24daef0d4cb4c4850`

## `journey/2025-transcendent-ufo.png`

- Work: `ユーフォーを見にいこう`
- Source page: https://piapro.jp/t/RpJG
- Direct asset URL: https://cdn.piapro.jp/thumb_i/qa/qa9nsctsyump9uh5_20260304123046_0860_0600.png
- Publisher / rights-granting piapro account: 花譜 (`virtual_kaf`)
- License / permission observed: non-commercial use only + creator-name credit required
- Original-license condition: none displayed
- Modification allowed: yes; no no-modification icon displayed on this **image work page**
- Required credit: `花譜`; project renders `花譜 / piapro`
- Source dimensions: 3000×3000
- Local dimensions: 600×600
- Display derivatives: `generated/transcendent-ufo-{thumb,medium,display,large,high}.webp`; see generated manifest for dimensions and hashes
- Retrieval date: 2026-08-25
- SHA-256: `72448105038392b96d68ec713cd93d758b29ee52019268daa6262d750ed38a55`

## `gallery/kaf-tori-portrait.jpg`

- Work: `花譜ちゃん`
- Source page: https://piapro.jp/t/3Llh
- Direct asset URL: https://cdn.piapro.jp/thumb_i/mo/mo0hgibq19iz7fh6_20250207181846_0860_0600.jpg
- Artwork creator / rights-granting piapro account: とり
- Underlying character: 花譜; KAMITSUBAKI's secondary-creation guidelines remain applicable to the fan-project context
- License / permission observed: non-commercial use only + creator-name credit required
- Original-license condition: none displayed
- Modification allowed: yes; no no-modification icon displayed
- Required credit: `とり`; project renders `とり / piapro`
- Source dimensions: 2122×2976
- Local dimensions: 428×600
- Display derivatives: `generated/tori-portrait-{thumb,medium,display,large,high}.webp`; see generated manifest for dimensions and hashes
- Retrieval date: 2026-08-25
- SHA-256: `0638aa003a71475dde64a6cbc7c724343aeb3eff17c2272fdea41302c549d116`

## `works/2023-kyousou-beta.png`

- Work: third album `狂想β`
- Official discography page: https://kaf.kamitsubaki.jp/discography/20230308/199/
- Direct official image URL: https://kaf.kamitsubaki.jp/wp/wp-content/uploads/2024/03/kaf-Crazy_for_you_beta.png
- Publisher: 花譜 / KAMITSUBAKI STUDIO
- Jacket illustration credit stated by the official page: PALOW.
- Usage basis: individual, unofficial, non-commercial fan project under the KAMITSUBAKI secondary-creation guidelines
- Distribution boundary: no advertising, monetization, merchandise, download feature, or claim of official affiliation
- Modification boundary: technical format conversion and responsive resizing only; no creative alteration
- Local dimensions: 1600×1600
- Responsive derivatives: `generated/kyousou-beta-{thumb,medium,display,large,high}.webp`; see generated manifest for dimensions and hashes
- Retrieval and guideline review date: 2026-08-30
- SHA-256: `161fe38755a496e70a703a60848b385184bcca293685a781ee63d2372fd094f1`

## Usage boundary

- Keep the site explicitly unofficial and non-commercial while these images ship.
- Keep required creator names visible in the page-bottom source line and retain the per-work source/license entries in the adjacent `图片来源` disclosure.
- Re-check the exact work page before materially changing distribution context or creating a new derivative.
- Remove the corresponding local file and content reference if its source terms become incompatible.
- The `狂想β` entry is a narrow reviewed exception requested for this non-commercial album listing. Do not treat it as blanket permission for other KAF/KAMITSUBAKI official images, campaign materials, album covers, social-media reposts, logos, screenshots, or wallpapers.

## `avatar/kaf-fukuro-hatdown` VRM model

- Work: fan-made KAF VRM model, internal title `kaf_fukuro_1`
- Model creator / embedded author metadata: `mme`
- Source input: `kaf_fukuro_hatdown.vrm`, supplied to the project owner outside the Git repository
- Permission evidence: on 2026-09-05 the project owner confirmed that the model creator directly authorized use of this VRM on the current website; private conversation evidence is retained outside the public repository
- Website usage: public rendering and download through the site's versioned Pages Function URL
- Distribution architecture: the 49,911,472-byte VRM is stored in Cloudflare R2 and is not committed to Git or the Pages static artifact
- Public model URL: https://kafu-8bd.pages.dev/assets/models/kaf/v1/kaf-fukuro-hatdown-5fe890c94a7af1e5.vrm
- Public manifest URL: https://kafu-8bd.pages.dev/assets/models/kaf/manifest.json
- SHA-256: `5fe890c94a7af1e5df13a212203cf3d79a7d9d429aaac9750aee151e5918dae3`
- Model format: VRM 0.x / binary glTF
- Embedded usage metadata: creator `mme`; commercial use disallowed; redistribution prohibited by the embedded default metadata. The creator's direct website-specific permission is the basis for this deployment and does not grant downstream users an additional license
- Required public credit used by the site: `模型制作：mme`
- Retrieval / permission confirmation date: 2026-09-05

### Static poster derivative

- Local path: `avatar/poster/kaf-fukuro-hatdown.webp`
- Source: the VRM's embedded metadata thumbnail `kaf_chara_zhaimao.png`
- Generation: `python3 scripts/kaf-avatar/extract_vrm_poster.py`
- Processing: deterministic upper-body crop and Lanczos resize to 960×1200 WebP, quality 86
- Byte size: 88,532
- SHA-256: `3af7e7efaffb36242f219dec4dd83f7460244307941861661294b8eef2dca580`
- Purpose: model-loading, reduced-motion, WebGL-unavailable, and error fallback

The public download exists so visitors and repository users can reproduce the
model version rendered by the site. It must not be described as an MIT-licensed
or otherwise open-licensed model merely because the transport URL is public.
The model creator's permission and KAMITSUBAKI's secondary-creation boundary
continue to apply independently from this repository's source-code license.
