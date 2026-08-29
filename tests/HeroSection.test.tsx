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
  return render(
    <HeroSection
      visual={visualFixture}
      statement="她从网络里被听见，也把虚拟歌声带进了现实舞台。"
      description="这里用几分钟讲清花谱是谁、她经历了什么，以及第一次认识她可以从哪里开始。"
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

    expect(
      screen.getByRole('heading', { level: 1, name: '花谱' }),
    ).toBeVisible();
    expect(screen.getByRole('img', { name: visualFixture.alt })).toBeVisible();
    expect(screen.getByRole('link', { name: /开始认识花谱/ })).toBeVisible();
    expect(screen.getByRole('link', { name: /查看成长轨迹/ })).toBeVisible();
  });

  it('renders direct KAF identity, responsive artwork, and both destinations without inline credits', () => {
    renderHero();

    expect(
      screen.getByRole('heading', { level: 1, name: '花谱' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('她从网络里被听见，也把虚拟歌声带进了现实舞台。'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        '这里用几分钟讲清花谱是谁、她经历了什么，以及第一次认识她可以从哪里开始。',
      ),
    ).toBeInTheDocument();

    const visual = screen.getByRole('img', { name: visualFixture.alt });
    expect(visual).toHaveAttribute('width', '1600');
    expect(visual).toHaveAttribute('height', '2000');
    expect(visual).toHaveAttribute(
      'srcset',
      `${visualFixture.display.src} 1x, ${visualFixture.highDensity.src} 2x`,
    );
    expect(visual).toHaveAttribute('fetchpriority', 'high');

    expect(screen.getByRole('link', { name: /开始认识花谱/ })).toHaveAttribute(
      'href',
      '#about',
    );
    expect(screen.getByRole('link', { name: /查看成长轨迹/ })).toHaveAttribute(
      'href',
      '#journey',
    );
    expect(screen.getByText(/日文名：/)).toHaveTextContent(
      '日文名：花譜 / KAF',
    );
    expect(
      screen.queryByRole('link', { name: /Fixture artist \/ source/ }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText('VOICE / IMAGE / MEMORY'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('UNOFFICIAL / NON-COMMERCIAL'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('ACTIVITY')).not.toBeInTheDocument();
  });
});
