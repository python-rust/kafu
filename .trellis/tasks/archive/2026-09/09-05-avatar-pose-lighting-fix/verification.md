# Verification — 2026-09-05

## Local acceptance

- `mise run check`: passed; 16 Vitest files / 63 tests, formatting, zero-warning Oxlint, TypeScript and production build.
- `mise run e2e`: all 24 Chromium tests passed, including model deferral/fallback, reduced motion, metadata dialog focus/scroll and existing page regressions.
- `python3 scripts/verify_static_build.py dist`: passed; entry JavaScript 364,771 bytes, CSS 42,695 bytes, 51 WebP assets / 3,609,330 bytes, zero WebFonts; no model source binaries.
- `python3 scripts/verify_cloudflare_workflow.py .github/workflows/deploy-cloudflare-pages.yml`: passed; manual/main-only workflow and immutable action pins unchanged.
- `git diff --check`: passed.

## Real locked model

`mise exec -- node scripts/review_avatar_runtime.mjs` passed. Eight complete model pose samples, skin/outline material values, unchanged expression binds, head/gaze directions, secondary hair motion, dialog pause/resume and hidden-document pause passed with zero page errors. The extra front/oblique comparison and visual review are recorded in `visual-review.md`; source images remain under ignored `.local-assets/`.

Both old and corrected presentations used 19 draw calls and 150,740 triangles. The software-rendered CPU submission median was about 0.9 ms for each; this is not a physical-device FPS guarantee. No new lights, render passes, dependency, model transfer or per-frame material work were introduced. The existing lazy VRM bundle size warning remains outside the initial page bundle.

## Scope review

The source model is already in an A-pose. Forearms/wrists now keep authored rest instead of the previous large independent bends. Hands and sleeve openings were reviewed uncropped and from oblique angles. Skin matcap is removed only for exact face/body MToon material names and generated outlines; texture/color identities, hair/eyes/cloth and the immutable VRM remain unchanged. Existing mouth and expression behavior is unchanged.

The avatar SPEC replaces the invalid bent-arm prescription and documents the material diagnosis, scoped adjustment, conservative pose and strengthened visual acceptance. Release uses the existing manual workflow; the live build and model/dialog checks must pass before reporting deployment complete.

## Production acceptance

Work commit `97fc3a8f0693b9bd36bd13ab4a81557f7cfe6e47` was deployed by successful manual workflow run `33945694706`. The production root/manifest/HEAD/range/allow-list verifier passed. The real production browser then verified the expected `/assets/index-BOnXxouK.js` and `/assets/index-CKetinkN.css`, deferred model activation, exactly one same-origin model request, a ready rendered model, the canonical metadata dialog, return focus and unchanged scroll position, with zero page errors.

Production screenshots are retained under ignored `.local-assets/avatar-review/production-stage.png` and `production-dialog.png`. The archive/journal-only revision uses the same tested application content and is published through the same manual workflow after task completion; its exact commit/run remains recorded by GitHub Actions.
