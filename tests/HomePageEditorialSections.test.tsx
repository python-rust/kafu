import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GallerySection } from '../src/pages/HomePage/sections/GallerySection';
import { OfficialLinksSection } from '../src/pages/HomePage/sections/OfficialLinksSection';
import { SiteFooter } from '../src/pages/HomePage/sections/SiteFooter';
import { WorksSection } from '../src/pages/HomePage/sections/WorksSection';
import { createMediaFixture } from './fixtures/media';

const works = [
  {
    id: 'current-work',
    title: 'Current Work',
    releaseDate: '2026.05.27',
    releaseDateTime: '2026-05-27',
    kind: 'ALBUM',
    description: 'A production-shaped featured work fixture.',
    sourceUrl: 'https://example.com/works/current',
    featured: true,
    visual: createMediaFixture({
      id: 'current-work-visual',
      src: 'https://example.com/media/current.jpg',
      alt: 'Featured KAF editorial artwork fixture.',
      width: 1600,
      height: 1000,
      credit: 'Fixture Artist',
      sourceUrl: 'https://example.com/media/current',
    }),
  },
  {
    id: 'supporting-work-without-image',
    title: 'Typography Work',
    releaseDate: '2024.12.25',
    releaseDateTime: '2024-12-25',
    kind: 'ALBUM',
    description: 'A supporting work that intentionally has no visual.',
    sourceUrl: 'https://example.com/works/typography',
  },
  {
    id: 'supporting-work-with-image',
    title: 'Visual Work',
    releaseDate: '2020.11.25',
    releaseDateTime: '2020-11-25',
    kind: 'ALBUM',
    description: 'A supporting work with an independently credited visual.',
    sourceUrl: 'https://example.com/works/visual',
    visual: createMediaFixture({
      id: 'supporting-work-visual',
      src: 'https://example.com/media/supporting.jpg',
      alt: 'Supporting KAF artwork fixture.',
      width: 1200,
      height: 900,
      credit: 'Supporting Fixture Artist',
      sourceUrl: 'https://example.com/media/supporting',
    }),
  },
] as const;

const visuals = [
  {
    ...createMediaFixture({
      id: 'visual-one',
      src: 'https://example.com/gallery/one.jpg',
      alt: 'KAF portrait fixture with luminous signal lines.',
      width: 1200,
      height: 1600,
      credit: 'Gallery Fixture Artist One',
      sourceUrl: 'https://example.com/gallery/one',
    }),
    title: 'Signal Portrait',
  },
  {
    ...createMediaFixture({
      id: 'visual-two',
      src: 'https://example.com/gallery/two.jpg',
      alt: 'KAF stage fixture with a wide illuminated field.',
      width: 1600,
      height: 900,
      credit: 'Gallery Fixture Artist Two',
      sourceUrl: 'https://example.com/gallery/two',
    }),
    title: 'Stage Field',
  },
  {
    ...createMediaFixture({
      id: 'visual-three',
      src: 'https://example.com/gallery/three.jpg',
      alt: 'KAF chapter artwork fixture with layered typography.',
      width: 1400,
      height: 1400,
      credit: 'Gallery Fixture Artist Three',
      sourceUrl: 'https://example.com/gallery/three',
    }),
    title: 'Chapter Fragment',
  },
] as const;

const mediaSources = [
  {
    id: 'source-one',
    title: 'Signal Portrait',
    credit: '花譜 / PALOW. / 川サキケンジ',
    sourceUrl: 'https://example.com/gallery/one',
    licenseUrl: 'https://example.com/license',
  },
  {
    id: 'source-two',
    title: 'Portrait',
    credit: 'とり',
    sourceUrl: 'https://example.com/gallery/two',
    licenseUrl: 'https://example.com/license',
  },
] as const;

const referenceSources = [
  {
    id: 'profile',
    label: '花谱官方人物介绍',
    note: '身份与活动概况',
    href: 'https://example.com/profile',
  },
  {
    id: 'history',
    label: '花谱官方活动记录',
    note: '重要时间节点',
    href: 'https://example.com/history',
  },
] as const;

const officialLinks = [
  {
    label: 'News',
    note: 'Current announcements',
    href: 'https://example.com/news',
  },
  {
    label: 'Schedule',
    note: 'Current live and release schedule',
    href: 'https://example.com/schedule',
  },
  {
    label: 'Discography',
    note: 'Complete works catalogue',
    href: 'https://example.com/discography',
  },
  {
    label: 'Social',
    note: 'Current social updates',
    href: 'https://example.com/social',
  },
] as const;

