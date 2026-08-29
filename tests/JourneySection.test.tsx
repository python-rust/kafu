import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const motionPreference = vi.hoisted(() => ({ reduced: false }));

vi.mock('motion/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('motion/react')>();

  function useReducedMotionMock() {
    return motionPreference.reduced;
  }

  return {
    ...actual,
    useReducedMotion: useReducedMotionMock,
  };
});

import { JourneySection } from '../src/pages/HomePage/sections/JourneySection';

const chapters = [
  {
    id: 'origin',
    period: '2018',
    yearLabel: '2018',
    titleJa: 'Origin',
    titleEn: 'Discovery',
    summary: 'Fixture summary for the first journey chapter.',
    theme: 'origin',
    milestones: [
      {
        date: '2018-01-01',
        label: 'Origin milestone',
        sourceUrl: 'https://example.com/origin-milestone',
      },
    ],
    primaryVisual: {
      src: '/fixtures/origin.webp',
      alt: 'Origin visual',
      width: 1200,
      height: 1600,
      credit: 'Origin artist',
      sourceUrl: 'https://example.com/origin-visual',
    },
  },
  {
    id: 'observation',
    period: '2019',
    yearLabel: '2019',
    titleJa: 'Observation',
    titleEn: 'Observation',
    summary: 'Fixture summary for the second journey chapter.',
    theme: 'observation',
    milestones: [
      {
        date: '2019-01-01',
        label: 'Observation milestone',
        sourceUrl: 'https://example.com/observation-milestone',
      },
    ],
    primaryVisual: {
      src: '/fixtures/observation.webp',
      alt: 'Observation visual',
      width: 1200,
      height: 1600,
      credit: 'Observation artist',
      sourceUrl: 'https://example.com/observation-visual',
    },
  },
  {
    id: 'rebuild',
    period: '2020–2021',
    yearLabel: '2020–2021',
    titleJa: 'Magic / Rebuilding',
    titleEn: 'Magic / Rebuilding',
    summary: 'Fixture summary for the third journey chapter.',
    theme: 'rebuild',
    milestones: [
      {
        date: '2020-01-01',
        label: 'Rebuild milestone',
        sourceUrl: 'https://example.com/rebuild-milestone',
      },
    ],
    primaryVisual: {
      src: '/fixtures/rebuild.webp',
      alt: 'Rebuild visual',
      width: 1200,
      height: 1600,
      credit: 'Rebuild artist',
      sourceUrl: 'https://example.com/rebuild-visual',
    },
    secondaryVisual: {
      src: '/fixtures/rebuild-secondary.webp',
      alt: 'Rebuild secondary visual',
      width: 1600,
      height: 1200,
      credit: 'Secondary artist',
      sourceUrl: 'https://example.com/rebuild-secondary-visual',
    },
  },
  {
    id: 'expansion',
    period: '2022–2023',
    yearLabel: '2022–2023',
    titleJa: 'Expansion',
    titleEn: 'Expansion',
    summary: 'Fixture summary for the fourth journey chapter.',
    theme: 'expansion',
    milestones: [
      {
        date: '2022-01-01',
        label: 'Expansion milestone',
        sourceUrl: 'https://example.com/expansion-milestone',
      },
    ],
    primaryVisual: {
      src: '/fixtures/expansion.webp',
      alt: 'Expansion visual',
      width: 1200,
      height: 1600,
      credit: 'Expansion artist',
      sourceUrl: 'https://example.com/expansion-visual',
    },
  },
  {
    id: 'fable',
    period: '2024',
    yearLabel: '2024',
    titleJa: 'Fable / Second Chapter',
    titleEn: 'Fable / Second Chapter',
    summary: 'Fixture summary for the fifth journey chapter.',
    theme: 'fable',
    milestones: [
      {
        date: '2024-01-01',
        label: 'Fable milestone',
        sourceUrl: 'https://example.com/fable-milestone',
      },
    ],
    primaryVisual: {
      src: '/fixtures/fable.webp',
      alt: 'Fable visual',
      width: 1200,
      height: 1600,
      credit: 'Fable artist',
      sourceUrl: 'https://example.com/fable-visual',
    },
  },
  {
    id: 'transcendent',
    period: '2025–2026',
    yearLabel: '2025–2026',
    titleJa: 'Transcendent Love',
    titleEn: 'Transcendent Love',
    summary: 'Fixture summary for the sixth journey chapter.',
    theme: 'transcendent',
    milestones: [
      {
        date: '2025-01-01',
        label: 'Transcendent milestone',
        sourceUrl: 'https://example.com/transcendent-milestone',
      },
    ],
    primaryVisual: {
      src: '/fixtures/transcendent.webp',
      alt: 'Transcendent visual',
      width: 1200,
      height: 1600,
      credit: 'Transcendent artist',
      sourceUrl: 'https://example.com/transcendent-visual',
    },
  },
] as const;

