import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  HeroSection,
  type HeroVisual,
} from '../src/pages/HomePage/sections/HeroSection';

const visualFixture: HeroVisual = {
  src: '/fixture-kaf-visual.jpg',
  alt: 'Illustration of KAF standing beneath stage light',
  width: 1600,
  height: 2000,
  credit: 'Fixture artist / source',
  sourceUrl: 'https://example.com/kaf-visual-source',
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
  return render(
    <HeroSection
      visual={visualFixture}
      statement="我们沿着声音留下的信号，重新观看花譜的每一次变化。"
      description="A fan-written observation of voice, image, stage, and the chapters between them."
      officialUrl="https://kaf.kamitsubaki.jp/"
      metadata={[
        { label: 'Activity', value: 'Since 2018' },
        { label: 'Field', value: 'Voice / Visual / Story' },
      ]}
    />,
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('HeroSection', () => {
  it('keeps every essential hero element rendered for reduced-motion users', () => {
    stubReducedMotion(true);
    renderHero();

    expect(screen.getByRole('heading', { level: 1 })).toBeVisible();
    expect(screen.getByRole('img', { name: visualFixture.alt })).toBeVisible();
    expect(screen.getByRole('link', { name: /official site/i })).toBeVisible();
    expect(
      screen.getByRole('link', { name: /enter the journey/i }),
    ).toBeVisible();
    expect(screen.getByText('UNOFFICIAL / NON-COMMERCIAL')).toBeVisible();
  });

  it('renders KAF identity, fan status, visual provenance, and both hero destinations', () => {
    renderHero();

    expect(
      screen.getByRole('heading', { level: 1, name: /花譜\s*KAF/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('KAF Observatory')).toBeInTheDocument();
    expect(screen.getByText('UNOFFICIAL / NON-COMMERCIAL')).toBeInTheDocument();
    expect(
      screen.getByText('我们沿着声音留下的信号，重新观看花譜的每一次变化。'),
    ).toBeInTheDocument();

    const visual = screen.getByRole('img', { name: visualFixture.alt });
    expect(visual).toHaveAttribute('width', '1600');
    expect(visual).toHaveAttribute('height', '2000');

    expect(
      screen.getByRole('link', { name: /official site/i }),
    ).toHaveAttribute('href', 'https://kaf.kamitsubaki.jp/');
    expect(
      screen.getByRole('link', { name: /enter the journey/i }),
    ).toHaveAttribute('href', '#journey');
    expect(
      screen.getByRole('link', { name: /fixture artist \/ source/i }),
    ).toHaveAttribute('href', visualFixture.sourceUrl);
  });
});