describe('homepage editorial sections', () => {
  it('renders one featured work and a consistent supporting-work collection', () => {
    render(<WorksSection works={works} />);

    const section = screen.getByRole('region', { name: '代表作品' });
    expect(within(section).getAllByRole('article')).toHaveLength(3);
    expect(
      within(section).getByRole('heading', { name: 'Current Work' }),
    ).toBeInTheDocument();
    expect(
      within(section).getByRole('heading', { name: 'Typography Work' }),
    ).toBeInTheDocument();

    const featuredImage = within(section).getByRole('img', {
      name: 'Featured KAF editorial artwork fixture.',
    });
    expect(featuredImage).toHaveAttribute('loading', 'lazy');
    expect(featuredImage).toHaveAttribute('fetchpriority', 'auto');
    expect(featuredImage).toHaveAttribute('width', '1600');
    expect(featuredImage).toHaveAttribute('height', '1000');
    expect(featuredImage).toHaveAttribute(
      'srcset',
      `${works[0].visual.thumbnail.src} ${works[0].visual.thumbnail.width}w, ${works[0].visual.medium.src} ${works[0].visual.medium.width}w, ${works[0].visual.display.src} ${works[0].visual.display.width}w, ${works[0].visual.large.src} ${works[0].visual.large.width}w, ${works[0].visual.highDensity.src} ${works[0].visual.highDensity.width}w`,
    );
    expect(featuredImage).toHaveAttribute(
      'sizes',
      '(max-width: 48rem) calc(100vw - 2.5rem), (max-width: 88rem) 62vw, 52rem',
    );

    expect(
      within(section).getByRole('link', {
        name: /Current Work的官方页面/,
      }),
    ).toHaveAttribute('href', 'https://example.com/works/current');
    expect(within(section).queryByText('CURRENT WORK')).not.toBeInTheDocument();
  });

  it('uses one active gallery stage and updates it from source-ordered thumbnails', async () => {
    const { container } = render(<GallerySection visuals={visuals} />);

    const section = screen.getByRole('region', { name: '视觉档案' });
    const thumbnailButtons = within(section).getAllByRole('button', {
      name: /显示此图$/,
    });

    expect(thumbnailButtons).toHaveLength(3);
    expect(
      thumbnailButtons.map((button) => button.getAttribute('aria-label')),
    ).toEqual([
      'Signal Portrait，显示此图',
      'Stage Field，显示此图',
      'Chapter Fragment，显示此图',
    ]);
    expect(thumbnailButtons[0]).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(section).getByRole('button', {
        name: 'Signal Portrait，点击放大',
      }),
    ).toBeInTheDocument();
    expect(
      within(section).queryByRole('link', {
        name: /Signal Portrait.*图片来源/,
      }),
    ).not.toBeInTheDocument();

    const secondThumbnail = thumbnailButtons[1];

    if (!secondThumbnail) {
      throw new Error('Second gallery thumbnail was not rendered.');
    }

    fireEvent.click(secondThumbnail);

    await waitFor(() => {
      expect(
        within(section).getByRole('button', {
          name: 'Stage Field，点击放大',
        }),
      ).toBeInTheDocument();
    });
    expect(secondThumbnail).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(section).queryByRole('link', {
        name: /Stage Field.*图片来源/,
      }),
    ).not.toBeInTheDocument();

    const thumbnailImages = container.querySelectorAll(
      'img[data-media-variant="thumbnail"]',
    );
    expect(thumbnailImages.length).toBeGreaterThanOrEqual(visuals.length);

    for (const image of container.querySelectorAll('img')) {
      expect(Number(image.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(image.getAttribute('height'))).toBeGreaterThan(0);
      expect(image).toHaveAttribute('loading', 'lazy');
    }
  });

  it('renders direct official destinations without explanatory filler copy', () => {
    render(<OfficialLinksSection links={officialLinks} />);

    const section = screen.getByRole('region', { name: '官方入口' });
    expect(
      within(section).queryByText(/新闻、日程、完整作品目录与社交动态/),
    ).not.toBeInTheDocument();

    for (const link of officialLinks) {
      expect(
        within(section).getByRole('link', {
          name: `${link.label}：${link.note}（在新窗口打开）`,
        }),
      ).toHaveAttribute('href', link.href);
    }
  });

  it('states the fan-project disclaimer once and exposes media provenance', () => {
    render(
      <SiteFooter
        projectLabel="花谱观察站"
        mediaSources={mediaSources}
        referenceSources={referenceSources}
      />,
    );

    const footer = screen.getByRole('contentinfo');
    expect(
      within(footer).getByText(/这是一个面向中文读者的非官方、非营利粉丝页面/),
    ).toBeVisible();
    expect(
      within(footer).getByText(
        '图片作者与制作：花譜 / PALOW. / 川サキケンジ / とり',
      ),
    ).toBeVisible();
    expect(within(footer).getByText('图片来源（2 项）')).toBeInTheDocument();
    expect(within(footer).getByText('资料来源（2 项）')).toBeInTheDocument();
    expect(
      within(footer).getAllByRole('link', { name: /的作品页面/ }),
    ).toHaveLength(2);
  });
});
