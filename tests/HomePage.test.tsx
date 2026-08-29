import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { App } from '../src/app/App';

function renderHomePage() {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
}

describe('home page', () => {
  it('composes the final KAF journey with direct Japanese navigation and no template copy', () => {
    const { container } = renderHomePage();

    expect(
      screen.getByRole('heading', { level: 1, name: '花譜' }),
    ).toBeInTheDocument();

    const main = screen.getByRole('main');
    const sectionIds = Array.from(main.children)
      .filter((element) => element.tagName === 'SECTION')
      .map((element) => element.id);

    expect(sectionIds).toEqual(['top', 'journey', 'works', 'visuals', 'links']);

    for (const heading of ['軌跡', '作品', '視覚', '公式']) {
      expect(
        screen.getByRole('heading', { level: 2, name: heading }),
      ).toBeInTheDocument();
    }

    const journeySection = screen
      .getByRole('heading', { level: 2, name: '軌跡' })
      .closest('section');
    expect(journeySection).not.toBeNull();

    if (!journeySection) {
      throw new Error('Journey section was not rendered.');
    }

    for (const chapterTitle of [
      '起源 / 発見',
      '観測',
      '魔法 / 再構築',
      '拡張',
      '寓話 / 第二章',
      '深愛',
    ]) {
      expect(
        within(journeySection).getByRole('heading', {
          level: 3,
          name: chapterTitle,
        }),
      ).toBeInTheDocument();
    }

    const worksSection = screen
      .getByRole('heading', { level: 2, name: '作品' })
      .closest('section');
    expect(worksSection).not.toBeNull();

    if (!worksSection) {
      throw new Error('Works section was not rendered.');
    }

    for (const workTitle of ['深愛', '寓話', '魔法α', '観測α']) {
      expect(
        within(worksSection).getByRole('heading', { name: workTitle }),
      ).toBeInTheDocument();
    }

    expect(screen.getByRole('link', { name: /公式サイト/ })).toHaveAttribute(
      'href',
      'https://kaf.kamitsubaki.jp/',
    );
    expect(
      screen.getByRole('link', {
        name: /不可解\(再\).*出典/,
      }),
    ).toHaveAttribute(
      'href',
      'https://kaf.kamitsubaki.jp/schedule/20200323/574/',
    );
    expect(screen.getByRole('link', { name: /YouTube/ })).toHaveAttribute(
      'href',
      'https://www.youtube.com/channel/UCQ1U65-CQdIoZ2_NA4Z4F7A',
    );

    const expectedAnchors = new Map([
      ['軌跡', '#journey'],
      ['作品', '#works'],
      ['視覚', '#visuals'],
      ['公式', '#links'],
    ]);

    const navigation = screen.getByRole('navigation', {
      name: '花譜サイト内ナビゲーション',
    });

    for (const [label, href] of expectedAnchors) {
      expect(
        within(navigation).getByRole('link', { name: label }),
      ).toHaveAttribute('href', href);
    }

    const footer = screen.getByRole('contentinfo');
    expect(
      within(footer).getByText(
        '花譜およびKAMITSUBAKI STUDIOとは関係のない、非公式・非営利のファンサイトです。',
      ),
    ).toBeInTheDocument();
    expect(
      within(footer).getByText('画像：花譜 / PALOW. / 川サキケンジ / とり'),
    ).toBeVisible();
    expect(within(footer).getByText('画像出典（9件）')).toBeInTheDocument();
    expect(footer.querySelectorAll('#media-sources a')).toHaveLength(18);
    expect(
      main.querySelectorAll('a[href^="https://piapro.jp/t/"]'),
    ).toHaveLength(0);

    const bannedCopy = [
      'VOICE / IMAGE / MEMORY',
      'KAF / CHRONOLOGY',
      'KAF / SELECTED DISCOGRAPHY',
      'KAF / VISUAL NOTES',
      'KAF / OFFICIAL CHANNELS',
      'CURRENT WORK',
      'VISUAL CREDIT',
      '沿着时间向下阅读花譜的六个创作阶段。',
    ];

    for (const copy of bannedCopy) {
      expect(
        screen.queryByText(copy, { exact: false }),
      ).not.toBeInTheDocument();
    }

    expect(container.querySelector('[class*="eyebrow"]')).toBeNull();
    expect(container.querySelector('[data-rhythm]')).toBeNull();
    expect(container.querySelector('#about')).toBeNull();
  });

  it('uses all verified local visuals while only prioritizing the hero image', () => {
    const { container } = renderHomePage();
    const images = Array.from(container.querySelectorAll('img'));
    const uniqueSources = new Set(
      images.map((image) => image.getAttribute('src')),
    );
    const eagerImages = images.filter(
      (image) => image.getAttribute('loading') === 'eager',
    );

    expect(uniqueSources.size).toBeGreaterThanOrEqual(9);
    expect(eagerImages).toHaveLength(1);
    expect(eagerImages[0]).toHaveAttribute('fetchpriority', 'high');
    expect(eagerImages[0]?.getAttribute('src')).toContain('kaihou-2x');
    expect(eagerImages[0]?.getAttribute('srcset')).toContain('kaihou-4x');

    for (const image of images) {
      expect(Number(image.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(image.getAttribute('height'))).toBeGreaterThan(0);

      if (image !== eagerImages[0]) {
        expect(image).toHaveAttribute('loading', 'lazy');
        expect(image).not.toHaveAttribute('fetchpriority', 'high');
      }
    }
  });
});
