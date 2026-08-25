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
  it('composes the final KAF phenomenon journey from production content', () => {
    const { container } = renderHomePage();

    expect(
      screen.getByRole('heading', { level: 1, name: /花譜.*KAF/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText('UNOFFICIAL FAN PROJECT / NON-COMMERCIAL').length,
    ).toBeGreaterThanOrEqual(2);

    const main = screen.getByRole('main');
    const sectionIds = Array.from(main.children)
      .filter((element) => element.tagName === 'SECTION')
      .map((element) => element.id);

    expect(sectionIds).toEqual(['top', 'journey', 'works', 'visuals', 'links']);

    expect(
      screen.getByRole('heading', { name: '声と景色、その六つの章。' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Selected Works' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Visual Archive' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Go to the source.' }),
    ).toBeInTheDocument();

    const journeySection = screen
      .getByRole('heading', { name: '声と景色、その六つの章。' })
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
      .getByRole('heading', { name: 'Selected Works' })
      .closest('section');
    expect(worksSection).not.toBeNull();

    if (!worksSection) {
      throw new Error('Selected Works section was not rendered.');
    }

    for (const workTitle of ['深愛', '寓話', '魔法α', '観測α']) {
      expect(
        within(worksSection).getByRole('heading', { name: workTitle }),
      ).toBeInTheDocument();
    }

    expect(screen.getByRole('link', { name: 'Official Site' })).toHaveAttribute(
      'href',
      'https://kaf.kamitsubaki.jp/',
    );
    expect(
      screen.getByRole('link', {
        name: /Milestone source:.*不可解\(再\)/,
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
      ['Journey', '#journey'],
      ['Works', '#works'],
      ['Gallery', '#visuals'],
      ['Official Links', '#links'],
    ]);

    for (const [label, href] of expectedAnchors) {
      expect(screen.getByRole('link', { name: label })).toHaveAttribute(
        'href',
        href,
      );
    }

    const footer = screen.getByRole('contentinfo');
    expect(
      within(footer).getByText(/Unofficial, non-commercial fan project/i),
    ).toBeInTheDocument();
    expect(
      within(footer).getByText(
        /Not affiliated with KAF or KAMITSUBAKI STUDIO/i,
      ),
    ).toBeInTheDocument();
    expect(
      within(footer).getByRole('link', {
        name: 'Media credits in Visual Archive',
      }),
    ).toHaveAttribute('href', '#visuals');

    expect(container.querySelector('#about')).toBeNull();
    expect(
      screen.queryByRole('heading', { name: '声が、風景を変えていく。' }),
    ).not.toBeInTheDocument();
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
