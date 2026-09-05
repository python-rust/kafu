# Sources and diagnosis

Reviewed 2026-09-05 against installed three-vrm 3.5.5 / Three.js 0.185.1.

- https://pixiv.github.io/three-vrm/docs/classes/three-vrm.MToonMaterial.html — public `matcapFactor`, `matcapTexture`, `shadingToonyFactor`, `rimLightingMixFactor` API. Use property updates, not shader source patches.
- https://github.com/pixiv/three-vrm/blob/dev/packages/three-vrm-materials-mtoon/src/MToonMaterial.ts — official material implementation; installed package is the version-specific ground truth.
- https://threejs.org/docs/pages/DirectionalLight.html — light direction is position to target; no distance attenuation or area-light softness. Repositioning a directional light cannot by itself remove camera-space matcap.
- https://threejs.org/docs/pages/HemisphereLight.html — low-cost diffuse environment approximation, not a shadow-casting light.
- https://pixiv.github.io/three-vrm/docs/classes/three-vrm.VRMHumanoid.html — normalized rest-relative poses and transfer to raw bones. Actual source bone geometry and sleeve secondary bones must still be reviewed.

Local locked-GLB inspection: `kaf_face` and `kaf_body` use texture 1 (`skin.exr`, embedded PNG) as `_SphereAdd`; `kaf_cloth` uses a different matcap, texture 5. Installed VRM0 material importer maps `_SphereAdd` to `matcapTexture` with `[1,1,1]` factor. The fragment shader adds the matcap to the rim term; the source `_RimLightingMix=0` makes that contribution independent of scene-light intensity. Controlled rendered comparisons are required to verify the screenshot's hotspot cause.

Current sleeve spring chains are parented under upper arms, while the presentation driver strongly rotates lower arms and hands separately. The previous wrist-in-front-of-torso assertion did not establish garment compatibility. Keep the already-working SpringBone mechanics, reduce the gesture instead of adding a new collision system.

## Controlled model review and decision

The same locked model was rendered at source rest, upper-arm offsets 0.25/0.4/0.55 rad, and the defective baseline. The baseline left/right wrists crossed the midline (left X +0.068, right X -0.054). With mirrored 0.4-rad upper-arm offsets and authored forearms/wrists, left/right wrists are X -0.269/+0.269, below and outboard of the elbows; full-body screenshots show the hands extending normally from sleeves. Choose 0.4 rather than 0.55 for more clearance from the coat, and cap breathing modulation to 0.006 rad.

With scene lights off, the nose/neck highlight remained visible; with the skin matcap factor also zero, it disappeared. Fixed-camera comparisons of zero/reduced skin matcap and skin toon transitions selected zero skin matcap with toony 0.6 / shift -0.1. This removes the independent hotspot and softens the narrow skin shade transition. A moderate 1.6 overhead key and 0.65 hemisphere fill keep diffuse skin/hair readable. Do not apply this treatment to clothing/eyes/hair or change source textures.

## Regression retrospective

Root categories: implicit model assumptions and insufficient visual acceptance. The previous pose treated an authored A-pose as a T-pose and considered wrist world positions sufficient. The earlier lighting change adjusted scene lights but did not isolate the additive material term. Prevention is the conservative source-compatible arm contract, skin-only material tests, full-body settled/extreme-pose screenshots and identical-pose material/light comparisons. This task does not add IK, simulated cloth collision, new mouth behavior or a generic material framework.
