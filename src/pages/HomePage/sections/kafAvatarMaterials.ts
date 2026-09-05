import { MToonMaterial } from '@pixiv/three-vrm';
import type { Material } from 'three';

const skinMaterialNames = new Set([
  'kaf_face',
  'kaf_face (Outline)',
  'kaf_body',
  'kaf_body (Outline)',
]);

/** One-time presentation adjustment for the locked KAF model, not an asset edit. */
export function applyKafSkinLighting(materials: readonly Material[]): void {
  for (const material of materials) {
    if (
      !(material instanceof MToonMaterial) ||
      !skinMaterialNames.has(material.name)
    ) {
      continue;
    }

    // The skin's additive camera-space matcap keeps the nose/neck glowing
    // even with all lights off. Preserve the maps/MToon shader, but remove
    // that contribution and soften the skin's narrow toon transition.
    material.matcapFactor.setRGB(0, 0, 0);
    material.shadingToonyFactor = 0.6;
    material.shadingShiftFactor = -0.1;
  }
}
