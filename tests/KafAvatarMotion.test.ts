import {
  VRM,
  VRMExpression,
  VRMExpressionManager,
  VRMHumanoid,
  VRMLookAt,
  VRMLookAtBoneApplier,
  VRMLookAtRangeMap,
  type VRMHumanBones,
} from '@pixiv/three-vrm';
import {
  BufferGeometry,
  Euler,
  Float32BufferAttribute,
  Group,
  Mesh,
  Object3D,
} from 'three';
import { describe, expect, it, vi } from 'vitest';

import { createKafAvatarMotion } from '../src/pages/HomePage/sections/kafAvatarMotion';

function fixture(
  names = ['happy', 'blinkLeft', 'relaxed'],
  withSmile = true,
  withLookAt = true,
) {
  const bones = {
    hips: { node: new Object3D() },
    spine: { node: new Object3D() },
    head: { node: new Object3D() },
    neck: { node: new Object3D() },
    chest: { node: new Object3D() },
    leftUpperLeg: { node: new Object3D() },
    leftLowerLeg: { node: new Object3D() },
    leftFoot: { node: new Object3D() },
    rightUpperLeg: { node: new Object3D() },
    rightLowerLeg: { node: new Object3D() },
    rightFoot: { node: new Object3D() },
    leftShoulder: { node: new Object3D() },
    rightShoulder: { node: new Object3D() },
    leftUpperArm: { node: new Object3D() },
    rightUpperArm: { node: new Object3D() },
    leftLowerArm: { node: new Object3D() },
    rightLowerArm: { node: new Object3D() },
    leftHand: { node: new Object3D() },
    rightHand: { node: new Object3D() },
    leftEye: { node: new Object3D() },
    rightEye: { node: new Object3D() },
  } satisfies VRMHumanBones;
  const scene = new Group();
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0], 3));
  if (names.length > 0 && withSmile) {
    const smile = new Float32BufferAttribute([0, 0.01, 0], 3);
    smile.name = 'Blink_Smile';
    geometry.morphAttributes.position = [smile];
    geometry.morphTargetsRelative = true;
  }
  const face = new Mesh(geometry);
  scene.add(face);
  for (const { node } of Object.values(bones)) {
    scene.add(node);
  }
  const expressionManager = new VRMExpressionManager();
  for (const name of ['blink', ...names]) {
    const expression = new VRMExpression(name);
    expression.addBind({ applyWeight: vi.fn(), clearAppliedWeight: vi.fn() });
    expressionManager.registerExpression(expression);
  }
  expressionManager.registerExpression(new VRMExpression('angry'));
  const humanoid = new VRMHumanoid(bones);
  const range = new VRMLookAtRangeMap(90, 10);
  const applier = new VRMLookAtBoneApplier(
    humanoid,
    range,
    range,
    range,
    range,
  );
  applier.faceFront.set(0, 0, -1);
  const lookAt = new VRMLookAt(humanoid, applier);
  lookAt.faceFront.set(0, 0, -1);
  const vrm = new VRM({
    scene,
    humanoid,
    ...(withLookAt ? { lookAt } : {}),
    meta: { metaVersion: '0' },
    expressionManager,
  });
  const motion = createKafAvatarMotion(vrm, () => 0);
  return { vrm, motion, face, expressions: expressionManager };
}

function advance(
  motion: ReturnType<typeof createKafAvatarMotion>,
  seconds: number,
  rate = 60,
) {
  for (let i = 0; i < Math.round(seconds * rate); i++) motion.update(1 / rate);
}

