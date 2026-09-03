import type { ResponsiveArtworkSource } from '../../src/pages/HomePage/components/ResponsiveArtwork';

interface MediaFixtureOptions {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  credit?: string;
  sourceUrl?: string;
}

export interface MediaFixture extends ResponsiveArtworkSource {
  credit: string;
  sourceUrl: string;
}

export function createMediaFixture({
  id,
  src,
  alt,
  width,
  height,
  credit = 'Fixture Artist',
  sourceUrl = 'https://example.com/media-source',
}: MediaFixtureOptions): MediaFixture {
  const thumbnailScale = 320 / Math.max(width, height);

  return {
    id,
    alt,
    display: {
      src: `${src}?display`,
      width,
      height,
    },
    highDensity: {
      src: `${src}?high-density`,
      width: width * 2,
      height: height * 2,
    },
    thumbnail: {
      src: `${src}?thumbnail`,
      width: Math.max(1, Math.round(width * thumbnailScale)),
      height: Math.max(1, Math.round(height * thumbnailScale)),
    },
    medium: {
      src: `${src}?medium`,
      width: Math.max(1, Math.round(width * 0.75)),
      height: Math.max(1, Math.round(height * 0.75)),
    },
    placeholderDataUrl:
      'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEAAUAmJaQAA3AA/vuUAAA=',
    large: {
      src: `${src}?large`,
      width: Math.max(1, Math.round(width * 1.5)),
      height: Math.max(1, Math.round(height * 1.5)),
    },
    credit,
    sourceUrl,
  };
}
