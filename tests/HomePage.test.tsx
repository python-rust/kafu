import { fireEvent, render, screen, within } from '@testing-library/react';
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
  it('composes a Chinese-first KAF introduction with direct navigation and no template copy', () => {
    const { container } = renderHomePage();

    expect(
      screen.getByRole('heading', { level: 1, name: '花谱' }),
    ).toBeInTheDocument();

    const main = screen.getByRole('main');
    const sectionIds = Array.from(main.children)
      .filter((element) => element.tagName === 'SECTION')
      .map((element) => element.id);

    expect(sectionIds).toEqual([
      'top',
      'about',
      'journey',
      'works',
      'visuals',
      'links',
    ]);

    for (const heading of [
      '认识花谱',
      '成长轨迹',
      '代表作品',
      '视觉档案',
      '官方入口',
    ]) {
      expect(
        screen.getByRole('heading', { level: 2, name: heading }),
      ).toBeInTheDocument();
    }

    const journeySection = screen
      .getByRole('heading', { level: 2, name: '成长轨迹' })
      .closest('section');
    expect(journeySection).not.toBeNull();

    if (!journeySection) {
      throw new Error('Journey section was not rendered.');
    }

    const eraTabs = within(journeySection).getAllByRole('tab');
    expect(eraTabs).toHaveLength(6);
    expect(eraTabs.map((tab) => tab.textContent)).toEqual([
      '2018',
      '2019',
      '2020–2021',
      '2022–2023',
      '2024',
      '2025–2026',
    ]);
    expect(
      within(journeySection).getByRole('heading', {
        level: 3,
        name: '被发现的声音',
      }),
    ).toBeInTheDocument();

    fireEvent.mouseDown(
      within(journeySection).getByRole('tab', {
        name: '2020–2021：在无法相聚时重构舞台',
      }),
      { button: 0, ctrlKey: false },
    );
    expect(
      within(journeySection).getByRole('heading', {
        level: 3,
        name: '在无法相聚时重构舞台',
      }),
    ).toBeInTheDocument();

    const worksSection = screen
      .getByRole('heading', { level: 2, name: '代表作品' })
      .closest('section');
    expect(worksSection).not.toBeNull();

    if (!worksSection) {
      throw new Error('Works section was not rendered.');
    }

    for (const workTitle of ['深愛', '寓話', '狂想β', '魔法α', '観測α']) {
      expect(
        within(worksSection).getByRole('heading', { name: workTitle }),
      ).toBeInTheDocument();
    }

    expect(
      within(worksSection).getByRole('link', {
        name: /狂想β的官方页面/,
      }),
    ).toHaveAttribute(
      'href',
      'https://kaf.kamitsubaki.jp/discography/20230308/199/',
    );

    expect(
      screen.getByRole('link', {
        name: '官方网站：最新消息、日程与作品入口（在新窗口打开）',
      }),
    ).toHaveAttribute('href', 'https://kaf.kamitsubaki.jp/');
    expect(
      screen.getByRole('link', {
        name: /不可解\(再\).*资料来源/,
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
      ['认识花谱', '#about'],
      ['成长轨迹', '#journey'],
      ['代表作品', '#works'],
      ['视觉档案', '#visuals'],
      ['官方入口', '#links'],
    ]);

    const navigation = screen.getByRole('navigation', {
      name: '花谱观察站页面导航',
    });

    for (const [label, href] of expectedAnchors) {
      expect(
        within(navigation).getByRole('link', { name: label }),
      ).toHaveAttribute('href', href);
    }

    const footer = screen.getByRole('contentinfo');
    expect(
      within(footer).getByText(/这是一个面向中文读者的非官方、非营利粉丝页面/),
    ).toBeInTheDocument();
    expect(
      within(footer).getByText(
        '图片作者与制作：花譜 / PALOW. / 川サキケンジ / とり',
      ),
    ).toBeVisible();
    expect(within(footer).getByText('图片来源（9 项）')).toBeInTheDocument();
    expect(within(footer).getByText('资料来源（4 项）')).toBeInTheDocument();
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
      '她从网络里被听见',
      '这里用几分钟讲清',
      '一个从网络深处被发现的声音',
      '虚拟形象是入口',
      '从屏幕里的歌',
      '先听起点',
      '网络中的投稿',
      '第一次被看见',
    ];

    for (const copy of bannedCopy) {
      expect(
        screen.queryByText(copy, { exact: false }),
      ).not.toBeInTheDocument();
    }

    expect(container.querySelector('[class*="eyebrow"]')).toBeNull();
    expect(container.querySelector('[data-rhythm]')).toBeNull();
    expect(container.querySelector('#about')).not.toBeNull();
    expect(
      container.querySelector('[data-testid="primer-sticky-stage"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-testid="journey-sticky-stage"]'),
    ).toBeNull();
    expect(
      screen.getByText('日本虚拟歌手，KAMITSUBAKI STUDIO 旗下艺人。'),
    ).toBeInTheDocument();
    expect(screen.getByText('出道年龄')).toBeVisible();
    expect(screen.getByText('14 岁')).toBeVisible();
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
