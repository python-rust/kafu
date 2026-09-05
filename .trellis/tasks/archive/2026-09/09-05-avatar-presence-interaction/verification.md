# Verification — 2026-09-05

## Local acceptance

- `mise run check`: passed; 15 Vitest files / 61 tests, formatting, Oxlint (zero warnings/errors), TypeScript and production build.
- `mise run e2e`: all 24 Playwright tests passed, including the three manifest-dialog regressions and existing Gallery/Journey/viewport behavior.
- `python3 scripts/verify_static_build.py dist`: passed; entry JS 364,771 bytes, entry CSS 42,695 bytes, 51 WebP files, zero WebFonts and no model authoring binaries.
- `python3 scripts/verify_cloudflare_workflow.py .github/workflows/deploy-cloudflare-pages.yml`: passed; manual/main-only, immutable Action pins and production R2 smoke checks preserved.
- `git diff --check`: passed.
- `mise run avatar-verify`: remote object verified again at 49,911,472 bytes and SHA-256 `5fe890c94a7af1e5df13a212203cf3d79a7d9d429aaac9750aee151e5918dae3`. No upload or binary edit was performed.

The first full check found an `exactOptionalPropertyTypes` error in the new optional-look-at test fixture. The fixture now omits the optional property rather than passing `undefined`; the complete gate was rerun successfully afterward.

## Real model and interaction

The optional `scripts/review_avatar_runtime.mjs` passed against the locked local model. It verified head direction, all four gaze directions, eye angle limits, secondary hair response, smile-eye morph bindings after optimization, dialog pause/resume and hidden-document pause with zero page errors. Screenshots were reviewed for lighting, curved-eye smile and arm composition.

The new and old light rigs each use 19 draw calls and 150,740 triangles in the same optimized scene. Current CPU submission median/p95 was about 0.9/1.2 ms. This SwiftShader measurement is not a physical-GPU FPS claim. Runtime optimization reduced stored vertices 96,372 → 49,742 and maximum morph targets 74 → 21 without changing the locked asset. The remaining large lazy VRM chunk warning is acknowledged: 746.57 kB raw / 187.26 kB gzip, outside the initial chunk. Dialog code is also separately lazy-loaded, 39.21 kB raw / 13.32 kB gzip.

## Scope and durable contracts

The asset lock, public URLs, character permission and model binary are unchanged. Normal section copy contains only heading/creator/permission/actions plus conditional operational feedback. Radix owns dialog mechanics; three-vrm owns bone mapping, gaze application, expressions and SpringBones. The new avatar SPEC and related component/content/visual/quality indexes reflect those boundaries. The original integration's deployment SPEC now includes the existing Function signature, projection fields, error matrix and regression obligations.

## Release gate

Work commit `fbe5605b007a5db2df1abee7c55a404dd77bac58` was deployed successfully by manual workflow run `33943689832`. Production root, manifest, HEAD, range and allow-list probes passed. A real production browser confirmed:

- expected entries `/assets/index-BYxEd-tF.js` and `/assets/index-CKetinkN.css`;
- no initial VRM request, then exactly one request through the locked same-origin URL after viewport activation;
- ready visible model, canonical metadata dialog, Escape close, restored trigger focus and unchanged document scroll position;
- no page errors.

The initial ad-hoc production probe sampled focus immediately after the dialog disappeared and failed before Radix's deferred autofocus callback. Installed Radix code confirmed the deferred callback. The probe now awaits the same focus assertion as the existing passing E2E test, and the entire production probe passed on rerun. No application change was needed; the timing contract is recorded in the avatar SPEC.

Both tasks have passed their acceptance gates and are ready for archive. The final archive/journal-only revision is redeployed through the same manual workflow; GitHub Actions records that run against the final head SHA.
