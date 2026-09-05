import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

// Optional local-model review, not part of the network-free CI suite.
// Run against `mise run dev`; instrumentation exists only in intercepted test
// responses and must never be exported by the shipped runtime.
const lock = JSON.parse(await readFile('src/content/kafAvatar.json', 'utf8'));
const output = '.local-assets/avatar-review';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*.vrm', (route) =>
    route.fulfill({
      path: lock.sourcePath,
      contentType: 'model/gltf-binary',
    }),
  );
  await page.route('**/KafVrmStage.tsx*', async (route) => {
    const response = await route.fetch();
    const source = await response.text();
    assert(
      source.includes('vrm = loadedVrm;'),
      'Review injection anchor missing',
    );
    await route.fulfill({
      response,
      body: source.replace(
        'vrm = loadedVrm;',
        `vrm = loadedVrm;
        const geometryStats = () => {
          const geometries = new Set();
          vrm.scene.traverse(node => { if (node.isMesh) geometries.add(node.geometry); });
          return { vertices: [...geometries].reduce((sum, geometry) => sum + geometry.attributes.position.count, 0), maxMorphTargets: Math.max(...[...geometries].map(geometry => geometry.morphAttributes.position?.length ?? 0)) };
        };
        const sourceSkinMaterials = (vrm.materials ?? [])
          .filter(material => /^kaf_(face|body)(?: \\(Outline\\))?$/.test(material.name))
          .map(material => ({ material, matcap: material.matcapFactor.clone(), toony: material.shadingToonyFactor, shift: material.shadingShiftFactor }));
        window.__avatarReview = { vrm, scene, camera, renderer, sourceSkinMaterials, beforeOptimization: geometryStats(), geometryStats, get motion() { return motion; } };`,
      ),
    });
  });
  await page.goto('http://127.0.0.1:5173/');
  await page.locator('#avatar').evaluate((element) => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(
      0,
      element.getBoundingClientRect().top + window.scrollY + 100,
    );
  });
  await page.waitForFunction(
    () =>
      document.querySelector('[data-testid="kaf-avatar-stage"]')?.dataset
        .status === 'ready',
    null,
    { timeout: 60000 },
  );
  await page.waitForTimeout(1000);

  const initial = await page.evaluate(() => {
    const { vrm, scene, renderer } = window.__avatarReview;
    return {
      draw: { ...renderer.info.render },
      geometry: {
        before: window.__avatarReview.beforeOptimization,
        after: window.__avatarReview.geometryStats(),
      },
      joints: vrm.springBoneManager.joints.size,
      skinMatcaps: window.__avatarReview.sourceSkinMaterials.map(
        ({ material, matcap }) => ({
          name: material.name,
          original: matcap.toArray(),
          current: material.matcapFactor.toArray(),
        }),
      ),
      lights: scene.children
        .filter((child) => child.isLight)
        .map((light) => ({
          type: light.type,
          intensity: light.intensity,
          position: light.position.toArray(),
        })),
      lookAt: vrm.lookAt?.autoUpdate,
      eyes: ['leftEye', 'rightEye'].map((name) =>
        vrm.humanoid.getRawBoneNode(name)?.quaternion.toArray(),
      ),
    };
  });
  assert.equal(initial.lookAt, false);
  assert.equal(initial.lights.length, 2);
  assert.equal(initial.skinMatcaps.length, 4);
  for (const material of initial.skinMatcaps) {
    assert.deepEqual(material.original, [1, 1, 1]);
    assert.deepEqual(material.current, [0, 0, 0]);
  }

  const canvas = page.getByTestId('kaf-vrm-canvas');
  const box = await canvas.boundingBox();
  assert(box);
  const state = () =>
    page.evaluate(() => {
      const { vrm, camera } = window.__avatarReview;
      const head = vrm.humanoid.getRawBoneNode('head');
      const point = head.getWorldPosition(head.position.clone());
      const projected = point.clone().project(camera);
      const direction = point
        .clone()
        .set(0, 0, -1)
        .applyQuaternion(head.getWorldQuaternion(head.quaternion.clone()));
      const facing = point
        .clone()
        .add(direction.multiplyScalar(0.2))
        .project(camera)
        .sub(projected);
      return {
        headX: (projected.x + 1) / 2,
        headY: (1 - projected.y) / 2,
        facing: facing.toArray(),
        head: head.quaternion.toArray(),
        gaze: { yaw: vrm.lookAt?.yaw, pitch: vrm.lookAt?.pitch },
        eyeLocalDirections: ['leftEye', 'rightEye'].map((name) => {
          const eye = vrm.humanoid.getRawBoneNode(name);
          return eye.position
            .clone()
            .set(0, 0, -1)
            .applyQuaternion(eye.quaternion)
            .toArray();
        }),
        eyes: ['leftEye', 'rightEye'].map((name) =>
          vrm.humanoid.getRawBoneNode(name)?.quaternion.toArray(),
        ),
        hair: Array.from(vrm.springBoneManager.joints)
          .filter((joint) => /hair/i.test(joint.bone.name))
          .map((joint) => joint.bone.quaternion.toArray()),
      };
    });
  const before = await state();
  await page.mouse.move(
    box.x + box.width * (before.headX + 0.22),
    box.y + box.height * before.headY,
  );
  await page.waitForTimeout(900);
  const right = await state();
  await page.mouse.move(
    box.x + box.width * (before.headX - 0.22),
    box.y + box.height * before.headY,
    { steps: 12 },
  );
  await page.waitForTimeout(900);
  const left = await state();
  assert.notDeepEqual(left.head, right.head);
  assert(
    left.facing[0] < 0 && right.facing[0] > 0,
    'Head must face the pointer, not away from it',
  );
  assert.notDeepEqual(left.eyes, right.eyes);
  assert(left.gaze.yaw < 0 && right.gaze.yaw > 0);
  assert(left.eyeLocalDirections.every((direction) => direction[0] > 0));
  assert(right.eyeLocalDirections.every((direction) => direction[0] < 0));
  assert(Math.abs(left.gaze.yaw) <= 20 && Math.abs(right.gaze.yaw) <= 20);
  assert.notDeepEqual(left.hair, right.hair);

  await page.mouse.move(
    box.x + box.width * before.headX,
    box.y + box.height * (before.headY - 0.16),
  );
  await page.waitForTimeout(900);
  const up = await state();
  await page.mouse.move(
    box.x + box.width * before.headX,
    box.y + box.height * (before.headY + 0.16),
  );
  await page.waitForTimeout(900);
  const down = await state();
  assert(
    up.eyeLocalDirections.every((direction) => direction[1] > 0),
    'Eyes must look up toward the pointer',
  );
  assert(
    down.eyeLocalDirections.every((direction) => direction[1] < 0),
    'Eyes must look down toward the pointer',
  );
  assert(Math.abs(up.gaze.pitch) <= 13.5 && Math.abs(down.gaze.pitch) <= 13.5);

  await page.mouse.move(1, 1);
  const frameTimes = await page.evaluate(async () => {
    const intervals = [];
    let last = performance.now();
    await new Promise((resolve) => {
      function tick(now) {
        intervals.push(now - last);
        last = now;
        if (intervals.length >= 90) resolve();
        else requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
    intervals.sort((a, b) => a - b);
    return { median: intervals[45], p95: intervals[85] };
  });
  await page
    .getByTestId('kaf-avatar-stage')
    .screenshot({ path: `${output}/presence.png` });

  await page.getByRole('button', { name: '查看模型清单' }).click();
  await page.getByRole('dialog', { name: '模型清单' }).waitFor();
  const pausedFrame = await page.evaluate(
    () => window.__avatarReview.renderer.info.render.frame,
  );
  await page.waitForTimeout(350);
  assert.equal(
    await page.evaluate(() => window.__avatarReview.renderer.info.render.frame),
    pausedFrame,
  );
  await page.getByRole('dialog').screenshot({ path: `${output}/manifest.png` });
  await page.keyboard.press('Escape');
  await page.waitForFunction(
    (previous) => window.__avatarReview.renderer.info.render.frame > previous,
    pausedFrame,
  );

  // Freeze only the test page to inspect authored full-face expressions and
  // rendering cost without changing the production lifecycle.
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const hiddenFrame = await page.evaluate(
    () => window.__avatarReview.renderer.info.render.frame,
  );
  await page.waitForTimeout(250);
  assert.equal(
    await page.evaluate(() => window.__avatarReview.renderer.info.render.frame),
    hiddenFrame,
  );

  const modelEvidence = await page.evaluate(async () => {
    const { vrm, renderer, motion } = window.__avatarReview;
    motion.reset();
    vrm.update(0);
    const gl = renderer.getContext();
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    const cadence = [];
    let last = performance.now();
    await new Promise((resolve) => {
      function tick(now) {
        cadence.push(now - last);
        last = now;
        if (cadence.length >= 30) resolve();
        else requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
    cadence.sort((a, b) => a - b);
    const poses = Object.fromEntries(
      [
        'head',
        'hips',
        'leftLowerArm',
        'rightLowerArm',
        'leftHand',
        'rightHand',
      ].map((name) => {
        const node = vrm.humanoid.getRawBoneNode(name);
        return [name, node.getWorldPosition(node.position.clone()).toArray()];
      }),
    );
    const smile = vrm.expressionManager.getExpression('kafSmileEyes');
    vrm.expressionManager.setValue('kafSmileEyes', 1);
    vrm.update(0);
    const smileBindings = smile.binds.flatMap((bind) =>
      bind.primitives.map((mesh) => ({
        index: bind.index,
        weight: mesh.morphTargetInfluences[bind.index],
        hasPositionTarget: !!mesh.geometry.morphAttributes.position[bind.index],
      })),
    );
    motion.reset();
    vrm.update(0);
    return {
      renderer: debug
        ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER),
      pausedRafMedian: cadence[15],
      poses,
      smileBindings,
    };
  });
  assert(
    modelEvidence.smileBindings.length > 0,
    'Authored curved-eye target must survive optimization',
  );
  assert(
    modelEvidence.smileBindings.every(
      (bind) => bind.hasPositionTarget && bind.weight === 1,
    ),
  );
  for (const [side, sign] of [
    ['left', -1],
    ['right', 1],
  ]) {
    const hand = modelEvidence.poses[`${side}Hand`];
    const elbow = modelEvidence.poses[`${side}LowerArm`];
    assert(
      hand[1] < elbow[1] - 0.1,
      'Hand must stay below its elbow, not folded into the sleeve',
    );
    assert(
      (hand[0] - elbow[0]) * sign > 0.04,
      'Forearm must extend away from the torso',
    );
  }
  assert(
    initial.geometry.after.maxMorphTargets <
      initial.geometry.before.maxMorphTargets,
  );
  assert(initial.geometry.after.vertices < initial.geometry.before.vertices);

  // Bone positions alone missed the previous sleeve penetration. Capture the
  // complete posed model at tracking extrema; human review of garment/hand
  // silhouettes is required. The production camera remains unchanged.
  await page.evaluate(() => {
    const { camera } = window.__avatarReview;
    window.__avatarReview.bustCamera = camera.clone();
    const aspect = camera.right / camera.top;
    camera.position.y = 0.74;
    camera.top = 0.78;
    camera.bottom = -0.78;
    camera.left = -0.78 * aspect;
    camera.right = 0.78 * aspect;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  });
  const poseEvidence = [];
  for (const [label, x, y, frames, viewYaw = 0] of [
    ['initial', 0, 0, 0],
    ['rest', 0, 0, 180],
    ['left', -1, 0, 180],
    ['right', 1, 0, 180],
    ['upper-left', -1, 1, 180],
    ['upper-right', 1, 1, 180],
    ['lower-left', -1, -1, 180],
    ['lower-right', 1, -1, 180],
    ['oblique-left', -1, 0, 180, -0.45],
    ['oblique-right', 1, 0, 180, 0.45],
  ]) {
    const hands = await page.evaluate(
      ([x, y, frames, viewYaw]) => {
        const { vrm, motion, scene, camera, renderer } = window.__avatarReview;
        const distance = Math.abs(window.__avatarReview.bustCamera.position.z);
        camera.position.set(
          distance * Math.sin(viewYaw),
          0.74,
          -distance * Math.cos(viewYaw),
        );
        camera.lookAt(0, 0.74, 0);
        motion.reset();
        vrm.update(0);
        vrm.springBoneManager.reset();
        motion.setPointer(x, y);
        for (let i = 0; i < frames; i++) {
          motion.update(1 / 60);
          vrm.update(1 / 60);
        }
        vrm.scene.updateMatrixWorld(true);
        renderer.render(scene, camera);
        return ['left', 'right'].map((side) => {
          const hand = vrm.humanoid.getRawBoneNode(`${side}Hand`);
          const elbow = vrm.humanoid.getRawBoneNode(`${side}LowerArm`);
          return {
            side,
            hand: hand.getWorldPosition(hand.position.clone()).toArray(),
            elbow: elbow.getWorldPosition(elbow.position.clone()).toArray(),
          };
        });
      },
      [x, y, frames, viewYaw],
    );
    for (const { side, hand, elbow } of hands) {
      assert(hand[1] < elbow[1] - 0.1);
      assert((hand[0] - elbow[0]) * (side === 'left' ? -1 : 1) > 0.04);
    }
    poseEvidence.push({ label, hands });
    await page
      .getByTestId('kaf-avatar-stage')
      .screenshot({ path: `${output}/safe-pose-${label}.png` });
  }
  await page.evaluate(() => {
    const r = window.__avatarReview;
    r.camera.copy(r.bustCamera);
    r.camera.updateMatrixWorld();
  });

  for (const expression of [
    'rest',
    'kafSmileEyes',
    'blinkLeft',
    'happy',
    'relaxed',
  ]) {
    await page.evaluate((name) => {
      const { vrm, scene, camera, renderer, motion } = window.__avatarReview;
      motion.reset();
      if (name !== 'rest') vrm.expressionManager.setValue(name, 1);
      if (name === 'kafSmileEyes' || name === 'blinkLeft')
        vrm.expressionManager.setValue('happy', 0.6);
      vrm.update(0);
      vrm.springBoneManager.reset();
      vrm.update(0);
      renderer.render(scene, camera);
    }, expression);
    await page
      .getByTestId('kaf-avatar-stage')
      .screenshot({ path: `${output}/${expression}.png` });
  }

  const comparison = await page.evaluate(async () => {
    const { vrm, renderer, camera, scene, motion, sourceSkinMaterials } =
      window.__avatarReview;
    motion.reset();
    vrm.update(0);
    const sample = () => {
      const durations = [];
      for (let i = 0; i < 45; i++) {
        const start = performance.now();
        motion.update(1 / 60);
        vrm.update(1 / 60);
        renderer.render(scene, camera);
        durations.push(performance.now() - start);
      }
      durations.sort((a, b) => a - b);
      return {
        calls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        medianCpuMs: durations[22],
        p95CpuMs: durations[42],
      };
    };
    const current = sample();
    const hemi = scene.children.find((light) => light.isHemisphereLight);
    const key = scene.children.find((light) => light.isDirectionalLight);
    hemi.intensity = 0.55;
    hemi.groundColor.setHex(0x55435a);
    key.intensity = 1.2;
    motion.reset();
    vrm.update(0);
    const head = vrm.humanoid
      .getRawBoneNode('head')
      .getWorldPosition(key.position.clone());
    const hips = vrm.humanoid
      .getRawBoneNode('hips')
      .getWorldPosition(key.position.clone());
    key.position.copy(key.target.position).add(
      head
        .clone()
        .set(-0.35, 1.75, -0.65)
        .multiplyScalar(head.y - hips.y),
    );
    for (const { material, matcap, toony, shift } of sourceSkinMaterials) {
      material.matcapFactor.copy(matcap);
      material.shadingToonyFactor = toony;
      material.shadingShiftFactor = shift;
    }
    const previousPresentation = sample();
    motion.reset();
    vrm.update(0);
    vrm.springBoneManager.reset();
    vrm.update(0);
    renderer.render(scene, camera);
    return { current, previousPresentation };
  });
  await page
    .getByTestId('kaf-avatar-stage')
    .screenshot({ path: `${output}/previous-presentation.png` });
  assert.equal(comparison.current.calls, comparison.previousPresentation.calls);
  assert.equal(
    comparison.current.triangles,
    comparison.previousPresentation.triangles,
  );
  assert.deepEqual(errors, []);
  const result = {
    modelEvidence,
    initial,
    poseEvidence,
    pointer: { before, left, right, up, down },
    frameTimes,
    comparison,
    errors,
  };
  await writeFile(`${output}/results.json`, JSON.stringify(result, null, 2));
  console.log(
    JSON.stringify(
      {
        initial,
        modelEvidence,
        pointerFacing: { left: left.facing, right: right.facing },
        frameTimes,
        comparison,
        errors,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
