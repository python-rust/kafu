# 优化动态形象光照、互动与模型清单

## Goal

Make the existing KAF avatar feel softly lit and alive without adding heavy rendering, new model assets, or explanatory interface prose. Finish the Trellis task, update executable specs, archive, and redeploy the existing production site.

## Confirmed facts

- The checkout starts clean on `main` at `33e6356`. The older VRM-integration task remains separate.
- `KafVrmStage.tsx` currently combines ambient intensity 1.65 with two front lights (2.25 / 0.55), a static lowered-arm pose, small idle rotations, blink, and automatic eye look-at.
- `KafAvatarSection.tsx` exposes explanatory paragraphs, redundant credit, file details and a raw JSON manifest destination.
- The locked local VRM contains real head/hair SpringBones, VRM0 joy/fun, blink, and five custom Facial_Smile expressions. The immutable binary and its public route must not change.

## Requirements and acceptance

1. **Light:** a gentle overhead/front-overhead key produces visible hair/face shading without the uniformly bright frontal appearance. Keep the authored MToon materials, fixed front upper-body framing, and no additional shadow/postprocess passes.
2. **Copy:** the normal section keeps only its heading, model author, permission summary, download action and manifest action. Technical fields move into the manifest dialog. Honest loading/error/manual-load feedback remains conditional, not promotional copy.
3. **Manifest:** “查看模型清单” opens a site-styled accessible dialog, not JSON navigation. Show identity, author, permission, version/format/size/hash and download from the canonical content lock. Verify keyboard focus containment, Escape, close/return-focus without document scroll movement, background scroll lock, 320px and 200% text reflow. Keep the machine-readable API unchanged for repository consumers.
4. **Interaction:** pointer movement near the head gently steers head/neck/upper body with bounded damped rotations; existing SpringBones produce secondary hair movement. Pointer exit relaxes naturally. The user's follow-up explicitly permits subtle eye tracking; reuse VRM look-at with restrained targets. Do not move the camera, intercept scrolling, or add props.
5. **Presence:** vary existing smile/relaxed expressions at restrained randomized intervals, including a visually verified closed-eye smile when the model supports it. Avoid conflicting blink/closed-eye weights and unsupported/empty expressions. Use a relaxed asymmetric bent-arm pose with subtle secondary motion rather than stiff dangling arms.
6. **Performance/fallback:** no per-frame React state, extra model download, physics engine, or animation framework. Preserve lazy loading, capped DPR, offscreen/hidden pause, reduced-motion still mode, poster/retry and complete cleanup. Pause while the manifest covers the page. Measure real-model render cost and compare draw calls.
7. **Delivery:** focused unit/browser regressions plus full `mise run check` and `mise run e2e`; update SPEC before archive; commit, deploy through the manual main-only workflow, and verify the production build and R2 proxy.

## Out of scope

Lip sync, audio, new animation/model assets, props, editing/re-uploading the VRM, IK/physics reimplementation, general-purpose modal/avatar frameworks, and unrelated gallery changes.

## Delegated choices

The user explicitly delegates light placement, expression intervals, compatible reusable modules, and fallback decisions, and requests execution through deployment in this session. No additional product decision is blocking.
