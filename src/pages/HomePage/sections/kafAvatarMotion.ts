import {
  VRMExpression,
  VRMExpressionMorphTargetBind,
  type VRM,
  type VRMHumanBoneName,
} from '@pixiv/three-vrm';
import { Euler, MathUtils, Mesh, Object3D, Quaternion } from 'three';

import { kafAvatarAsset } from '../../../content/kafAvatar';

interface BonePose {
  node: Object3D;
  rest: Quaternion;
}

const animatedBones = [
  'head',
  'neck',
  'chest',
  'spine',
  'leftShoulder',
  'rightShoulder',
  'leftUpperArm',
  'rightUpperArm',
  'leftLowerArm',
  'rightLowerArm',
  'leftHand',
  'rightHand',
] as const satisfies readonly VRMHumanBoneName[];

const expressionChoices = [
  {
    values: [
      { name: 'kafSmileEyes', weight: 1 },
      { name: 'happy', weight: 0.6 },
    ],
    ownsEyelids: true,
  },
  { values: [{ name: 'happy', weight: 0.7 }], ownsEyelids: false },
  {
    values: [
      { name: 'blinkLeft', weight: 1 },
      { name: 'happy', weight: 0.45 },
    ],
    ownsEyelids: true,
  },
  { values: [{ name: 'relaxed', weight: 0.65 }], ownsEyelids: false },
] as const;

function registerSmileEyes(vrm: VRM): void {
  const manager = vrm.expressionManager;
  if (!manager || manager.getExpression('kafSmileEyes')) return;

  // The authored curved-eye target exists in the GLB but was not exposed as a
  // VRM expression. Bind it through the runtime API before combineMorphs;
  // never guess that a similarly named mouth/full-face preset closes the eyes.
  const smile = new VRMExpression('kafSmileEyes');
  smile.overrideBlink = 'block';
  vrm.scene.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const index = node.morphTargetDictionary?.Blink_Smile;
    if (
      index === undefined ||
      !Number.isInteger(index) ||
      !node.geometry.morphAttributes.position?.[index]
    )
      return;
    smile.addBind(
      new VRMExpressionMorphTargetBind({
        primitives: [node],
        index,
        weight: 1,
      }),
    );
  });
  if (smile.binds.length > 0) manager.registerExpression(smile);
}

