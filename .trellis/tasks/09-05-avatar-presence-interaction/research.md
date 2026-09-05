# Research — 2026-09-05

## Verified during implementation

- StrictMode replay of an existing canvas plus unconditional
  `renderer.forceContextLoss()` reproduced a null shader-precision failure.
  Removing the forced context loss while retaining complete resource disposal
  restores real-model loading; an explicit same-canvas regression is included.
  Sources: https://react.dev/reference/react/StrictMode and
  https://threejs.org/docs/pages/WebGLRenderer.html.
- Inspecting real morph data showed that the `Facial_Smile*` labels are not a
  reliable substitute for the authored `Blink_Smile` target. Register the latter
  through `VRMExpression` / `VRMExpressionMorphTargetBind`, then animate using
  the existing manager. Source:
  https://pixiv.github.io/three-vrm/docs/classes/three-vrm.VRMExpressionMorphTargetBind.html.
- The headless browser uses ANGLE **SwiftShader**, not the Mac hardware GPU.
  Initial rendered RAF intervals were about 133ms while a paused empty RAF was
  16.7ms; CPU submission alone (~1.3ms) was not an adequate frame-rate measure.
  Investigate actual vertex/morph load instead of claiming universal 60 FPS.
- The official example already provides `removeUnnecessaryVertices`,
  `combineSkeletons`, and `combineMorphs` for model optimization. Reuse these
  before first render; register otherwise-unbound smile targets before morph
  compaction. Sources:
  https://github.com/pixiv/three-vrm/blob/dev/packages/three-vrm/examples/lookat.html
  and https://pixiv.github.io/three-vrm/docs/classes/three-vrm.VRMUtils.html.

## Local evidence

Planning baseline: three 0.185.1, @pixiv/three-vrm 3.5.5, React 19.2.8. No information-dialog primitive was installed at task start. The gallery's yet-another-react-lightbox owns image/zoom navigation, not structured asset metadata; do not repurpose its slide mechanics for this dialog. Implementation adds the exact locked `@radix-ui/react-dialog` 1.1.23 package behind its own lazy adapter.

The locked VRM has `kaf_hair`, hat, cloth and sleeve spring groups; real joy/fun/blink morphs; custom Facial_Smile1–5. Angry/Sorrow have no binds. `neutral` is actually the author's surprise morph. Inspect live loaded expressions and screenshots before choosing smile names. Authored materials are MToon; lights must be tuned to these materials rather than replaced wholesale.

## Primary sources

1. https://github.com/pixiv/three-vrm — official MIT runtime, normalized humanoid/expressions/MToon/SpringBone support and examples.
2. https://pixiv.github.io/three-vrm/docs/classes/three-vrm.VRMHumanoid.html — normalized bone access/rest poses; preserve rest transforms and use the runtime mapping.
3. https://pixiv.github.io/three-vrm/docs/classes/three-vrm.VRMExpressionManager.html — getExpression/getValue/setValue; available preset/custom maps. VRM0 source names must be checked against runtime names.
4. https://pixiv.github.io/three-vrm/docs/classes/three-vrm-springbone.VRMSpringBoneManager.html — use current `joints`, reset/update, not deprecated `springBones`; reuse imported physics.
5. https://threejs.org/docs/pages/DirectionalLight.html — light direction is position-to-target, not object rotation.
6. https://threejs.org/manual/en/shadows.html — each shadow-casting light adds scene renders; no shadow/postprocess pass is needed for this presentation adjustment.
7. https://threejs.org/docs/pages/MathUtils.html — `damp(x,y,lambda,dt)` is the existing frame-rate-independent interpolation primitive.
8. https://www.radix-ui.com/primitives/docs/components/dialog — unstyled modal primitive, focus trap, Title/Description announcements, Escape, controlled state and lifecycle hooks. Select the standalone exact package, not Radix Themes or another design system.
9. https://www.radix-ui.com/primitives/docs/overview/accessibility — keyboard/focus responsibilities; browser verification is still necessary after styling/integration.

## Decisions

Reuse the installed runtime and its authored model capabilities. Add only the information-dialog primitive, lazy-loaded. Keep metadata as a typed projection of the same lock and the raw manifest route for machine consumers. No new model, animation downloads, physics engine, custom modal mechanics or whole-scene shadows. Record durable contracts in SPEC; retain source links and one-off comparison evidence here.

## Eye-movement follow-up

The user subsequently permits eye movement and delegates its choreography. This supersedes the initial no-eye-motion restriction. The official `VRMLookAt` API already supports world-space targets, bounded application through the model's applier, direct yaw/pitch setters (degrees), and reset:

https://pixiv.github.io/three-vrm/docs/classes/three-vrm.VRMLookAt.html

Prefer restrained gaze coordinated with the head and existing expression scheduling. Do not manipulate raw eyeball bones or introduce a separate tracking engine. Reduced-motion reset and hidden/offscreen pause still apply. Verify direction against this VRM0 model rather than assuming VRM1 coordinates.

## Completion review

- Rechecked official LookAt documentation and the installed 3.5.5 implementation: `autoUpdate` guards object-target calculation only. Degree setters mark the applier dirty and `update` still applies those angles. Use the setters for one damped screen-space interaction owner, rather than adding another target projection.
- https://pixiv.github.io/three-vrm/docs/classes/three-vrm.VRMUtils.html documents vertex removal, skeleton combination and morph combination; these are runtime optimizations, not binary edits. Register the authored smile-eye bind before morph combination.
- https://pixiv.github.io/three-vrm/docs/classes/three-vrm.VRMExpressionMorphTargetBind.html supplies the existing morph-binding API. Runtime checks must prove the bind survives optimization and affects a real mesh.
- Existing production runs `33901633521` (integration commit `0f8f3bc`) and `33905085932` (starting revision `33e6356`) completed successfully. Reconcile the older task's stale deployment checkboxes with these records and fresh production checks before archive.

## Real-model review results

- Inspected the locked GLB: all four look-at maps are `xRange=90`, `yRange=10`, with `lookAtTypeName=Bone`. The selected yaw/pitch inputs are deliberately restrained; no raw-eye writes are necessary.
- The updated real-model probe verifies left/right head facing, left/right and up/down local eye directions, gaze bounds, changing hair joints, dialog pause/resume and hidden-tab pause. It passed with no page errors.
- Both light rigs on the same optimized scene use 19 draw calls / 150,740 triangles. Current light-rig CPU submission median/p95 was about 0.9/1.2 ms; the original-light comparison was about 0.9/1.1 ms. This is a local SwiftShader probe, not a hardware-GPU FPS promise or a full original-build benchmark.
- Official runtime optimization reduced stored vertices from 96,372 to 49,742 and maximum morph targets from 74 to 21. Three actual smile-eye mesh binds survive combination at weight 1; 264 authored spring joints remain available.
- Reviewed `pose-forward`, `pose-asymmetric`, and `pose-wrists` alternatives under ignored local evidence. Larger forearm/wrist changes produced stronger sleeve/hand occlusion, so retain the tested restrained bent-arm composition. Compared modest fill/key/forward-light alternatives; retain the existing overhead reference rather than restoring frontal wash.
- Evidence lives under ignored `.local-assets/avatar-review/`; screenshots, model binaries and instrumented browser objects are not production exports.
