# 技术设计：R2 托管的花谱 VRM 网页角色

## 1. Architecture

```text
.local-assets/kaf-avatar/original/kaf_fukuro_hatdown.vrm
        │ local publish script / Wrangler OAuth
        ▼
Cloudflare R2: kafu-runtime-assets
  avatars/kaf/fukuro-hatdown/5fe890c94a7af1e5/kaf-fukuro-hatdown.vrm
        │ private R2 binding: KAF_AVATAR_ASSETS
        ▼
Cloudflare Pages Function
  /assets/models/kaf/v1/kaf-fukuro-hatdown-5fe890c94a7af1e5.vrm
        │ same-origin GET/HEAD
        ▼
KafAvatarSection
  poster → lazy runtime import → Three.js + @pixiv/three-vrm
```

The VRM binary is never a Git or Pages build input. Git owns the immutable asset lock, the proxy allow-list, the renderer, tests, and deployment procedure.

## 2. Asset lock contract

A small TypeScript module under `src/content/` is the single source of truth for:

- public same-origin path;
- private R2 object key;
- expected byte size;
- SHA-256;
- author/display credit;
- camera defaults and expression names needed by the current model.

The Pages Function imports this module and rejects every path other than the locked public filename. The frontend imports the public path and display metadata. A public JSON manifest and README entry expose the same URL, size, hash, author, and format so repository visitors can discover and download the model without cloning a large Git object. This removes route/key drift without introducing a general asset registry.

## 3. R2 and Pages configuration

- Bucket: `kafu-runtime-assets`
- Binding: `KAF_AVATAR_ASSETS`
- Object key: `avatars/kaf/fukuro-hatdown/5fe890c94a7af1e5/kaf-fukuro-hatdown.vrm`
- Public route: `/assets/models/kaf/v1/kaf-fukuro-hatdown-5fe890c94a7af1e5.vrm`
- Cache: `public, max-age=31536000, immutable`
- Content type: `model/gltf-binary`

`wrangler.toml` is the checked-in root Pages configuration and declares `pages_build_output_dir` plus the R2 binding. The existing GitHub Actions deployment continues using `wrangler pages deploy` from the repository root; Pages rejects a custom `--config` path, so the root filename/location is part of the contract. The workflow verifier requires the production proxy probe.

The R2 object is uploaded separately before a web release references it. Revisions use a new hash path; objects are never overwritten in place.

## 4. Function behavior

The Function supports only `GET` and `HEAD`:

- exact locked path → `R2Bucket.get/head`;
- unknown path → 404 without R2 lookup;
- missing locked object → 404;
- other method → 405 with `Allow: GET, HEAD`;
- GET streams the R2 body without buffering;
- HEAD returns metadata only;
- response includes content type, content length, ETag, immutable cache header, `X-Content-Type-Options: nosniff`, and same-origin resource policy.

No public R2 endpoint or CORS configuration is required because the browser and download clients use the Pages origin. The proxy is intentionally public: it provides no login, signed URL, referer restriction, or obscurity mechanism.

## 5. Homepage ownership and loading

`HomePage` inserts `KafAvatarSection` after `KafProfileSection` and adds a `#avatar` navigation item.

`KafAvatarSection` owns:

- section copy and composition;
- poster/fallback state;
- an explicit “加载动态形象” action when motion is reduced or automatic activation is unavailable;
- viewport activation through `IntersectionObserver` with a bounded root margin;
- lazy import boundary for `KafVrmStage` so Three.js and VRM code are not in the initial bundle.

`KafVrmStage` owns only the third-party renderer lifecycle.

## 6. VRM renderer behavior

The renderer uses:

- `WebGLRenderer` with alpha and antialiasing;
- `OrthographicCamera` for a stable bust composition;
- `GLTFLoader` + `VRMLoaderPlugin`;
- the model’s MToon materials and SpringBone implementation;
- a fixed lighting setup;
- programmatic idle motion on head/chest bones with small amplitudes;
- periodic blink through the model expression manager;
- low-amplitude gaze changes through the existing VRM look-at applier when available, not direct raw-eye writes;
- `vrm.update(delta)` every active frame.

The animation loop runs only when all are true:

- model loaded;
- section intersecting;
- document visible;
- reduced-motion not requested.

Reduced-motion renders a stable pose and does not start continuous idle animation. WebGL or model failures leave the poster and readable explanation in place.

## 7. Cleanup and StrictMode

On unmount or remount:

- cancel `requestAnimationFrame`;
- abort in-flight loader fetch where supported by the loader boundary;
- disconnect observers/listeners;
- dispose geometries, materials, textures, renderer, and render lists;
- remove canvas DOM state owned by the component;
- ignore late async completion through a disposed flag.

## 8. Poster generation

The embedded VRM meta thumbnail is extracted deterministically from the GLB bufferView and converted to a local WebP poster. This is a small shipping derivative and is recorded in `ATTRIBUTION.md`; the 49.9 MB VRM remains R2-only.

## 9. Validation

### Static and unit

- Function allow-list, GET/HEAD headers, 404, and 405 behavior with a fake R2 bucket.
- Asset lock consistency and expected hash/size.
- Section activation and reduced-motion fallback.
- Existing homepage order/navigation regressions.
- Build verifier rejects `.vrm` inside `dist`.

### Browser

- VRM route is not requested before activation.
- Section and poster are visible.
- After activation the same-origin proxy route is requested and the canvas becomes visible.
- Reduced-motion keeps the static fallback usable.

### Remote

- R2 upload followed by a streamed SHA-256 verification.
- GitHub Actions deployment succeeds.
- Production root and GET/HEAD model proxy return success.
- Production response content length matches the lock and content begins with the GLB magic.
- Playwright production smoke confirms visible canvas/fallback and no direct R2 host request.

## 10. Rollback

- Web rollback: revert the asset-lock/section commit and redeploy Pages.
- Model rollback: point the lock back to a previous immutable R2 object and redeploy.
- Binding rollback: remove the R2 binding and Function together; the static site remains functional.
- R2 objects are retained until no deployed revision references them.

## 11. Deferred work

- model size optimization;
- VRMA motions;
- TTS viseme mapping;
- AI command adapter;
- user-selectable model variants.
