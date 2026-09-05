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
        window.__avatarReview = { vrm, scene, camera, renderer, beforeOptimization: geometryStats(), geometryStats, get motion() { return motion; } };`,
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
  assert(modelEvidence.poses.leftHand[2] < modelEvidence.poses.hips[2]);
  assert(modelEvidence.poses.rightHand[2] < modelEvidence.poses.hips[2]);
  assert(
    initial.geometry.after.maxMorphTargets <
      initial.geometry.before.maxMorphTargets,
  );
  assert(initial.geometry.after.vertices < initial.geometry.before.vertices);

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
    const { vrm, renderer, camera, scene, motion } = window.__avatarReview;
    const { AmbientLight, DirectionalLight } =
      await import('/node_modules/three/build/three.module.js');
    motion.reset();
    vrm.update(0);
    const currentLights = scene.children.filter((child) => child.isLight);
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
    currentLights.forEach((light) => scene.remove(light));
    const ambient = new AmbientLight(0xffffff, 1.65);
    const key = new DirectionalLight(0xfff7f9, 2.25);
    key.position.set(-1.6, 2.7, -2.4);
    key.target.position.set(0, 1.25, 0);
    const fill = new DirectionalLight(0xb9dce8, 0.55);
    fill.position.set(2.4, 1.4, -1.2);
    fill.target.position.set(0, 1.2, 0);
    scene.add(ambient, key, key.target, fill, fill.target);
    const originalLighting = sample();
    motion.reset();
    vrm.update(0);
    renderer.render(scene, camera);
    return { current, originalLighting };
  });
  await page
    .getByTestId('kaf-avatar-stage')
    .screenshot({ path: `${output}/original-lighting.png` });
  assert.equal(comparison.current.calls, comparison.originalLighting.calls);
  assert.deepEqual(errors, []);
  const result = {
    modelEvidence,
    initial,
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