/** Section-specific posing; three-vrm remains the bone/expression/physics engine. */
export function createKafAvatarMotion(vrm: VRM, random = Math.random) {
  registerSmileEyes(vrm);
  const lookAt = vrm.lookAt;
  if (lookAt) {
    // We own the damped angles; three-vrm still applies its authored range
    // maps on vrm.update(). autoUpdate only controls object-target calculation.
    lookAt.autoUpdate = false;
    lookAt.target = null;
  }
  const poses = new Map<VRMHumanBoneName, BonePose>();
  for (const name of animatedBones) {
    const node = vrm.humanoid.getNormalizedBoneNode(name);
    if (node) poses.set(name, { node, rest: node.quaternion.clone() });
  }

  const expressions = vrm.expressionManager;
  const choices = expressionChoices.filter(({ values }) =>
    values.every(
      ({ name }) => (expressions?.getExpression(name)?.binds.length ?? 0) > 0,
    ),
  );
  const ownedExpressions = new Set(
    choices.flatMap(({ values }) => values.map(({ name }) => name)),
  );
  const blinkName = kafAvatarAsset.expressions.blink;
  const rotation = new Quaternion();
  const euler = new Euler(0, 0, 0, 'YXZ');
  let targetX = 0;
  let targetY = 0;
  let headX = 0;
  let headY = 0;
  let bodyX = 0;
  let gazeX = 0;
  let gazeY = 0;
  let elapsed = 0;
  let blinkStart: number | null = null;
  let nextBlink = 2 + random() * 2;
  let expressionStart: number | null = null;
  let nextExpression = 1.5 + random() * 1.5;
  let choiceIndex = -1;

  function rotate(name: VRMHumanBoneName, x: number, y: number, z: number) {
    const pose = poses.get(name);
    if (!pose) return;
    rotation.setFromEuler(euler.set(x, y, z, 'YXZ'));
    pose.node.quaternion.copy(pose.rest).multiply(rotation);
  }

  function pose(time: number) {
    const breath = Math.sin(time * 1.45);
    const sway = Math.sin(time * 0.63);
    const tilt = Math.sin(time * 0.41);
    rotate(
      'head',
      headY * 0.13 + breath * 0.012,
      headX * 0.22 + sway * 0.035,
      -headX * 0.045 + tilt * 0.018,
    );
    rotate('neck', headY * 0.025, headX * 0.045, -headX * 0.012);
    rotate(
      'chest',
      breath * 0.007,
      bodyX * 0.055,
      -bodyX * 0.018 + sway * 0.007,
    );
    rotate('spine', breath * 0.004, bodyX * 0.028, -bodyX * 0.012);
    rotate('leftShoulder', 0, 0, breath * 0.01);
    rotate('rightShoulder', 0, 0, -breath * 0.008);

    // This model is authored in an A-pose, not a T-pose. Its loose sleeve
    // chains follow the upper arms, not the independently bent elbows. Keep
    // forearms/wrists at authored rest and lower the whole arm only slightly.
    const armDrop = 0.4 + breath * 0.006;
    rotate('leftUpperArm', 0, 0, armDrop);
    rotate('rightUpperArm', 0, 0, -armDrop);
    rotate('leftLowerArm', 0, 0, 0);
    rotate('rightLowerArm', 0, 0, 0);
    rotate('leftHand', 0, 0, 0);
    rotate('rightHand', 0, 0, 0);
  }

  function updateExpressions() {
    if (
      choices.length > 0 &&
      expressionStart === null &&
      elapsed >= nextExpression
    ) {
      const offset = 1 + Math.floor(random() * Math.max(1, choices.length - 1));
      choiceIndex = (choiceIndex + offset) % choices.length;
      expressionStart = elapsed;
    }

    let faceWeight = 0;
    const choice = choices[choiceIndex];
    if (expressionStart !== null && choice) {
      const time = elapsed - expressionStart;
      faceWeight =
        MathUtils.smoothstep(time, 0, 0.65) *
        (1 - MathUtils.smoothstep(time, 2.05, 3.05));
      for (const { name, weight } of choice.values)
        expressions?.setValue(name, faceWeight * weight);
      if (time >= 3.05) {
        expressionStart = null;
        nextExpression = elapsed + 3 + random() * 3;
      }
    }

    // Full-face smile morphs already close the lids. Adding blink on top can
    // push the eyelids through the face; defer that blink until release.
    if (choice?.ownsEyelids && faceWeight > 0.001) {
      blinkStart = null;
      nextBlink = elapsed + 0.8;
      expressions?.setValue(blinkName, 0);
      return;
    }
    if (blinkStart === null && elapsed >= nextBlink) blinkStart = elapsed;
    let blinkWeight = 0;
    if (blinkStart !== null) {
      const progress = (elapsed - blinkStart) / 0.18;
      if (progress >= 1) {
        blinkStart = null;
        nextBlink = elapsed + 2.5 + random() * 3;
      } else {
        blinkWeight = Math.sin(Math.PI * progress) ** 2;
      }
    }
    expressions?.setValue(blinkName, blinkWeight);
  }

  function releasePointer() {
    targetX = 0;
    targetY = 0;
  }

  function reset() {
    releasePointer();
    headX = 0;
    headY = 0;
    bodyX = 0;
    gazeX = 0;
    gazeY = 0;
    lookAt?.reset();
    for (const { node, rest } of poses.values()) node.quaternion.copy(rest);
    for (const name of ownedExpressions) expressions?.setValue(name, 0);
    expressions?.setValue(blinkName, 0);
    expressionStart = null;
    blinkStart = null;
    nextExpression = elapsed + 1.5 + random() * 1.5;
    nextBlink = elapsed + 2 + random() * 2;
    pose(0);
  }

  reset();

  return {
    setPointer(x: number, y: number) {
      targetX = Number.isFinite(x) ? MathUtils.clamp(x, -1, 1) : 0;
      targetY = Number.isFinite(y) ? MathUtils.clamp(y, -1, 1) : 0;
    },
    releasePointer,
    reset,
    update(delta: number) {
      const dt = Number.isFinite(delta) ? MathUtils.clamp(delta, 0, 0.05) : 0;
      elapsed += dt;
      headX = MathUtils.damp(headX, targetX, 7.5, dt);
      headY = MathUtils.damp(headY, targetY, 7.5, dt);
      bodyX = MathUtils.damp(bodyX, targetX, 3.5, dt);
      gazeX = MathUtils.damp(gazeX, targetX, 12, dt);
      gazeY = MathUtils.damp(gazeY, targetY, 12, dt);
      if (lookAt) {
        // Degree inputs are further limited by the model's 90 -> 10 degree
        // maps: actual eye excursions remain about 2.2 / 1.5 degrees.
        lookAt.yaw = gazeX * 18 + Math.sin(elapsed * 0.37) * 2;
        lookAt.pitch = -gazeY * 12 + Math.sin(elapsed * 0.29) * 1.5;
      }
      pose(elapsed);
      updateExpressions();
    },
  };
}

export type KafAvatarMotion = ReturnType<typeof createKafAvatarMotion>;
