import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  __resetArtworkLoadCacheForTests,
  preloadArtwork,
} from '../src/pages/HomePage/components/artworkLoadCache';
import { createMediaFixture } from './fixtures/media';

const artwork = createMediaFixture({
  id: 'preload-artwork',
  src: '/fixtures/preload-artwork.webp',
  alt: '预加载测试图片',
  width: 1280,
  height: 720,
});

class FakeImage {
  static readonly instances: FakeImage[] = [];
  static failNextRequest = false;

  decoding = '';
  loading = '';
  fetchPriority = '';
  sizes = '';
  srcset = '';
  currentSrc = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private source = '';

  constructor() {
    FakeImage.instances.push(this);
  }

  get src() {
    return this.source;
  }

  set src(value: string) {
    this.source = value;
    this.currentSrc = value;
    const shouldFail = FakeImage.failNextRequest;
    FakeImage.failNextRequest = false;

    queueMicrotask(() => {
      if (shouldFail) {
        this.onerror?.();
      } else {
        this.onload?.();
      }
    });
  }
}

afterEach(() => {
  __resetArtworkLoadCacheForTests();
  FakeImage.instances.length = 0;
  FakeImage.failNextRequest = false;
  vi.unstubAllGlobals();
});

describe('artwork load cache', () => {
  it('issues one browser-selected responsive request with the requested context', async () => {
    vi.stubGlobal('Image', FakeImage);

    const firstResult = await preloadArtwork(artwork, {
      role: 'responsive',
      sizes: '(max-width: 40rem) 100vw, 40rem',
      fetchPriority: 'low',
    });
    const [image] = FakeImage.instances;

    expect(image).toMatchObject({
      decoding: 'async',
      loading: 'eager',
      fetchPriority: 'low',
      sizes: '(max-width: 40rem) 100vw, 40rem',
      src: artwork.display.src,
    });
    expect(image?.srcset).toBe(
      [
        artwork.thumbnail,
        artwork.medium,
        artwork.display,
        artwork.large,
        artwork.highDensity,
      ]
        .map((variant) => `${variant.src} ${variant.width}w`)
        .join(', '),
    );
    expect(firstResult).toContain(artwork.display.src);

    const cachedResult = await preloadArtwork(artwork, {
      role: 'responsive',
      sizes: '(max-width: 40rem) 100vw, 40rem',
      fetchPriority: 'low',
    });

    expect(cachedResult).toBe(firstResult);
    expect(FakeImage.instances).toHaveLength(1);
  });

  it('uses fixed-role sources and allows a failed request to be retried', async () => {
    vi.stubGlobal('Image', FakeImage);

    const thumbnailResult = await preloadArtwork(artwork, {
      role: 'thumbnail',
      fetchPriority: 'low',
    });
    expect(FakeImage.instances[0]).toMatchObject({
      src: artwork.thumbnail.src,
      srcset: '',
      sizes: '',
      fetchPriority: 'low',
    });
    expect(thumbnailResult).toContain(artwork.thumbnail.src);

    FakeImage.failNextRequest = true;
    await expect(
      preloadArtwork(artwork, {
        role: 'highDensity',
        fetchPriority: 'low',
      }),
    ).rejects.toThrow('Unable to preload highDensity artwork: preload-artwork');

    const retryResult = await preloadArtwork(artwork, {
      role: 'highDensity',
      fetchPriority: 'low',
    });
    expect(retryResult).toContain(artwork.highDensity.src);
    expect(FakeImage.instances).toHaveLength(3);
  });
});
