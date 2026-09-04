import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import {
  AmbientLight,
  Box3,
  DirectionalLight,
  Euler,
  MathUtils,
  Object3D,
  OrthographicCamera,
  Quaternion,
  Scene,
  SRGBColorSpace,
  Timer,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useEffect, useRef } from 'react';

import { kafAvatarAsset } from '../../../content/kafAvatar';
import styles from './KafAvatarSection.module.css';

interface KafVrmStageProps {
  modelUrl: string;
  isActive: boolean;
  motionEnabled: boolean;
  onReady: () => void;
  onError: (error: Error) => void;
  onProgress: (progress: number | null) => void;
}

interface RuntimeController {
  refresh(): void;
}

interface RestBonePose {
  readonly node: Object3D;
  readonly quaternion: Quaternion;
}

async function fetchModelBuffer(
  modelUrl: string,
  signal: AbortSignal,
  onProgress: (progress: number | null) => void,
): Promise<ArrayBuffer> {
  const response = await fetch(modelUrl, { signal });

  if (!response.ok) {
    throw new Error(`模型请求失败（HTTP ${response.status}）`);
  }

  const contentLength = Number(response.headers.get('Content-Length'));
  const hasKnownLength =
    Number.isSafeInteger(contentLength) && contentLength > 0;

  if (!response.body || !hasKnownLength) {
    onProgress(null);
    return response.arrayBuffer();
  }

  let received = 0;
  onProgress(0);

  const trackedBody = response.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        received += chunk.byteLength;
        onProgress(Math.min(1, received / contentLength));
        controller.enqueue(chunk);
      },
    }),
  );

  const buffer = await new Response(trackedBody).arrayBuffer();
  onProgress(1);
  return buffer;
}

function createRestBonePose(
  vrm: VRM,
  name: 'head' | 'chest' | 'spine',
): RestBonePose | null {
  const node = vrm.humanoid.getNormalizedBoneNode(name);

  return node
    ? {
        node,
        quaternion: node.quaternion.clone(),
      }
    : null;
}

function applyLocalRotation(
  pose: RestBonePose | null,
  euler: Euler,
  workQuaternion: Quaternion,
): void {
  if (!pose) {
    return;
  }

  workQuaternion.setFromEuler(euler);
  pose.node.quaternion.copy(pose.quaternion).multiply(workQuaternion);
}

function resetBonePose(pose: RestBonePose | null): void {
  if (pose) {
    pose.node.quaternion.copy(pose.quaternion);
  }
}

function applyPresentationPose(vrm: VRM): void {
  const leftUpperArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
  const rightUpperArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
  const rotation = new Quaternion();

  if (leftUpperArm) {
    rotation.setFromEuler(new Euler(0, 0, 0.72));
    leftUpperArm.quaternion.multiply(rotation);
  }

  if (rightUpperArm) {
    rotation.setFromEuler(new Euler(0, 0, -0.72));
    rightUpperArm.quaternion.multiply(rotation);
  }

  vrm.update(0);
}

