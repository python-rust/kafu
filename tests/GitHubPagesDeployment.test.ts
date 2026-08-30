import { describe, expect, it } from 'vitest';

import { normalizeRouterBasename } from '../src/app/routerBase';

describe('GitHub Pages deployment', () => {
  it('normalizes local and repository-level router basenames', () => {
    expect(normalizeRouterBasename('/')).toBe('/');
    expect(normalizeRouterBasename('/kafu/')).toBe('/kafu');
    expect(normalizeRouterBasename('kafu/')).toBe('/kafu');
    expect(normalizeRouterBasename('')).toBe('/');
  });
});
