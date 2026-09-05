# Correct avatar hands and lighting

## Goal

Restore a normal, sleeve-compatible arm pose and comfortable face/hair lighting on the existing avatar. The user's latest clarification explicitly prioritizes correctness over expressive hands and drops additional mouth shapes. This is a project repair and deployment, not image generation.

## Evidence and scope

- Production/source baseline is `8e6eabd`; the checkout is clean. Earlier avatar tasks are already archived and do not need reopening.
- The supplied screenshot shows hands protruding across the sleeves, with an unnatural palms-up silhouette, and a strong nose/neck hotspot.
- Current normalized forearm rotations reach 1.25/1.43 radians plus twist, independently of sleeve SpringBones. The previous test required bent elbows and only checked wrist positions, not visible garment compatibility.
- The locked VRM face/body materials contain `_SphereAdd` = `skin.exr`; three-vrm maps this to additive matcap at full strength. Test its contribution separately from scene light direction before deciding the lighting correction.

## Acceptance

1. Use a conservative symmetric or near-symmetric rest pose with straight/only slightly bent forearms and neutral wrists. No hand waving, palms-up gesture, crossed forearms or props. Inspect the actual fully visible hands/sleeves, not just cropped bust or bone positions, at rest and bounded tracking extremes after physics settles.
2. Remove the distracting bright nose/neck hotspot without simply darkening the whole character. Keep readable skin and some directional hair shading; do not add shadows, postprocessing, new textures, engines, or a material replacement.
3. Preserve working gaze, head/body tracking, expressions, lazy model loading, reduced-motion pose, offscreen/hidden/dialog pause, public asset identity and metadata dialog. Do not add new mouth morphs or change permission metadata.
4. Reuse existing Three.js/three-vrm APIs; any material adjustment must be local to the loaded model, narrowly targeted and idempotent. Do not modify/re-upload the locked VRM.
5. Run regression tests and real-model screenshots with both hands fully visible, compare identical-pose lighting conditions, update the owning SPEC, commit/archive and redeploy through the existing main-only workflow. Confirm live assets and model loading after deployment.

## Delegated choices

The user approves the conservative fallback: normal hands, improved lighting, no new mouth work. Exact safe angles and minimum material/light adjustments are implementation choices verified against the actual model.