export default function KafVrmStage({
  modelUrl,
  isActive,
  motionEnabled,
  onReady,
  onError,
  onProgress,
}: KafVrmStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activityRef = useRef({ isActive, motionEnabled });
  const callbacksRef = useRef({ onReady, onError, onProgress });
  const runtimeRef = useRef<RuntimeController | null>(null);

  useEffect(() => {
    activityRef.current = { isActive, motionEnabled };
    runtimeRef.current?.refresh();
  }, [isActive, motionEnabled]);

  useEffect(() => {
    callbacksRef.current = { onReady, onError, onProgress };
  }, [onError, onProgress, onReady]);

  useEffect(() => {
    const canvasElement = canvasRef.current;

    if (!canvasElement) {
      return;
    }

    const canvas: HTMLCanvasElement = canvasElement;
    const abortController = new AbortController();
    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.01, 20);
    const timer = new Timer();
    timer.connect(document);
    const lookTarget = new Object3D();
    const workQuaternion = new Quaternion();
    let renderer: WebGLRenderer;

    try {
      renderer = new WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas,
        powerPreference: 'high-performance',
      });
    } catch (error) {
      callbacksRef.current.onError(
        error instanceof Error
          ? error
          : new Error('当前浏览器无法初始化 WebGL。'),
      );
      return;
    }

    let vrm: VRM | null = null;
    let cameraTargetX = 0;
    let cameraTargetY = kafAvatarAsset.camera.targetY;
    let cameraTargetZ = 0;
    let cameraViewHeight = kafAvatarAsset.camera.viewHeight;
    let headPose: RestBonePose | null = null;
    let chestPose: RestBonePose | null = null;
    let spinePose: RestBonePose | null = null;
    let animationFrame: number | null = null;
    let elapsed = 0;
    let nextBlinkAt = 2.4;
    let blinkStartedAt: number | null = null;
    let disposed = false;
    let documentVisible = document.visibilityState !== 'hidden';
    let resizeObserver: ResizeObserver | null = null;

    renderer.outputColorSpace = SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    camera.position.set(
      0,
      kafAvatarAsset.camera.targetY,
      -kafAvatarAsset.camera.distance,
    );
    camera.lookAt(new Vector3(0, kafAvatarAsset.camera.targetY, 0));

    scene.add(lookTarget);
    scene.add(new AmbientLight(0xffffff, 1.65));

    const keyLight = new DirectionalLight(0xfff7f9, 2.25);
    keyLight.position.set(-1.6, 2.7, -2.4);
    keyLight.target.position.set(0, 1.25, 0);
    scene.add(keyLight, keyLight.target);

    const fillLight = new DirectionalLight(0xb9dce8, 0.55);
    fillLight.position.set(2.4, 1.4, -1.2);
    fillLight.target.position.set(0, 1.2, 0);
    scene.add(fillLight, fillLight.target);

    function resize(): void {
      const width = Math.max(1, Math.round(canvas.clientWidth));
      const height = Math.max(1, Math.round(canvas.clientHeight));
      const pixelRatioLimit = width < 640 ? 1.25 : 1.75;
      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        pixelRatioLimit,
      );
      const aspect = width / height;
      const halfHeight = cameraViewHeight / 2;

      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      camera.left = -halfHeight * aspect;
      camera.right = halfHeight * aspect;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();

      if (vrm) {
        renderer.render(scene, camera);
      }
    }

    function setBlinkWeight(weight: number): void {
      vrm?.expressionManager?.setValue(
        kafAvatarAsset.expressions.blink,
        MathUtils.clamp(weight, 0, 1),
      );
    }

    function updateBlink(delta: number): void {
      if (blinkStartedAt === null && elapsed >= nextBlinkAt) {
        blinkStartedAt = elapsed;
      }

      if (blinkStartedAt === null) {
        setBlinkWeight(0);
        return;
      }

      const duration = 0.18;
      const progress = (elapsed - blinkStartedAt) / duration;

      if (progress >= 1) {
        blinkStartedAt = null;
        nextBlinkAt = elapsed + 3.2 + (Math.sin(elapsed * 0.71) + 1) * 1.45;
        setBlinkWeight(0);
        return;
      }

      const weight = Math.sin(Math.PI * MathUtils.clamp(progress, 0, 1));
      setBlinkWeight(weight * weight);

      // Keep the expression manager advancing even when the render loop has a
      // heavily clamped delta after a background-tab resume.
      void delta;
    }

    function updateMotion(delta: number): void {
      if (!vrm) {
        return;
      }

      elapsed += delta;
      const breath = Math.sin(elapsed * 1.42);
      const headYaw = Math.sin(elapsed * 0.43) * 0.026;
      const headPitch = Math.sin(elapsed * 0.31 + 0.8) * 0.012;
      const headRoll = Math.sin(elapsed * 0.24 + 1.4) * 0.009;

      applyLocalRotation(
        headPose,
        new Euler(headPitch, headYaw, headRoll, 'YXZ'),
        workQuaternion,
      );
      applyLocalRotation(
        chestPose,
        new Euler(breath * 0.004, -headYaw * 0.22, breath * 0.003, 'YXZ'),
        workQuaternion,
      );
      applyLocalRotation(
        spinePose,
        new Euler(breath * 0.002, headYaw * 0.12, -breath * 0.002, 'YXZ'),
        workQuaternion,
      );

      lookTarget.position.set(
        cameraTargetX + Math.sin(elapsed * 0.29) * cameraViewHeight * 0.075,
        cameraTargetY +
          cameraViewHeight * 0.14 +
          Math.sin(elapsed * 0.21) * cameraViewHeight * 0.028,
        camera.position.z,
      );

      updateBlink(delta);
      vrm.update(delta);
    }

    function resetMotion(): void {
      resetBonePose(headPose);
      resetBonePose(chestPose);
      resetBonePose(spinePose);
      setBlinkWeight(0);
      lookTarget.position.set(
        cameraTargetX,
        cameraTargetY + cameraViewHeight * 0.14,
        camera.position.z,
      );
      vrm?.springBoneManager?.reset();
      vrm?.update(0);
    }

    function shouldAnimate(): boolean {
      const activity = activityRef.current;
      return (
        Boolean(vrm) &&
        activity.isActive &&
        activity.motionEnabled &&
        documentVisible
      );
    }

    function stopLoop(): void {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    }

    function renderStill(): void {
      if (!vrm || disposed) {
        return;
      }

      resetMotion();
      renderer.render(scene, camera);
    }

    function frame(timestamp: number): void {
      animationFrame = null;

      if (!shouldAnimate() || disposed) {
        return;
      }

      timer.update(timestamp);
      const delta = Math.min(timer.getDelta(), 0.05);
      updateMotion(delta);
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(frame);
    }

    function refresh(): void {
      if (!vrm || disposed) {
        return;
      }

      if (shouldAnimate()) {
        if (animationFrame === null) {
          timer.reset();
          animationFrame = requestAnimationFrame(frame);
        }
      } else {
        stopLoop();
        renderStill();
      }
    }

    runtimeRef.current = { refresh };

    function handleVisibilityChange(): void {
      documentVisible = document.visibilityState !== 'hidden';
      refresh();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (typeof ResizeObserver === 'function') {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
    } else {
      window.addEventListener('resize', resize);
    }
    resize();

    async function load(): Promise<void> {
      try {
        const buffer = await fetchModelBuffer(
          modelUrl,
          abortController.signal,
          (progress) => callbacksRef.current.onProgress(progress),
        );

        if (disposed) {
          return;
        }

        const loader = new GLTFLoader();
        loader.register((parser) => new VRMLoaderPlugin(parser));
        const sourceUrl = new URL(modelUrl, window.location.href);
        const gltf = await loader.parseAsync(
          buffer,
          new URL('.', sourceUrl).href,
        );
        const loadedVrm = gltf.userData.vrm;

        if (!(loadedVrm instanceof VRM)) {
          throw new Error('文件中没有可用的 VRM 模型数据。');
        }

        if (disposed) {
          VRMUtils.deepDispose(loadedVrm.scene);
          return;
        }

        loadedVrm.scene.traverse((object) => {
          object.frustumCulled = false;
        });

        vrm = loadedVrm;
        applyPresentationPose(vrm);
        headPose = createRestBonePose(vrm, 'head');
        chestPose = createRestBonePose(vrm, 'chest');
        spinePose = createRestBonePose(vrm, 'spine');
        scene.add(vrm.scene);
        vrm.scene.updateMatrixWorld(true);

        const bounds = new Box3().setFromObject(vrm.scene);
        const boundsSize = bounds.getSize(new Vector3());
        const boundsCenter = bounds.getCenter(new Vector3());

        const rawHead = vrm.humanoid.getRawBoneNode('head');
        const rawHips = vrm.humanoid.getRawBoneNode('hips');
        const headPosition = rawHead?.getWorldPosition(new Vector3());
        const hipsPosition = rawHips?.getWorldPosition(new Vector3());

        if (headPosition && hipsPosition && headPosition.y > hipsPosition.y) {
          const torsoHeight = headPosition.y - hipsPosition.y;
          const bustTop = Math.min(
            bounds.max.y + torsoHeight * 0.05,
            headPosition.y + torsoHeight * 0.46,
          );
          const bustBottom = Math.max(
            bounds.min.y,
            hipsPosition.y + torsoHeight * 0.04,
          );

          cameraTargetX = (headPosition.x + hipsPosition.x) / 2;
          cameraTargetY = (bustBottom + bustTop) / 2;
          cameraTargetZ = boundsCenter.z;
          cameraViewHeight = Math.max(0.3, (bustTop - bustBottom) * 1.03);
        } else if (
          Number.isFinite(boundsSize.y) &&
          boundsSize.y > 0.01 &&
          Number.isFinite(boundsCenter.y)
        ) {
          const bustBottom = bounds.min.y + boundsSize.y * 0.36;
          const bustTop = bounds.max.y + boundsSize.y * 0.025;
          cameraTargetX = boundsCenter.x;
          cameraTargetY = (bustBottom + bustTop) / 2;
          cameraTargetZ = boundsCenter.z;
          cameraViewHeight = Math.max(0.3, (bustTop - bustBottom) * 1.04);
        }

        camera.position.set(
          cameraTargetX,
          cameraTargetY,
          cameraTargetZ -
            Math.max(kafAvatarAsset.camera.distance, boundsSize.z + 1),
        );
        camera.lookAt(cameraTargetX, cameraTargetY, cameraTargetZ);
        lookTarget.position.set(
          cameraTargetX,
          cameraTargetY + cameraViewHeight * 0.14,
          camera.position.z,
        );
        if (vrm.lookAt) {
          vrm.lookAt.target = lookTarget;
        }
        vrm.springBoneManager?.reset();
        resize();
        renderStill();
        callbacksRef.current.onReady();
        refresh();
      } catch (error) {
        if (
          disposed ||
          (error instanceof DOMException && error.name === 'AbortError')
        ) {
          return;
        }

        callbacksRef.current.onError(
          error instanceof Error ? error : new Error('动态形象加载失败。'),
        );
      }
    }

    void load();

    return () => {
      disposed = true;
      abortController.abort();
      stopLoop();
      resizeObserver?.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', resize);
      runtimeRef.current = null;

      if (vrm) {
        if (vrm.lookAt) {
          vrm.lookAt.target = null;
        }
        scene.remove(vrm.scene);
        VRMUtils.deepDispose(vrm.scene);
      }

      timer.dispose();
      renderer.renderLists.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [modelUrl]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      aria-label="花谱动态三维形象"
      data-testid="kaf-vrm-canvas"
    />
  );
}
