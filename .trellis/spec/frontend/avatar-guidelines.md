# Avatar Presentation and Interaction

> Read before changing avatar lighting, normalized poses, expressions, pointer
> response, WebGL lifecycle, or the model-information dialog.

## Owners and boundaries

| Owner | Responsibility |
| --- | --- |
| `KafAvatarSection.tsx` | Poster, viewport/manual activation, loading/failure feedback, dialog state |
| `KafVrmStage.tsx` | Lazy Three.js/VRM loading, camera/light rig, pointer events, render/cleanup lifecycle |
| `kafAvatarMotion.ts` | Section-specific bounded normalized poses and available-expression scheduling |
| `kafAvatarMaterials.ts` | Idempotent, asset-scoped skin matcap/toon correction at load time |
| `KafAvatarManifestDialog.tsx` | Lazy Radix Dialog adapter and canonical model metadata |
| `kafAvatar.json` / `.ts` | Immutable asset identity and public-manifest projection |

Three.js/three-vrm own rendering, normalized-to-raw bone mapping, expressions and
SpringBone integration. Radix owns modal mechanics. Do not add a physics engine,
IK framework, animation runtime, general avatar framework or custom focus trap.
See [Media](./media-guidelines.md) for the unchanged model/poster/R2 contract.

During the one-time load, reuse the official `removeUnnecessaryVertices` and
`combineSkeletons` utilities. Create the motion driver (which registers the
authored smile-eye target) before calling `combineMorphs(vrm)`. Combining morphs
first would remove the otherwise-unbound `Blink_Smile` target. These operations
only optimize the loaded scene; never export or re-upload a modified VRM.

## Lighting and composition

- Preserve the fixed front orthographic bust camera and 4:5 stage. No orbit,
  wheel zoom, drag camera or whole-model rotation.
- Use the original MToon materials. The current rig has one low-energy
  hemisphere fill and one warm overhead/front-overhead directional key.
- Position the key relative to actual head/hips coordinates. A directional
  light points from its position toward its target; rotating the light object
  is not a substitute.
- Current reference intensities are hemisphere `0.65` and key `1.6`; key offset
  is `(-0.55, 1.8, -0.9) * torsoHeight` from a target slightly below the head.
  The fill uses warm sky `0xfff4ee` and muted ground `0x778091`.
- Do not restore a strong omnidirectional wash or two bright frontal lights.
  Do not compensate with emission, Bloom, full-scene shadows or postprocessing.
- Review the real locked model when changing these values; material names and
  model dimensions are not interchangeable with a generic sample avatar.

### Skin hotspot correction

The locked VRM0 face/body use `_SphereAdd` (`skin.exr`), imported as a unit-strength
camera-space matcap. With the authored rim-light mix of zero, it contributes
even when scene lights are off. Moving/dimming a directional light cannot remove
that additive nose/neck hotspot. Diagnose diffuse, matcap and emission separately.

`applyKafSkinLighting(materials: readonly Material[]): void` runs once after load.
It accepts only `MToonMaterial` instances named `kaf_face`, `kaf_body`, or their
exact ` (Outline)` variants. Set `matcapFactor` to zero, `shadingToonyFactor` to
`0.6`, and `shadingShiftFactor` to `-0.1`. These public uniform properties remove
the skin glare and soften its shading transition without replacing shaders/maps
or darkening every material. Repeated calls must not accumulate changes or mark
the material for shader recompilation. Missing/unrelated materials are skipped.
Preserve eye, hair and clothing material parameters, diffuse/shade colors, texture
identity, geometry, and the immutable asset. Do not export the adjusted scene.

## Motion contract

```ts
const motion = createKafAvatarMotion(vrm, random);
motion.setPointer(x, y); // normalized/clamped [-1, 1], non-finite -> 0
motion.releasePointer();
motion.update(delta);    // finite delta clamped to [0, 0.05]
vrm.update(delta);       // one runtime update after posing; advances SpringBone
motion.reset();          // restore owned rest poses, relaxed arms, zero expressions
```

