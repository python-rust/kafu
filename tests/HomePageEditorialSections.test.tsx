import { render, screen, within } from '@testing-library/react';
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
  it('renders a featured work, supporting works, and lazy intrinsic visuals', () => {
    render(<WorksSection works={works} />);

    const section = screen.getByRole('region', { name: 'Selected Works' });
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
        name: /Current Work official source.*opens in a new tab/i,
      }),
    ).toHaveAttribute('href', 'https://example.com/works/current');
  });

  it('keeps every gallery visual credited, sourced, and lazy-loaded', () => {
    render(<GallerySection visuals={visuals} />);

    const section = screen.getByRole('region', { name: 'Visual Archive' });
    expect(within(section).getAllByRole('figure')).toHaveLength(3);
    expect(
      within(section).getByText('Gallery Fixture Artist One'),
    ).toBeVisible();
    expect(
      within(section).getByText('Gallery Fixture Artist Two'),
    ).toBeVisible();
    expect(
      within(section).getByText('Gallery Fixture Artist Three'),
    ).toBeVisible();

    for (const visual of visuals) {
      const image = within(section).getByRole('img', { name: visual.alt });
      expect(image).toHaveAttribute('loading', 'lazy');
      expect(image).toHaveAttribute('width', String(visual.width));
      expect(image).toHaveAttribute('height', String(visual.height));
      expect(
        within(section).getByRole('link', {
          name: new RegExp(
            `${visual.title} visual source.*opens in a new tab`,
            'i',
          ),
        }),
      ).toHaveAttribute('href', visual.sourceUrl);
    }
  });

  it('directs changing information back to explicit official-source links', () => {
    render(<OfficialLinksSection links={officialLinks} />);

    const section = screen.getByRole('region', { name: 'Go to the source.' });
    expect(
      within(section).getByText(/新闻、日程、完整作品目录与社交动态/),
    ).toBeVisible();

    for (const link of officialLinks) {
      expect(
        within(section).getByRole('link', {
          name: new RegExp(`${link.label}: ${link.note}.*Official source`, 'i'),
        }),
      ).toHaveAttribute('href', link.href);
    }
  });

  it('states the fan-project disclaimer and exposes media provenance', () => {
    render(
      <SiteFooter
        projectLabel="KAF OBSERVATORY"
        mediaCreditsHref="/media-credits"
        curationLabel="CURATED / 2026"
      />,
    );

    const footer = screen.getByRole('contentinfo');
    expect(
      within(footer).getByText(/Unofficial, non-commercial fan project/i),
    ).toBeVisible();
    expect(
      within(footer).getByText(
        /Not affiliated with KAF or KAMITSUBAKI STUDIO/i,
      ),
    ).toBeVisible();
    expect(
      within(footer).getByRole('link', {
        name: 'Media credits & source provenance',
      }),
    ).toHaveAttribute('href', '/media-credits');
  });
});
