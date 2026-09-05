import { cleanup, render } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';

import KafVrmStage from '../src/pages/HomePage/sections/KafVrmStage';

const rendererState = vi.hoisted(() => ({
  contexts: new WeakMap<HTMLCanvasElement, { lost: boolean }>(),
  dispose: vi.fn(),
  forceContextLoss: vi.fn(),
}));

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>();
  return {
    ...actual,
    WebGLRenderer: class {
      context: { lost: boolean };
      renderLists = { dispose: vi.fn() };
      constructor({ canvas }: { canvas: HTMLCanvasElement }) {
        this.context = rendererState.contexts.get(canvas) ?? { lost: false };
        rendererState.contexts.set(canvas, this.context);
        if (this.context.lost)
          throw new Error('Cannot reuse a lost WebGL context');
      }
      setClearColor() {}
      setPixelRatio() {}
      setSize() {}
      dispose() {
        rendererState.dispose();
      }
      forceContextLoss() {
        this.context.lost = true;
        rendererState.forceContextLoss();
      }
    },
  };
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it('replays setup safely on the same StrictMode canvas and aborts both pending loads', () => {
  const signals: AbortSignal[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn((_url: string, { signal }: { signal: AbortSignal }) => {
      signals.push(signal);
      return new Promise<Response>(() => {});
    }),
  );
  const onError = vi.fn();
  const { unmount } = render(
    <StrictMode>
      <KafVrmStage
        modelUrl="/test.vrm"
        isActive
        motionEnabled
        onReady={vi.fn()}
        onError={onError}
        onProgress={vi.fn()}
      />
    </StrictMode>,
  );
  expect(signals).toHaveLength(2);
  expect(signals[0]?.aborted).toBe(true);
  expect(signals[1]?.aborted).toBe(false);
  expect(onError).not.toHaveBeenCalled();
  expect(rendererState.dispose).toHaveBeenCalledTimes(1);
  unmount();
  expect(signals.every((signal) => signal.aborted)).toBe(true);
  expect(rendererState.dispose).toHaveBeenCalledTimes(2);
  expect(rendererState.forceContextLoss).not.toHaveBeenCalled();
});