- Preserve each normalized bone's original quaternion and compose an absolute
  rest-relative rotation on each frame. Never multiply onto the previous frame.
- Reuse scratch Euler/quaternion/vector objects. Do not send per-frame values
  through React state.
- Pointer response is limited to the projected head region. Use the fixed
  camera projection instead of raycasting the full skinned mesh per event.
- Head/neck respond through `MathUtils.damp`; chest/spine follow more slowly.
  Clamp excursions and relax on pointer leave/cancel and activity pause.
- Touch remains native page scrolling; do not capture the pointer or prevent
  default touch/wheel behavior. Missing optional bones are skipped.
- This model is authored in an A-pose, not a T-pose. Its loose sleeve chains
  follow upper arms independently of elbow bends. Keep forearms and wrists at
  their authored rest rotations. Upper-arm Z offsets are mirrored
  `±(0.4 + sin(time * 1.45) * 0.006)` radians, with no added X/Y twist.
  Do not restore the former large independent forearm bend or palms-up gesture:
  wrist coordinates alone failed to detect visible sleeve penetration.
  New props or externally sourced performance animations require separate review.
- Drive gaze through `VRMLookAt.yaw/pitch` in degrees, never raw eye bones.
  The gaze damping rate is `12`, head rate `7.5`, body rate `3.5`, so the eyes
  respond first and the torso follows. Input limits including idle are
  `abs(yaw) <= 20` and `abs(pitch) <= 13.5`; this model's authored `90 -> 10`
  range maps further limit the actual eye rotations to about `2.2 / 1.5` degrees.
- `lookAt.autoUpdate=false` disables only object-target calculation. The degree
  setters still take effect through the single `vrm.update(delta)` call. Do not
  mistake that flag for a no-eye-motion requirement or add a competing target.
  Positive screen X drives positive yaw; positive screen Y (up) drives negative
  pitch for the locked VRM0. Verify both directions on the real model.
- Pointer exit damps gaze toward its small idle range. `motion.reset()` calls
  `lookAt.reset()` so still mode restores zero yaw/pitch. A missing look-at
  component skips gaze without disabling head/body/expression animation.

## Expression compatibility

Only schedule expressions whose runtime `getExpression(name)` exists and has
actual binds. For this VRM0 model, source `joy` becomes runtime `happy`, and
`fun` becomes `relaxed`. Its `angry`/`sad` presets have no binds, while the source
`neutral` is a surprise face; do not treat that name as an authored rest pose.

This asset's named `Facial_Smile*` presets do not reliably identify curved closed
eyes. `registerSmileEyes` maps the actual mesh `Blink_Smile` target into runtime
expression `kafSmileEyes` with `VRMExpressionMorphTargetBind`, full weight `1`,
and `overrideBlink="block"`. It never edits vertices or the asset file. Missing
targets leave that moment unavailable; existing supported moments still work.

The curated moments are a curved-eye smile plus `happy`, a gentle `happy`,
`blinkLeft` plus `happy`, and `relaxed`. A moment is available only when every
constituent has real binds. All use smooth attack/hold/release. A complete
expression lasts about 3.05 seconds; the next
starts after a randomized 3–6-second rest. Avoid immediately repeating a choice
when alternatives exist. Suppress ordinary blink during smile-eye/wink moments
to avoid adding two eyelid deformations. Reset only the expressions owned here.

## Lifecycle and failure matrix

| Condition | Required behavior |
| --- | --- |
| Before bounded viewport activation | Poster only; no VRM or renderer request |
| Reduced motion / unavailable observer | Explicit manual load; static WebGL pose |
| Active, visible, motion enabled | One RAF loop; clamped timer delta |
| Offscreen, hidden, or manifest open | Stop scheduling frames; clear pointer target |
| Resize | Update capped DPR/camera without loading a second model |
| Fetch/parse/WebGL failure | Keep poster, readable error, retry and download |
| Cleanup / StrictMode replay | Abort fetch, cancel RAF, remove listeners/observers, dispose model/renderer/timer |

