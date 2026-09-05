# Execution plan

## Latest user clarification

Eye movement is explicitly permitted. Do not preserve the earlier "eyeballs must not move" constraint in implementation, tests, or SPEC. Select subtle gaze behavior together with head/body motion and expressions, using the existing three-vrm look-at runtime; natural overall presence is the acceptance goal, not a particular eye trajectory. `prd.md` and `design.md` reflect this clarification.

## Steps

- [x] Inspect current stage, content, specs, model capabilities and official libraries.
- [x] Define scope, acceptance, dependency choice and rollback before activation.
- [x] Compare original/current light rigs on the real model, including appearance, draw calls and frame cost (same optimized scene, not a whole-build benchmark).
- [x] Add pinned/lazy Radix manifest dialog and simplify section copy.
- [x] Implement tested section-local motion driver, overhead lighting and lifecycle integration.
- [x] Complete the permitted eye response using the official degree setters; remove obsolete fixed-eye assertions and test bounds, direction, damping, reset and missing-look-at fallback.
- [x] Review real-model smile variants, pointer directions, hair response, arm silhouette and shading; tune conservatively.
- [x] Run focused unit/browser checks, then `mise run check` and `mise run e2e`.
- [x] Review diff for license/data drift, performance, accessibility, cleanup and scope.
- [x] Update executable frontend SPEC and validation evidence.
- [ ] Commit and push the reviewed work for production acceptance before archive.
- [ ] Dispatch `deploy-cloudflare-pages.yml` on main; verify exact deployed revision, root/assets/manifest/HEAD/range and live dialog.
- [ ] Reconcile the older VRM/R2 task against its merged implementation and production evidence; update its durable SPEC contracts, then archive it after all shared gates pass.
- [ ] Archive the current task, record the journal, push and redeploy the final bookkeeping revision without changing the verified application.

Validation failures return to the owning implementation step. Do not archive on a failing gate. Use `mise` for every Node/pnpm command. Preserve unrelated files. The latest user request explicitly adds verification/SPEC/archive of the older integration task; do not republish the unchanged model or redo proven infrastructure work.
