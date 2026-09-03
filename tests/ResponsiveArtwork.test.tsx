import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { __resetArtworkLoadCacheForTests } from '../src/pages/HomePage/components/artworkLoadCache';
import { ResponsiveArtwork } from '../src/pages/HomePage/components/ResponsiveArtwork';
import { createMediaFixture } from './fixtures/media';

const artwork = createMediaFixture({
  id: 'slow-artwork',
  src: '/fixtures/slow-artwork.webp',
  alt: '弱网测试图片',
  width: 860,
  height: 484,
});

const originalComplete = Object.getOwnPropertyDescriptor(
  HTMLImageElement.prototype,
  'complete',
);
const originalNaturalWidth = Object.getOwnPropertyDescriptor(
  HTMLImageElement.prototype,
  'naturalWidth',
);
const originalDecode = Object.getOwnPropertyDescriptor(
  HTMLImageElement.prototype,
  'decode',
);

function stubImageState({
  complete,
  naturalWidth,
  decode,
}: {
  complete: boolean;
  naturalWidth: number;
  decode?: () => Promise<void>;
}) {
  Object.defineProperty(HTMLImageElement.prototype, 'complete', {
    configurable: true,
    get: () => complete,
  });
  Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {
    configurable: true,
    get: () => naturalWidth,
  });

  if (decode) {
    Object.defineProperty(HTMLImageElement.prototype, 'decode', {
      configurable: true,
      value: decode,
    });
  } else {
    Reflect.deleteProperty(HTMLImageElement.prototype, 'decode');
  }
}

function restoreImageState() {
  for (const [property, descriptor] of [
    ['complete', originalComplete],
    ['naturalWidth', originalNaturalWidth],
    ['decode', originalDecode],
  ] as const) {
    if (descriptor) {
      Object.defineProperty(HTMLImageElement.prototype, property, descriptor);
    } else {
      Reflect.deleteProperty(HTMLImageElement.prototype, property);
    }
  }
}

afterEach(() => {
  cleanup();
  restoreImageState();
  __resetArtworkLoadCacheForTests();
});

describe('ResponsiveArtwork', () => {
  it('shows an inline placeholder state until the responsive image loads', () => {
    stubImageState({ complete: false, naturalWidth: 0 });
    const { container } = render(
      <ResponsiveArtwork
        source={artwork}
        loading="lazy"
        fetchPriority="low"
        sizes="(max-width: 40rem) 100vw, 40rem"
      />,
    );

    const shell = container.querySelector('[data-artwork-id="slow-artwork"]');
    const image = screen.getByRole('img', { name: '弱网测试图片' });

    expect(shell).toHaveAttribute('data-artwork-status', 'loading');
    expect(shell).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('图片加载中')).toBeInTheDocument();
    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(image).toHaveAttribute(
      'srcset',
      `${artwork.thumbnail.src} ${artwork.thumbnail.width}w, ${artwork.medium.src} ${artwork.medium.width}w, ${artwork.display.src} ${artwork.display.width}w, ${artwork.large.src} ${artwork.large.width}w, ${artwork.highDensity.src} ${artwork.highDensity.width}w`,
    );
    expect(image).toHaveAttribute('sizes', '(max-width: 40rem) 100vw, 40rem');

    fireEvent.load(image);

    expect(shell).toHaveAttribute('data-artwork-status', 'loaded');
    expect(shell).not.toHaveAttribute('aria-busy');
  });

  it('reveals on load even when decode never settles', () => {
    const decode = vi.fn(
      () =>
        new Promise<void>(() => {
          // Intentionally unresolved: visibility must not depend on decode().
        }),
    );
    stubImageState({ complete: false, naturalWidth: 0, decode });
    const { container } = render(<ResponsiveArtwork source={artwork} />);
    const shell = container.querySelector('[data-artwork-id="slow-artwork"]');

    fireEvent.load(screen.getByRole('img', { name: '弱网测试图片' }));

    expect(shell).toHaveAttribute('data-artwork-status', 'loaded');
    expect(shell).not.toHaveAttribute('aria-busy');
    expect(decode).not.toHaveBeenCalled();
  });

  it('recognizes a complete cached image before paint without calling decode', () => {
    const decode = vi.fn().mockResolvedValue(undefined);
    stubImageState({ complete: true, naturalWidth: 1280, decode });
    const { container } = render(<ResponsiveArtwork source={artwork} />);
    const shell = container.querySelector('[data-artwork-id="slow-artwork"]');

    expect(shell).toHaveAttribute('data-artwork-status', 'loaded');
    expect(shell).not.toHaveAttribute('aria-busy');
    expect(decode).not.toHaveBeenCalled();
  });

  it('starts a remounted image in the loaded state from the exact request cache', () => {
    stubImageState({ complete: false, naturalWidth: 0 });
    const firstRender = render(
      <ResponsiveArtwork
        source={artwork}
        sizes="(max-width: 40rem) 100vw, 40rem"
      />,
    );
    fireEvent.load(screen.getByRole('img', { name: '弱网测试图片' }));
    firstRender.unmount();

    const secondRender = render(
      <ResponsiveArtwork
        source={artwork}
        sizes="(max-width: 40rem) 100vw, 40rem"
      />,
    );
    const shell = secondRender.container.querySelector(
      '[data-artwork-id="slow-artwork"]',
    );

    expect(shell).toHaveAttribute('data-artwork-status', 'loaded');
    expect(shell).not.toHaveAttribute('aria-busy');
  });

  it('does not reuse a responsive loaded-state record after the selection context changes', () => {
    stubImageState({ complete: false, naturalWidth: 0 });
    const initialWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390,
    });

    const firstRender = render(<ResponsiveArtwork source={artwork} />);
    fireEvent.load(screen.getByRole('img', { name: '弱网测试图片' }));
    firstRender.unmount();

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1440,
    });
    const secondRender = render(<ResponsiveArtwork source={artwork} />);
    const shell = secondRender.container.querySelector(
      '[data-artwork-id="slow-artwork"]',
    );

    expect(shell).toHaveAttribute('data-artwork-status', 'loading');

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: initialWidth,
    });
  });

  it('keeps the placeholder and reports a failed image request', () => {
    stubImageState({ complete: false, naturalWidth: 0 });
    const { container } = render(<ResponsiveArtwork source={artwork} />);
    const shell = container.querySelector('[data-artwork-id="slow-artwork"]');

    fireEvent.error(screen.getByRole('img', { name: '弱网测试图片' }));

    expect(shell).toHaveAttribute('data-artwork-status', 'error');
    expect(screen.getByText('图片加载失败')).toBeInTheDocument();
    expect(shell).not.toHaveAttribute('aria-busy');
  });
});
