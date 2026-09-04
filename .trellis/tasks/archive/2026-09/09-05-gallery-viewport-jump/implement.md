# Implementation Plan

## 1. Confirm the Regression

- Update the existing Gallery thumbnail viewport test so the rail is centered,
  matching the failing production geometry.
- Use a real pointer coordinate rather than locator auto-scroll.
- Wait beyond the 420ms Motion exit duration and confirm the test fails on the
  current production-equivalent code.

## 2. Apply the Narrow Fix

- Add `overflow-anchor: none` to the Gallery's decorative `.backdrop` owner.
- Do not change selection state, focus semantics, Motion timing, global scroll
  behavior, or the lightbox dependency.

## 3. Strengthen Coverage

- Verify a nearby short-title thumbnail selection remains at the same
  `window.scrollY`.
- Horizontally move the rail and verify a distant long-title selection also
  remains stable.
- Preserve the existing lightbox navigation/focus restoration regression.

## 4. Validate and Review

- Run the targeted Gallery E2E tests.
- Run `mise run check`.
- Run `mise run e2e`.
- Review the final diff for scope discipline, debug artifacts, and accidental
  Gallery/lightbox behavior changes.

## 5. Capture the Contract

- Update `.trellis/spec/frontend/media-guidelines.md` with the decorative
  backdrop anchor-exclusion rule and centered-rail regression geometry.
- Re-run affected checks after the spec update.

## 6. Deliver

- Commit the implementation and task artifacts.
- Push `main`.
- Dispatch and monitor `.github/workflows/deploy-cloudflare-pages.yml`.
- Run a production Chromium smoke test against the deployed commit.
- Archive the Trellis task and record the session journal according to the
  project workflow.

## Rollback Point

The work is one CSS behavior contract plus tests/spec. Before deployment, revert
the task commit if either the full E2E suite or production-equivalent smoke test
shows any Gallery regression.
