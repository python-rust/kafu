import { MToonMaterial } from '@pixiv/three-vrm';
import { MeshStandardMaterial, Texture } from 'three';
import { describe, expect, it } from 'vitest';

import {
  applyKafClothLighting,
  applyKafSkinLighting,
} from '../src/pages/HomePage/sections/kafAvatarMaterials';

describe('KAF skin lighting', () => {
  it('removes only the skin matcap contribution without replacing materials or textures', () => {
    for (const name of [
      'kaf_face',
      'kaf_body',
      'kaf_face (Outline)',
      'kaf_body (Outline)',
    ]) {
      const map = new Texture();
      const matcap = new Texture();
      const material = new MToonMaterial({ map, matcapTexture: matcap });
      material.name = name;
      const originalColor = material.color.clone();
      const originalShade = material.shadeColorFactor.clone();
      applyKafSkinLighting([material]);
      expect(material.matcapFactor.toArray()).toEqual([0, 0, 0]);
      expect(material.shadingToonyFactor).toBe(0.6);
      expect(material.shadingShiftFactor).toBe(-0.1);
      expect(material.map).toBe(map);
      expect(material.matcapTexture).toBe(matcap);
      expect(material.color.equals(originalColor)).toBe(true);
      expect(material.shadeColorFactor.equals(originalShade)).toBe(true);
      const version = material.version;
      applyKafSkinLighting([material, material]);
      expect(material.matcapFactor.toArray()).toEqual([0, 0, 0]);
      expect(material.version).toBe(version);
      material.dispose();
      map.dispose();
      matcap.dispose();
    }
  });

  it('preserves eyes, hair, cloth and unknown materials and handles no materials', () => {
    for (const name of [
      'kaf_eye',
      'kaf_hair',
      'kaf_hair (Outline)',
      'kaf_cloth',
      'other_face',
    ]) {
      const material = new MToonMaterial();
      material.name = name;
      const toony = material.shadingToonyFactor;
      const shift = material.shadingShiftFactor;
      applyKafSkinLighting([material]);
      expect(material.matcapFactor.toArray()).toEqual([1, 1, 1]);
      expect(material.shadingToonyFactor).toBe(toony);
      expect(material.shadingShiftFactor).toBe(shift);
      material.dispose();
    }
    const foreignMaterial = new MeshStandardMaterial({ name: 'kaf_face' });
    expect(() => applyKafSkinLighting([foreignMaterial])).not.toThrow();
    expect(foreignMaterial).not.toHaveProperty('matcapFactor');
    expect(() => applyKafSkinLighting([])).not.toThrow();
    foreignMaterial.dispose();
  });
});

describe('KAF cloth lighting', () => {
  it('reduces only the cloth matcap strength while preserving authored shading and maps', () => {
    for (const name of ['kaf_cloth', 'kaf_cloth (Outline)']) {
      const map = new Texture();
      const matcap = new Texture();
      const material = new MToonMaterial({ map, matcapTexture: matcap });
      material.name = name;
      material.shadingToonyFactor = 0.9;
      material.shadingShiftFactor = -0.2;
      const originalColor = material.color.clone();
      const originalShade = material.shadeColorFactor.clone();

      applyKafClothLighting([material]);

      expect(material.matcapFactor.toArray()).toEqual([0.6, 0.6, 0.6]);
      expect(material.shadingToonyFactor).toBe(0.9);
      expect(material.shadingShiftFactor).toBe(-0.2);
      expect(material.map).toBe(map);
      expect(material.matcapTexture).toBe(matcap);
      expect(material.color.equals(originalColor)).toBe(true);
      expect(material.shadeColorFactor.equals(originalShade)).toBe(true);
      const version = material.version;
      applyKafClothLighting([material, material]);
      expect(material.matcapFactor.toArray()).toEqual([0.6, 0.6, 0.6]);
      expect(material.version).toBe(version);

      material.dispose();
      map.dispose();
      matcap.dispose();
    }
  });

  it('preserves skin, eyes, hair and non-MToon materials', () => {
    for (const name of ['kaf_face', 'kaf_body', 'kaf_eye', 'kaf_hair']) {
      const material = new MToonMaterial();
      material.name = name;
      applyKafClothLighting([material]);
      expect(material.matcapFactor.toArray()).toEqual([1, 1, 1]);
      material.dispose();
    }

    const foreignMaterial = new MeshStandardMaterial({ name: 'kaf_cloth' });
    expect(() => applyKafClothLighting([foreignMaterial])).not.toThrow();
    expect(foreignMaterial).not.toHaveProperty('matcapFactor');
    expect(() => applyKafClothLighting([])).not.toThrow();
    foreignMaterial.dispose();
  });
});
