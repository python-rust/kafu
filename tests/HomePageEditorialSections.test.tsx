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
    visual: {
      src: 'https://example.com/media/current.jpg',
      alt: 'Featured KAF editorial artwork fixture.',
      width: 1600,
      height: 1000,
      credit: 'Fixture Artist',
      sourceUrl: 'https://example.com/media/current',
    },
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
    visual: {
      src: 'https://example.com/media/supporting.jpg',
      alt: 'Supporting KAF artwork fixture.',
      width: 1200,
      height: 900,
      credit: 'Supporting Fixture Artist',
      sourceUrl: 'https://example.com/media/supporting',
    },
  },
] as const;

const visuals = [
  {
    id: 'visual-one',
    title: 'Signal Portrait',
    src: 'https://example.com/gallery/one.jpg',
    alt: 'KAF portrait fixture with luminous signal lines.',
    width: 1200,
    height: 1600,
    credit: 'Gallery Fixture Artist One',
    sourceUrl: 'https://example.com/gallery/one',
  },
  {
    id: 'visual-two',
    title: 'Stage Field',
    src: 'https://example.com/gallery/two.jpg',
    alt: 'KAF stage fixture with a wide illuminated field.',
    width: 1600,
    height: 900,
    credit: 'Gallery Fixture Artist Two',
    sourceUrl: 'https://example.com/gallery/two',
  },
  {
    id: 'visual-three',
    title: 'Chapter Fragment',
    src: 'https://example.com/gallery/three.jpg',
    alt: 'KAF chapter artwork fixture with layered typography.',
    width: 1400,
    height: 1400,
    credit: 'Gallery Fixture Artist Three',
    sourceUrl: 'https://example.com/gallery/three',
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

    const section = screen.getByRole('region', { name: '作品' });
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
    expect(featuredImage).toHaveAttribute('width', '1600');
    expect(featuredImage).toHaveAttribute('height', '1000');

    expect(
      within(section).getByRole('link', {
        name: /Current Workの公式ページ/,
      }),
    ).toHaveAttribute('href', 'https://example.com/works/current');
    expect(within(section).queryByText('CURRENT WORK')).not.toBeInTheDocument();
  });

  it('uses one active gallery stage and updates it from source-ordered thumbnails', async () => {
    const { container } = render(<GallerySection visuals={visuals} />);

    const section = screen.getByRole('region', { name: '視覚' });
    const thumbnailButtons = within(section).getAllByRole('button', {
      name: /を表示$/,
    });

    expect(thumbnailButtons).toHaveLength(3);
    expect(
      thumbnailButtons.map((button) => button.getAttribute('aria-label')),
    ).toEqual([
      'Signal Portraitを表示',
      'Stage Fieldを表示',
      'Chapter Fragmentを表示',
    ]);
    expect(thumbnailButtons[0]).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(section).getByRole('button', {
        name: 'Signal Portraitを拡大表示',
      }),
    ).toBeInTheDocument();
    expect(
      within(section).getByRole('link', {
        name: /Signal Portraitの画像出典：Gallery Fixture Artist One/,
      }),
    ).toHaveAttribute('href', 'https://example.com/gallery/one');

    const secondThumbnail = thumbnailButtons[1];

    if (!secondThumbnail) {
      throw new Error('Second gallery thumbnail was not rendered.');
    }

    fireEvent.click(secondThumbnail);

    await waitFor(() => {
      expect(
        within(section).getByRole('button', { name: 'Stage Fieldを拡大表示' }),
      ).toBeInTheDocument();
    });
    expect(secondThumbnail).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(section).getByRole('link', {
        name: /Stage Fieldの画像出典：Gallery Fixture Artist Two/,
      }),
    ).toHaveAttribute('href', 'https://example.com/gallery/two');

    for (const image of container.querySelectorAll('img')) {
      expect(Number(image.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(image.getAttribute('height'))).toBeGreaterThan(0);
      expect(image).toHaveAttribute('loading', 'lazy');
    }
  });

  it('renders direct official destinations without explanatory filler copy', () => {
    render(<OfficialLinksSection links={officialLinks} />);

    const section = screen.getByRole('region', { name: '公式' });
    expect(
      within(section).queryByText(/新闻、日程、完整作品目录与社交动态/),
    ).not.toBeInTheDocument();

    for (const link of officialLinks) {
      expect(
        within(section).getByRole('link', {
          name: `${link.label}：${link.note}（新しいタブで開く）`,
        }),
      ).toHaveAttribute('href', link.href);
    }
  });

  it('states the fan-project disclaimer once and exposes media provenance', () => {
    render(
      <SiteFooter
        projectLabel="KAF OBSERVATORY"
        mediaCreditsHref="/media-credits"
      />,
    );

    const footer = screen.getByRole('contentinfo');
    expect(
      within(footer).getByText(
        '花譜およびKAMITSUBAKI STUDIOとは関係のない、非公式・非営利のファンサイトです。',
      ),
    ).toBeVisible();
    expect(
      within(footer).getByRole('link', { name: '画像出典' }),
    ).toHaveAttribute('href', '/media-credits');
  });
});