Do not call `renderer.forceContextLoss()` unconditionally in effect cleanup.
React StrictMode reuses the same canvas for setup → cleanup → setup; forcing its
context lost can make the second renderer fail while reading shader precision.
Dispose GPU resources through the renderer and `VRMUtils.deepDispose` instead.

## Information dialog and copy

The normal section contains its heading, model creator, the verified creator
profile link, permission summary, download link and “查看模型清单” button. The
current creator profile is the Bilibili URL stored in `kafAvatar.json`, rendered
with the visible text `作者的B站首页` between creator and permission metadata.
Loading/error/manual controls are conditional operational feedback. Do not add
prose describing the renderer, asset host, lazy-loading behavior, fixed
composition or retained model features.

The manifest action opens a lazy `@radix-ui/react-dialog` adapter, not a JSON
navigation. Use `createKafAvatarPublicManifest(window.location.origin)` and the
same asset lock for identity, author, permission, format/version, size, SHA-256
and download. Keep the existing raw manifest route available to machine users.

Use existing warm-dark surfaces, flat borders, typography and pink action tokens.
Radix supplies portal, focus containment, Escape/outside dismissal and body
scroll lock. Return focus through `focus({ preventScroll: true })`; do not repair
the viewport afterward with `scrollTo`. Keep title/description semantics, 44px
controls, wrapping hashes, internal overflow and 320px/200% text support.

Radix dispatches unmount autofocus on a deferred task after the content leaves
the DOM. Browser probes must await `expect(trigger).toBeFocused()` rather than
sample focus immediately after a hidden-dialog assertion; disappearance alone
does not mean the return-focus lifecycle has completed.

## Verification

Run `mise run check` and `mise run e2e`. The focused suites are
`KafAvatarMotion.test.ts`, `KafAvatarMaterials.test.ts`, `KafVrmStage.test.tsx`, `KafAvatarSection.test.tsx`, and
`e2e/avatar-manifest.spec.ts`.

Assertions must cover bounded/frame-rate-independent motion, no accumulated pose
drift, authored smile-target registration, supported moment selection, blink
suppression, gaze bounds/direction/damping/reset and missing-look-at fallback,
same-canvas StrictMode replay, abort/disposal, conditional copy, canonical popup
data, lazy loading, keyboard focus containment, Escape/close return focus,
unchanged page position, body lock and narrow/large-text reflow.
Material tests must verify the exact skin/outline allow-list, uniform values,
unchanged material/map/color identities, idempotence and unrelated/missing inputs.
Pose tests must preserve neutral forearm/wrist offsets and bounded mirrored upper
arms throughout motion and reset, rather than assert an aesthetically large bend.

For real-model changes, run `mise exec -- node scripts/review_avatar_runtime.mjs`
against a settled `mise run dev -- --host 127.0.0.1 --port 5173`. It uses only the
ignored locked model, intercepts test responses for instrumentation, and writes
screenshots/metrics under `.local-assets/avatar-review/`. Never export the review
objects from shipped code. Run this separately from E2E report generation or
source edits: Vite reloads can invalidate a live review. A newly installed lazy
dependency may require one initial dev prebundle/reload before review.

Compare draw calls/triangles and CPU submission time under the same conditions.
The real-model probe also verifies that optimization reduces vertex/morph
storage and preserves the curved-eye binding. Pose acceptance additionally needs
uncropped, settled front and oblique renders with both hands visible at rest and
tracking extremes; the hands must emerge through cuff openings without crossing
sleeve sides or the coat. Do not change the production camera or hide meshes to
mask an intersection. Bone bounds are guardrails, not a cloth-collision proof.
Lighting comparisons must keep the pose/camera identical and distinguish the
skin material correction from the changed scene light rig.
RAF cadence in a headless/browser-throttled environment is not evidence of the
frame rate on every user's GPU. Do not claim a universal FPS from this probe.