describe('JourneySection', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    motionPreference.reduced = false;
  });

  it('renders all six chapters in semantic chronological order', () => {
    render(<JourneySection chapters={chapters} />);

    const journey = screen.getByRole('region', {
      name: '声と景色、その六つの章。',
    });
    const articles = within(journey).getAllByRole('article');
    const headings = within(journey).getAllByRole('heading', { level: 3 });

    expect(articles).toHaveLength(6);
    expect(headings).toHaveLength(6);
    expect(headings.map((heading) => heading.textContent)).toEqual([
      'Origin',
      'Observation',
      'Magic / Rebuilding',
      'Expansion',
      'Fable / Second Chapter',
      'Transcendent Love',
    ]);
  });

  it('exposes chapter navigation, milestone sources, and visual metadata', () => {
    const { container } = render(<JourneySection chapters={chapters} />);

    const navigation = screen.getByRole('navigation', {
      name: 'KAF journey chapters',
    });
    const chapterLinks = within(navigation).getAllByRole('link');

    expect(chapterLinks).toHaveLength(6);
    expect(chapterLinks[0]).toHaveAttribute('href', '#journey-origin');
    expect(chapterLinks[0]).toHaveAttribute('aria-current', 'step');

    const originVisual = screen.getByRole('img', { name: 'Origin visual' });
    expect(originVisual).toHaveAttribute('width', '1200');
    expect(originVisual).toHaveAttribute('height', '1600');
    expect(originVisual).toHaveAttribute('loading', 'lazy');

    expect(
      screen.getByRole('link', { name: 'Visual source: Origin artist' }),
    ).toHaveAttribute('href', 'https://example.com/origin-visual');
    expect(
      screen.getByRole('link', {
        name: 'Milestone source: Origin milestone',
      }),
    ).toHaveAttribute('href', 'https://example.com/origin-milestone');
    const rebuildSecondaryVisual = screen.getByRole('img', {
      name: 'Rebuild secondary visual',
    });
    expect(rebuildSecondaryVisual).toHaveAttribute('loading', 'lazy');

    for (const journeyImage of container.querySelectorAll('img')) {
      expect(journeyImage).toHaveAttribute('loading', 'lazy');
      expect(journeyImage).toHaveAttribute('decoding', 'async');
    }
  });

  it('keeps the complete linear journey when reduced motion is requested', () => {
    motionPreference.reduced = true;

    render(<JourneySection chapters={chapters} />);

    expect(
      screen.queryByTestId('journey-sticky-stage'),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(6);
    expect(
      screen.getByText('Fixture summary for the sixth journey chapter.'),
    ).toBeVisible();
    const transcendentVisual = screen.getByRole('img', {
      name: 'Transcendent visual',
    });
    expect(transcendentVisual).toBeInTheDocument();
    expect(transcendentVisual).toHaveAttribute('loading', 'lazy');
    expect(
      screen.getByRole('link', {
        name: 'Milestone source: Transcendent milestone',
      }),
    ).toBeInTheDocument();
  });
});
