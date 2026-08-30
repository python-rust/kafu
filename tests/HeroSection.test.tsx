import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  HeroSection,
  type HeroVisual,
} from '../src/pages/HomePage/sections/HeroSection';
import { createMediaFixture } from './fixtures/media';

const visualFixture: HeroVisual = {
  ...createMediaFixture({
    id: 'hero-fixture',
    src: '/fixture-kaf-visual.jpg',
    alt: 'Illustration of KAF standing beneath stage light',
    width: 1600,
    height: 2000,
    credit: 'Fixture artist / source',
    sourceUrl: 'https://example.com/kaf-visual-source',
  }),
  objectPosition: '50% 28%',
};

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? matches : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

function renderHero() {
  return render(<HeroSection visual={visualFixture} />);
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('HeroSection', () => {
  it('keeps every essential hero element rendered for reduced-motion users', () => {
    stubReducedMotion(true);
    renderHero();

    expect(
      screen.getByRole('heading', { level: 1, name: '花谱' }),
    ).toBeVisible();
    expect(screen.getByRole('img', { name: visualFixture.alt })).toBeVisible();
    expect(screen.getByRole('link', { name: '人物介绍' })).toBeVisible();
    expect(screen.getByRole('link', { name: '代表作品' })).toBeVisible();
  });

  it('renders factual artist identity and direct destinations without page-explaining copy', () => {
    const { container } = renderHero();

    expect(
      screen.getByRole('heading', { level: 1, name: '花谱' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('日本虚拟歌手，KAMITSUBAKI STUDIO 旗下艺人。'),
    ).toBeInTheDocument();

    const visual = screen.getByRole('img', { name: visualFixture.alt });
    expect(visual).toHaveAttribute('width', '1600');
    expect(visual).toHaveAttribute('height', '2000');
    expect(visual).toHaveAttribute(
      'srcset',
      `${visualFixture.display.src} 1x, ${visualFixture.highDensity.src} 2x`,
    );
    expect(visual).toHaveAttribute('fetchpriority', 'high');

    const heroImages = container.querySelectorAll(
      'img[data-media-id="hero-fixture"]',
    );
    expect(heroImages).toHaveLength(2);
    expect(heroImages[0]).toHaveAttribute('data-media-variant', 'thumbnail');
    expect(heroImages[0]).toHaveAttribute('alt', '');
    expect(heroImages[0]).toHaveAttribute('aria-hidden', 'true');
    expect(heroImages[0]).toHaveAttribute('loading', 'lazy');
    expect(heroImages[0]).not.toHaveAttribute('srcset');
    expect(heroImages[1]).toHaveAttribute('data-media-variant', 'responsive');

    expect(screen.getByRole('link', { name: '人物介绍' })).toHaveAttribute(
      'href',
      '#about',
    );
    expect(screen.getByRole('link', { name: '代表作品' })).toHaveAttribute(
      'href',
      '#works',
    );
    expect(screen.getByText('花譜').parentElement).toHaveTextContent(
      '花譜 / KAF',
    );
    expect(
      screen.queryByRole('link', { name: /Fixture artist \/ source/ }),
    ).not.toBeInTheDocument();

    expect(screen.queryByText(/她从网络里被听见/)).not.toBeInTheDocument();
    expect(screen.queryByText(/这里用几分钟讲清/)).not.toBeInTheDocument();

    expect(
      screen.queryByText('VOICE / IMAGE / MEMORY'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('UNOFFICIAL / NON-COMMERCIAL'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('ACTIVITY')).not.toBeInTheDocument();
  });
});
