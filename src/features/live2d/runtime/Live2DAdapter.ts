export interface Live2DPoint {
  x: number;
  y: number;
}

/**
 * Stable application boundary for an imperative character runtime.
 * Cubism-specific model, renderer and motion-manager objects must stay behind
 * this interface so React does not become coupled to a particular SDK version.
 */
export interface Live2DAdapter {
  mount(target: HTMLCanvasElement): Promise<void>;
  loadModel(modelUrl: string): Promise<void>;
  resize(width: number, height: number, devicePixelRatio: number): void;
  setPointerFocus(point: Live2DPoint): void;
  playMotion(group: string, index?: number): Promise<void>;
  setExpression(name: string): Promise<void>;
  setActive(active: boolean): void;
  dispose(): void;
}
