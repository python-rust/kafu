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
import { createMediaFixture } from './fixtures/media';

const chapters = [
  {
    id: 'origin',
    period: '2018',
    yearLabel: '2018',
    titleZh: '被发现的声音',
    originalTitle: '起源 / 発見',
    changeFrom: '网络中的投稿',
    changeTo: '第一次被看见',
    summary: 'Fixture summary for the first journey chapter.',
    theme: 'origin',
    milestones: [
      {
        date: '2018-01-01',
        label: 'Origin milestone',
        sourceUrl: 'https://example.com/origin-milestone',
      },
    ],
    primaryVisual: createMediaFixture({
      id: 'origin-visual',
      src: '/fixtures/origin.webp',
      alt: 'Origin visual',
      width: 1200,
      height: 1600,
      credit: 'Origin artist',
      sourceUrl: 'https://example.com/origin-visual',
    }),
  },
  {
    id: 'observation',
    period: '2019',
    yearLabel: '2019',
    titleZh: '从网络走向现场',
    originalTitle: '観測',
    changeFrom: '屏幕里的歌声',
    changeTo: '个人现场与首张专辑',
    summary: 'Fixture summary for the second journey chapter.',
    theme: 'observation',
    milestones: [
      {
        date: '2019-01-01',
        label: 'Observation milestone',
        sourceUrl: 'https://example.com/observation-milestone',
      },
    ],
    primaryVisual: createMediaFixture({
      id: 'observation-visual',
      src: '/fixtures/observation.webp',
      alt: 'Observation visual',
      width: 1200,
      height: 1600,
      credit: 'Observation artist',
      sourceUrl: 'https://example.com/observation-visual',
    }),
  },
  {
    id: 'rebuild',
    period: '2020–2021',
    yearLabel: '2020–2021',
    titleZh: '在无法相聚时重构舞台',
    originalTitle: '魔法 / 再構築',
    changeFrom: '无法按计划相聚',
    changeTo: '线上现场与重返会场',
    summary: 'Fixture summary for the third journey chapter.',
    theme: 'rebuild',
    milestones: [
      {
        date: '2020-01-01',
        label: 'Rebuild milestone',
        sourceUrl: 'https://example.com/rebuild-milestone',
      },
    ],
    primaryVisual: createMediaFixture({
      id: 'rebuild-visual',
      src: '/fixtures/rebuild.webp',
      alt: 'Rebuild visual',
      width: 1200,
      height: 1600,
      credit: 'Rebuild artist',
      sourceUrl: 'https://example.com/rebuild-visual',
    }),
    secondaryVisual: createMediaFixture({
      id: 'rebuild-secondary-visual',
      src: '/fixtures/rebuild-secondary.webp',
      alt: 'Rebuild secondary visual',
      width: 1600,
      height: 1200,
      credit: 'Secondary artist',
      sourceUrl: 'https://example.com/rebuild-secondary-visual',
    }),
  },
  {
    id: 'expansion',
    period: '2022–2023',
    yearLabel: '2022–2023',
    titleZh: '把虚拟歌声带进武道馆',
    originalTitle: '拡張',
    changeFrom: '网络与小型会场',
    changeTo: '武道馆与更大的表达',
    summary: 'Fixture summary for the fourth journey chapter.',
    theme: 'expansion',
    milestones: [
      {
        date: '2022-01-01',
        label: 'Expansion milestone',
        sourceUrl: 'https://example.com/expansion-milestone',
      },
    ],
    primaryVisual: createMediaFixture({
      id: 'expansion-visual',
      src: '/fixtures/expansion.webp',
      alt: 'Expansion visual',
      width: 1200,
      height: 1600,
      credit: 'Expansion artist',
      sourceUrl: 'https://example.com/expansion-visual',
    }),
  },
  {
    id: 'fable',
    period: '2024',
    yearLabel: '2024',
    titleZh: '进入创作的第二章',
    originalTitle: '寓話 / 第二章',
    changeFrom: '第一章的制作关系',
    changeTo: '新的创作体制与“廻花”',
    summary: 'Fixture summary for the fifth journey chapter.',
    theme: 'fable',
    milestones: [
      {
        date: '2024-01-01',
        label: 'Fable milestone',
        sourceUrl: 'https://example.com/fable-milestone',
      },
    ],
    primaryVisual: createMediaFixture({
      id: 'fable-visual',
      src: '/fixtures/fable.webp',
      alt: 'Fable visual',
      width: 1200,
      height: 1600,
      credit: 'Fable artist',
      sourceUrl: 'https://example.com/fable-visual',
    }),
  },
  {
    id: 'transcendent',
    period: '2025–2026',
    yearLabel: '2025–2026',
    titleZh: '走向更大的世界',
    originalTitle: '深愛',
    changeFrom: '日本国内的成长',
    changeTo: '海外活动与新的当下',
    summary: 'Fixture summary for the sixth journey chapter.',
    theme: 'transcendent',
    milestones: [
      {
        date: '2025-01-01',
        label: 'Transcendent milestone',
        sourceUrl: 'https://example.com/transcendent-milestone',
      },
    ],
    primaryVisual: createMediaFixture({
      id: 'transcendent-visual',
      src: '/fixtures/transcendent.webp',
      alt: 'Transcendent visual',
      width: 1200,
      height: 1600,
      credit: 'Transcendent artist',
      sourceUrl: 'https://example.com/transcendent-visual',
    }),
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
      name: '成长轨迹',
    });
    const articles = within(journey).getAllByRole('article');
    const headings = within(journey).getAllByRole('heading', { level: 3 });

    expect(articles).toHaveLength(6);
    expect(headings).toHaveLength(6);
    expect(headings.map((heading) => heading.textContent)).toEqual([
      '被发现的声音',
      '从网络走向现场',
      '在无法相聚时重构舞台',
      '把虚拟歌声带进武道馆',
      '进入创作的第二章',
      '走向更大的世界',
    ]);
    expect(within(journey).getAllByText('起源 / 発見')).toHaveLength(2);
    expect(within(journey).getAllByText('网络中的投稿')).toHaveLength(2);
    expect(within(journey).getAllByText('第一次被看见')).toHaveLength(2);
    expect(within(journey).queryByText(/CHAPTER/)).not.toBeInTheDocument();
  });

  it('exposes chapter navigation, milestone sources, and visual metadata', () => {
    const { container } = render(<JourneySection chapters={chapters} />);

    const navigation = screen.getByRole('navigation', {
      name: '花谱成长阶段',
    });
    const chapterLinks = within(navigation).getAllByRole('link');

    expect(chapterLinks).toHaveLength(6);
    expect(chapterLinks[0]).toHaveAttribute('href', '#journey-origin');
    expect(chapterLinks[0]).toHaveAttribute('aria-current', 'step');

    const originVisual = screen.getByRole('img', { name: 'Origin visual' });
    expect(originVisual).toHaveAttribute('width', '1200');
    expect(originVisual).toHaveAttribute('height', '1600');
    expect(originVisual).toHaveAttribute('loading', 'lazy');
    expect(originVisual).toHaveAttribute(
      'srcset',
      `${chapters[0].primaryVisual.display.src} 1x, ${chapters[0].primaryVisual.highDensity.src} 2x`,
    );

    expect(
      screen.queryByRole('link', {
        name: /Origin visual.*图片来源.*Origin artist/,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /Origin milestone的资料来源/,
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
        name: /Transcendent milestone的资料来源/,
      }),
    ).toBeInTheDocument();
  });
});
