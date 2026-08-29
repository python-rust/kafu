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
      statement="歌、姿、舞台。花譜が重ねてきた変化を、作品と時間から辿る。"
      description="2018年から現在までの活動をまとめた私設アーカイブ。"
      officialUrl="https://kaf.kamitsubaki.jp/"
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
      screen.getByRole('heading', { level: 1, name: '花譜' }),
    ).toBeVisible();
    expect(screen.getByRole('img', { name: visualFixture.alt })).toBeVisible();
    expect(screen.getByRole('link', { name: /公式サイト/ })).toBeVisible();
    expect(screen.getByRole('link', { name: /軌跡を見る/ })).toBeVisible();
  });

  it('renders direct KAF identity, provenance, and both destinations without template metadata', () => {
    renderHero();

    expect(
      screen.getByRole('heading', { level: 1, name: '花譜' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        '歌、姿、舞台。花譜が重ねてきた変化を、作品と時間から辿る。',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('2018年から現在までの活動をまとめた私設アーカイブ。'),
    ).toBeInTheDocument();

    const visual = screen.getByRole('img', { name: visualFixture.alt });
    expect(visual).toHaveAttribute('width', '1600');
    expect(visual).toHaveAttribute('height', '2000');

    expect(screen.getByRole('link', { name: /公式サイト/ })).toHaveAttribute(
      'href',
      'https://kaf.kamitsubaki.jp/',
    );
    expect(screen.getByRole('link', { name: /軌跡を見る/ })).toHaveAttribute(
      'href',
      '#journey',
    );
    expect(
      screen.getByRole('link', { name: /Fixture artist \/ source/ }),
    ).toHaveAttribute('href', visualFixture.sourceUrl);

    expect(
      screen.queryByText('VOICE / IMAGE / MEMORY'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('UNOFFICIAL / NON-COMMERCIAL'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('ACTIVITY')).not.toBeInTheDocument();
  });
});
