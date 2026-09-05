import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import {
  Box3,
  DirectionalLight,
  HemisphereLight,
  MathUtils,
  OrthographicCamera,
  Scene,
  SRGBColorSpace,
  Timer,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useEffect, useRef } from 'react';

import { kafAvatarAsset } from '../../../content/kafAvatar';
import { applyKafSkinLighting } from './kafAvatarMaterials';
import { createKafAvatarMotion, type KafAvatarMotion } from './kafAvatarMotion';
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
    const projectedHead = new Vector3();
    let renderer: WebGLRenderer;

    try {
      renderer = new WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas,
        powerPreference: 'high-performance',
      });
    } catch (error) {
      timer.dispose();
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
    let motion: KafAvatarMotion | null = null;
    let animationFrame: number | null = null;
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

    scene.add(new HemisphereLight(0xfff4ee, 0x778091, 0.65));
    const keyLight = new DirectionalLight(0xfff4ee, 1.6);
    scene.add(keyLight, keyLight.target);

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

    function resetMotion(): void {
      motion?.reset();
      vrm?.update(0);
      vrm?.springBoneManager?.reset();
      vrm?.update(0);
    }

    function releasePointer(): void {
      motion?.releasePointer();
    }

    function handlePointerMove(event: PointerEvent): void {
      if (!shouldAnimate() || event.pointerType === 'touch') return;
      const head = vrm?.humanoid.getRawBoneNode('head');
      if (!head) return;

      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      head.getWorldPosition(projectedHead).project(camera);
      const headX = (projectedHead.x + 1) * 0.5;
      const headY = (1 - projectedHead.y) * 0.5;
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      // A screen-space head region avoids raycasting the full skinned mesh on
      // every pointer event. The camera stays fixed; touch scrolling is native.
      if (Math.abs(x - headX) > 0.42 || Math.abs(y - headY) > 0.3) {
        releasePointer();
        return;
      }
      motion?.setPointer(
        MathUtils.clamp((x - headX) / 0.3, -1, 1),
        MathUtils.clamp((headY - y) / 0.24, -1, 1),
      );
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
      motion?.update(delta);
      vrm?.update(delta);
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
        releasePointer();
        if (!activityRef.current.motionEnabled && documentVisible)
          renderStill();
      }
    }

    runtimeRef.current = { refresh };

    function handleVisibilityChange(): void {
      documentVisible = document.visibilityState !== 'hidden';
      refresh();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    canvas.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });
    canvas.addEventListener('pointerleave', releasePointer);
    canvas.addEventListener('pointercancel', releasePointer);

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
        applyKafSkinLighting(vrm.materials ?? []);
        // Official runtime optimizations preserve rendered geometry and the
        // authored expressions while removing unused vertex/morph work.
        VRMUtils.removeUnnecessaryVertices(vrm.scene);
        VRMUtils.combineSkeletons(vrm.scene);
        motion = createKafAvatarMotion(vrm);
        // Register the authored Blink_Smile target before removing unused
        // morphs, or that otherwise-unbound expression would be lost.
        VRMUtils.combineMorphs(vrm);
        vrm.update(0);
        scene.add(vrm.scene);
        vrm.scene.updateMatrixWorld(true);

        const bounds = new Box3().setFromObject(vrm.scene);
        const boundsSize = bounds.getSize(new Vector3());
        const boundsCenter = bounds.getCenter(new Vector3());

        const rawHead = vrm.humanoid.getRawBoneNode('head');
        const rawHips = vrm.humanoid.getRawBoneNode('hips');
        const headPosition = rawHead?.getWorldPosition(new Vector3());
        const hipsPosition = rawHips?.getWorldPosition(new Vector3());

        const lightScale =
          headPosition && hipsPosition
            ? Math.max(0.1, headPosition.y - hipsPosition.y)
            : Math.max(0.1, boundsSize.y * 0.35);
        keyLight.target.position.copy(headPosition ?? boundsCenter);
        keyLight.target.position.y -= lightScale * 0.15;
        keyLight.position
          .copy(keyLight.target.position)
          .add(new Vector3(-0.55, 1.8, -0.9).multiplyScalar(lightScale));

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
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', releasePointer);
      canvas.removeEventListener('pointercancel', releasePointer);
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
      // StrictMode replays this effect on the same canvas. Forcing context
      // loss here poisons the next renderer before that canvas is detached.
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
