# Design

## Boundary and reuse

- `KafAvatarSection` remains the owner of loading/activity and low-frequency dialog state. Remove prose and duplicate metadata; preserve poster/error/manual controls.
- Add one lazy `KafAvatarManifestDialog` adapter using the unstyled `@radix-ui/react-dialog` primitive. Radix owns portal, focus trap, Escape, outside dismissal and body lock. CSS Modules consume existing warm-dark, typography and action tokens. Explicit return focus uses `preventScroll`, not document scroll compensation.
- Reuse `createKafAvatarPublicManifest` and the canonical asset lock, rather than fetching/copying a second metadata source. Public JSON and R2 contracts stay unchanged.
- Keep Three.js/three-vrm lazy. Extract the now nontrivial motion driver into a section-local module for deterministic tests. Use existing normalized humanoid bones, `MathUtils.damp`, quaternion composition and `VRMExpressionManager`; call `vrm.update(delta)` once after the pose to advance the existing SpringBones. Do not implement physics or gesture solvers.

## Rendering and motion

- Replace the oversized ambient/front fill with a low-energy hemisphere fill plus one key above and slightly in front of the actual head. Derive placement from loaded head/hips coordinates, not assumed model units. Keep shadows disabled and original materials/textures intact.
- Cache bone rest transforms and reuse Euler/quaternion work objects. Relaxed asymmetrical upper/lower arms and wrists are part of the runtime pose, not a derived VRM file.
- Project the head position into the fixed camera to define a bounded pointer interaction region. Read the event position only; consume/damp it in the render loop. Mouse/hover pen only; leave touch scrolling native. Clamp excursions and clear targets on leave/cancel/pause.
- Use a small curated set of actually bound expressions, random no-immediate-repeat scheduling, smooth attack/hold/release and blink suppression during closed-eye expressions. Do not use `neutral` as a semantic fallback: this asset binds it to surprise. Bind the existing, otherwise unregistered `Blink_Smile` morph through `VRMExpressionMorphTargetBind` before `combineMorphs`; do not edit the binary.
- Drive the existing `VRMLookAt.yaw/pitch` degree setters with bounded, damped pointer inputs, slightly faster than the head, plus small idle movement. `autoUpdate=false` disables only automatic object-target calculation, not gaze application: the single `vrm.update(delta)` applies the angles through the model's range maps. This avoids a second world-space pointer projection or raw-eye mutations. Verify both axis signs with this real VRM0 and reset gaze in still mode.
- Idle/motion time advances only inside the active render loop. Static mode resets owned bones/expressions and SpringBones. Pause without continued frame scheduling in hidden/offscreen/dialog states.

## Validation and risk

Unit tests cover bounded/frame-rate-independent steering, no pose drift, expression availability/envelopes/reset and bounded gaze. Browser tests cover the actual dialog and section fallback. A local real-model browser review uses ignored assets, screenshots, instrumented runtime checks and frame/draw-call measurements; it must not add the 49.9MB model or debug hooks to production.

Main risks are MToon over/underexposure, VRM0 coordinate signs, smile morph overlap, sleeve penetration and return-focus scroll jumps. Resolve with the real model, not guessed preset semantics. A missing expressive morph falls back to available smile/relaxed morphs and blink; missing optional bones are skipped.

## Rollout / rollback

No server/API/storage changes. Lock the new small dialog dependency exactly and keep its code off the initial chunk. Release through the existing manual workflow. Roll back source commits and redeploy; the immutable R2 object remains usable by both builds.
