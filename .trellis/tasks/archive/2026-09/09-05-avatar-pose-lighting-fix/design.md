# Design

## Boundaries

- `kafAvatarMotion.ts`: remove the aggressive independent elbow/wrist gesture; keep the existing rest-relative posing and head/body/expression loop. Prefer source-compatible arm transforms over new IK or cloth collisions.
- `KafVrmStage.tsx`: maintain the existing camera and two-light budget; tune only after controlled render evidence. A small section-local material helper is justified only for a tested, one-time, asset-specific MToon adjustment.
- Tests/review script: replace the invalid "elbow bend > 1 rad" expectation with safe forearm/wrist/no-drift invariants; add targeted material identity/texture/idempotence checks and actual uncropped sleeve/hand review.
- SPEC and task evidence: replace the old bent-arm prescription with the confirmed safe pose; document matcap versus scene-light diagnosis and actual validation limits.

## Investigation and decision gates

1. Freeze the current runtime using test-only response interception. Capture the baseline and source/limited-arm poses after SpringBone settles, including a temporary full-body review camera. Never change the production framing to hide a defect.
2. With the exact same pose/camera/illumination, compare full, reduced and zero skin matcap strength; inspect material names and texture bindings. Also switch off scene lights to distinguish independent additive shading from illumination.
3. Choose the smallest verified correction. Preserve base maps, eyes/hair colors and material classes. If matcap is the cause, limit the adjustment to face/body skin materials (including their generated outlines) using official `MToonMaterial.matcapFactor`; no shader patch or texture edit.
4. Verify full rendered hand/sleeve silhouettes at all pointer extrema and in still mode. Test math guards prevent a return to the old extreme pose, but do not claim those unit tests prove general cloth collision avoidance.

## Rollout / rollback

No dependency, public API, asset lock, binary or deployment-workflow changes. Normal tested main release; revert this work commit and redeploy to roll back. Keep existing immutable R2 objects intact.
