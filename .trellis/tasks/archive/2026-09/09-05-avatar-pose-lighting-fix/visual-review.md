# Additional real-model review

## Controlled diagnosis

The local probe `.local-assets/avatar-sleeve-audit/compare.mjs` captured identical-scene renders with lights disabled and with the skin matcap contribution disabled separately. The bright nose/neck remained with zero scene lights; removing the skin matcap removed that independent light contribution. This supports the scoped material correction instead of attempting another light-position-only fix.

Full-body pose comparisons also rejected excessive upper-arm lowering: at 0.95 and 1.1 radians, even neutral forearms put hands inside the torso silhouette. The 0.45-radian comparison visibly preserved cuff/forearm continuity and separation from the coat. The implemented 0.4-radian drop is slightly more conservative. This asset is already in an A-pose; do not treat it as a T-pose.

## Corrected implementation checks

`.local-assets/avatar-sleeve-audit/validate.mjs` exercised the actual updated code without substituting pose/material values. Five settled motion samples (center, left, right, upper-left and lower-right) each captured a full-body front and two oblique views: 15 views plus the original production crop. Each sample advanced the actual motion and SpringBone runtime for 180 steps at 1/60 second.

Inspected the full front and both oblique tracking-extreme views: forearms emerge through the open sleeve ends, wrists are neutral, and visible hands no longer protrude horizontally through sleeve sides. The production camera is unchanged; full-body framing is test-only and no mesh was hidden to achieve this result.

All sampled renders retained 19 draw calls and 150,740 triangles. Face/body plus their outline materials had zero matcap contribution, toony factor 0.6 and shift -0.1. The browser reported no page errors. These measurements do not prove a universal device frame rate or collision freedom under arbitrary unimplemented poses.

## Regression lessons

- Category E (implicit assumption): normalized humanoid bones do not imply an authored T-pose, and arbitrary elbow motion does not move independent sleeve spring chains compatibly.
- Category D (coverage gap): wrist position in front of the torso is not a sleeve-intersection test. Preserve the neutral lower-arm/wrist invariants and require uncropped front/side visual review for future pose edits.
- Previous light-only changes addressed the wrong contribution. Isolate diffuse illumination, additive matcap and emission before changing light intensity. Keep the targeted material override and its texture/identity/idempotence tests.