describe('KAF avatar presence', () => {
  it('damps bounded head and body movement without accumulating rotations', () => {
    const { vrm, motion } = fixture();
    const head = vrm.humanoid.getNormalizedBoneNode('head')!;
    motion.setPointer(100, -100);
    advance(motion, 20);
    const angles = new Euler().setFromQuaternion(head.quaternion, 'YXZ');
    expect(angles.y).toBeGreaterThan(0.17);
    expect(Math.abs(angles.y)).toBeLessThan(0.27);
    expect(Math.abs(angles.x)).toBeLessThan(0.15);
    expect(Math.abs(angles.z)).toBeLessThan(0.07);
    motion.releasePointer();
    advance(motion, 2);
    expect(
      Math.abs(new Euler().setFromQuaternion(head.quaternion, 'YXZ').y),
    ).toBeLessThan(0.04);
  });

  it('uses frame-rate-independent head, body and gaze steering through the VRM applier', () => {
    const a = fixture();
    const b = fixture();
    const eye = a.vrm.humanoid.getRawBoneNode('leftEye')!;
    const originalEye = eye.quaternion.clone();
    a.motion.setPointer(0.8, 0.5);
    b.motion.setPointer(0.8, 0.5);
    advance(a.motion, 1, 30);
    advance(b.motion, 1, 120);
    for (const name of ['head', 'chest'] as const) {
      expect(
        a.vrm.humanoid
          .getNormalizedBoneNode(name)!
          .quaternion.angleTo(
            b.vrm.humanoid.getNormalizedBoneNode(name)!.quaternion,
          ),
      ).toBeLessThan(1e-6);
    }
    // Only the runtime applier writes raw eyes, after the driver's update.
    expect(eye.quaternion.equals(originalEye)).toBe(true);
    expect(a.vrm.lookAt!.yaw).toBeCloseTo(b.vrm.lookAt!.yaw, 8);
    expect(a.vrm.lookAt!.pitch).toBeCloseTo(b.vrm.lookAt!.pitch, 8);
    a.vrm.update(0);
    expect(eye.quaternion.angleTo(originalEye)).toBeGreaterThan(0.01);
    expect(eye.quaternion.angleTo(originalEye)).toBeLessThan(0.05);
    a.motion.reset();
    a.vrm.update(0);
    expect(eye.quaternion.angleTo(originalEye)).toBeLessThan(1e-7);
  });

  it('bounds gaze, relaxes it on exit and supports models without look-at', () => {
    const { vrm, motion } = fixture();
    motion.setPointer(100, -100);
    advance(motion, 12);
    expect(vrm.lookAt!.yaw).toBeGreaterThan(15);
    expect(Math.abs(vrm.lookAt!.yaw)).toBeLessThanOrEqual(20);
    expect(Math.abs(vrm.lookAt!.pitch)).toBeLessThanOrEqual(13.5);
    motion.releasePointer();
    advance(motion, 2);
    expect(Math.abs(vrm.lookAt!.yaw)).toBeLessThanOrEqual(2.01);
    expect(Math.abs(vrm.lookAt!.pitch)).toBeLessThanOrEqual(1.51);
    motion.reset();
    expect(vrm.lookAt!.yaw).toBe(0);
    expect(vrm.lookAt!.pitch).toBe(0);
    const fallback = fixture([], false, false);
    expect(() => {
      advance(fallback.motion, 10);
      fallback.motion.reset();
    }).not.toThrow();
  });

  it('keeps bent asymmetric arms and resets owned poses without drift', () => {
    const { vrm, motion, expressions } = fixture();
    const arm = vrm.humanoid.getNormalizedBoneNode('leftLowerArm')!;
    const rest = arm.quaternion.clone();
    expect(
      Math.abs(new Euler().setFromQuaternion(rest, 'YXZ').z),
    ).toBeGreaterThan(1);
    for (let i = 0; i < 20; i++) {
      motion.setPointer(1, 1);
      advance(motion, 3);
      motion.reset();
      expect(arm.quaternion.angleTo(rest)).toBeLessThan(1e-7);
      expect(
        expressions.expressions.every((expression) => expression.weight === 0),
      ).toBe(true);
    }
  });

  it('plays real smiles, suppresses overlapping blink and returns to rest between expressions', () => {
    const { motion, expressions, face } = fixture();
    advance(motion, 2.5);
    expect(expressions.getValue('kafSmileEyes')).toBe(1);
    expect(expressions.getValue('happy')).toBeCloseTo(0.6);
    expressions.update();
    expect(face.morphTargetInfluences?.[0]).toBe(1);
    expect(expressions.getValue('blink')).toBe(0);
    expect(expressions.getValue('angry')).toBe(0);
    advance(motion, 2.5);
    expect(expressions.getValue('kafSmileEyes')).toBe(0);
    advance(motion, 3.5);
    expect(expressions.getValue('happy')).toBeGreaterThan(0.5);
    expect(expressions.getValue('kafSmileEyes')).toBe(0);
  });

  it('skips absent expressions and tolerates invalid pointer or elapsed input', () => {
    const { vrm, motion, expressions } = fixture([]);
    motion.setPointer(Number.NaN, Number.POSITIVE_INFINITY);
    motion.update(Number.NaN);
    motion.update(-1);
    motion.update(500);
    advance(motion, 20);
    expect(
      vrm.humanoid
        .getNormalizedBoneNode('head')!
        .quaternion.toArray()
        .every(Number.isFinite),
    ).toBe(true);
    expect(expressions.getValue('angry')).toBe(0);
  });

  it('falls back to a supported smile when the authored smile-eye target is absent', () => {
    const { motion, expressions } = fixture(['happy'], false);
    advance(motion, 2.5);
    expect(expressions.getExpression('kafSmileEyes')).toBeNull();
    expect(expressions.getValue('happy')).toBeCloseTo(0.7);
  });

  it('plays a wink without adding an ordinary bilateral blink', () => {
    const { motion, expressions } = fixture();
    advance(motion, 14.5);
    expect(expressions.getValue('blinkLeft')).toBe(1);
    expect(expressions.getValue('blink')).toBe(0);
    expect(expressions.getValue('kafSmileEyes')).toBe(0);
    expect(expressions.getValue('happy')).toBeCloseTo(0.45);
  });
});
