# 实施计划：R2 托管的花谱 VRM 网页角色

## 1. Infrastructure and asset baseline

- [x] Verify local VRM path, size, SHA-256, GLB magic, and embedded thumbnail.
- [x] Create `kafu-runtime-assets` if absent.
- [x] Upload the locked immutable object with `model/gltf-binary` metadata.
- [x] Stream the remote object back through Wrangler and verify byte size/SHA-256.
- [x] Extract and generate the local poster without modifying the VRM.

## 2. Checked-in asset contract and proxy

- [x] Add the typed avatar asset lock under `src/content/` and a public machine-readable manifest.
- [x] Add `wrangler.toml` with Pages build output and `KAF_AVATAR_ASSETS` binding.
- [x] Implement exact-path GET/HEAD Pages Function proxy.
- [x] Add unit tests for allow-list, methods, metadata, cache, missing object, and body streaming.
- [x] Add repository/build guards preventing VRM/Blend binaries from entering Git or `dist`.

## 3. Web renderer and page integration

- [x] Add pinned `three` and `@pixiv/three-vrm` dependencies and required types.
- [x] Add `KafAvatarSection` after profile and before journey; add navigation anchor.
- [x] Lazy-load `KafVrmStage` only after viewport activation.
- [x] Implement orthographic bust rendering, fixed MToon lighting, SpringBone update, idle, blink, and gaze.
- [x] Implement poster, loading, failure, WebGL unavailable, reduced-motion, background-tab, offscreen pause, resize, and cleanup behavior.
- [x] Add accessible copy, model-author credit, README download entry, and public model manifest without exposing private authorization evidence.

## 4. Tests and local validation

- [x] Update component/unit tests for homepage order, navigation, activation, and fallback.
- [x] Add Playwright coverage proving the model is not requested before activation and the canvas/fallback is usable after activation.
- [x] Run `mise run check`.
- [x] Run `mise run e2e`.
- [x] Run `python3 scripts/verify_static_build.py dist` and verify no `.vrm` ships in Pages output.

## 5. Deployment automation and production validation

- [x] Update the deployment workflow/verifier for checked-in Wrangler config and production model proxy validation.
- [ ] Confirm the existing GitHub Cloudflare token can deploy the binding; only request a token replacement if a real permission failure occurs.
- [ ] Commit and push the implementation.
- [ ] Trigger the manual Pages workflow and wait for success.
- [ ] Verify production root, GET, HEAD, content type/length/cache, GLB magic, and visible browser rendering.

## 6. Specs, final review, and archive

- [x] Update deployment/media/directory/quality specs with the actual R2 publication, binding, verification, rollback, provenance, and large-binary rules.
- [x] Run the final Trellis quality review and inspect the complete diff.
- [ ] Commit any spec/final fixes and ensure the working tree is clean.
- [ ] Archive the task with completion evidence.

## Validation commands

```bash
mise run check
mise run e2e
python3 scripts/verify_static_build.py dist
python3 scripts/verify_cloudflare_workflow.py .github/workflows/deploy-cloudflare-pages.yml
mise run avatar-verify
curl -I https://kafu-8bd.pages.dev/assets/models/kaf/v1/kaf-fukuro-hatdown-5fe890c94a7af1e5.vrm
curl --fail --silent --range 0-3 https://kafu-8bd.pages.dev/assets/models/kaf/v1/kaf-fukuro-hatdown-5fe890c94a7af1e5.vrm
```

## Risk and rollback points

- R2 upload is additive and uses an immutable key; safe to retry.
- `wrangler.toml` binding changes may expose token permission gaps; retain the current successful Pages deployment until the new workflow passes.
- Three.js/VRM code stays behind a lazy boundary; removing the section restores the prior static site.
- The large VRM never enters Git or Pages artifacts.


## Evidence before production release

- R2 object verified byte-identical at `49,911,472` bytes and SHA-256
  `5fe890c94a7af1e5df13a212203cf3d79a7d9d429aaac9750aee151e5918dae3`.
- Fresh preview deployment: `https://vrm-final-check.kafu-8bd.pages.dev`.
- Preview manifest/HEAD/range/allow-list smoke passed.
- Browser preview confirmed no VRM request before scrolling, exactly one
  same-origin model request after activation, `data-status=ready`, canvas
  opacity `1`, poster opacity `0`, no direct R2 request, and no request/page
  failures.
- `mise run check`: 13 Vitest files / 51 tests; lint/type/build green.
- `mise run e2e`: 21 Playwright tests green.
- Pages Function bundle compiled successfully.
- The only build warning is the lazy `KafVrmStage` chunk size (743.76 kB,
  186.15 kB gzip); it is outside the initial page chunk and model/runtime
  optimization remains deferred by scope.
