import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const motionPreference = vi.hoisted(() => ({ reduced: false }));

vi.mock('motion/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('motion/react')>();

  return {
    ...actual,
    useReducedMotion: () => motionPreference.reduced,
  };
});

import { JourneySection } from '../src/pages/HomePage/sections/JourneySection';
import { createMediaFixture } from './fixtures/media';

function chapterFixture(
  id: string,
  yearLabel: string,
  titleZh: string,
  theme:
    | 'origin'
    | 'observation'
    | 'rebuild'
    | 'expansion'
    | 'fable'
    | 'transcendent',
  index: number,
  secondary = false,
) {
  const chapter = {
    id,
    period: yearLabel,
    yearLabel,
    titleZh,
    summary: [`${titleZh}的第一段事实说明。`, `${titleZh}的第二段事实说明。`],
    theme,
    milestones: [
      {
        date: `${2018 + index}-01-01`,
        label: `${titleZh}关键节点`,
        sourceUrl: `https://example.com/${id}-milestone`,
      },
    ],
    primaryVisual: createMediaFixture({
      id: `${id}-visual`,
      src: `/fixtures/${id}.webp`,
      alt: `${titleZh}主视觉`,
      width: 1200,
      height: 1600,
    }),
  } as const;

  return secondary
    ? {
        ...chapter,
        secondaryVisual: createMediaFixture({
          id: `${id}-secondary-visual`,
          src: `/fixtures/${id}-secondary.webp`,
          alt: `${titleZh}辅助视觉`,
          width: 1600,
          height: 1200,
        }),
      }
    : chapter;
}

const chapters = [
  chapterFixture('origin', '2018', '被发现的声音', 'origin', 0),
  chapterFixture('observation', '2019', '从网络走向现场', 'observation', 1),
  chapterFixture(
    'rebuild',
    '2020–2021',
    '在无法相聚时重构舞台',
    'rebuild',
    2,
    true,
  ),
  chapterFixture(
    'expansion',
    '2022–2023',
    '把虚拟歌声带进武道馆',
    'expansion',
    3,
  ),
  chapterFixture('fable', '2024', '进入创作的第二章', 'fable', 4),
  chapterFixture(
    'transcendent',
    '2025–2026',
    '走向更大的世界',
    'transcendent',
    5,
  ),
] as const;

describe('JourneySection', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    motionPreference.reduced = true;
  });

  it('renders six chronological accessible tabs with one active era panel', () => {
    render(<JourneySection chapters={chapters} />);

    const journey = screen.getByRole('region', { name: '成长轨迹' });
    const tabList = within(journey).getByRole('tablist', {
      name: '花谱成长阶段',
    });
    const tabs = within(tabList).getAllByRole('tab');

    expect(tabs).toHaveLength(6);
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      '2018',
      '2019',
      '2020–2021',
      '2022–2023',
      '2024',
      '2025–2026',
    ]);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');

    const panel = within(journey).getByRole('tabpanel');
    expect(within(panel).getByRole('heading', { level: 3 })).toHaveTextContent(
      '被发现的声音',
    );
    expect(
      within(panel).getByText('被发现的声音的第一段事实说明。'),
    ).toBeVisible();
    expect(within(journey).queryByText('起源 / 発見')).not.toBeInTheDocument();
    expect(within(journey).queryByText('网络中的投稿')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('journey-sticky-stage'),
    ).not.toBeInTheDocument();
  });

  it('changes the active era through tab and previous/next controls', () => {
    render(<JourneySection chapters={chapters} />);

    const tabList = screen.getByRole('tablist', { name: '花谱成长阶段' });
    const rebuildTab = within(tabList).getByRole('tab', {
      name: '2020–2021：在无法相聚时重构舞台',
    });
    fireEvent.mouseDown(rebuildTab, { button: 0, ctrlKey: false });

    expect(rebuildTab).toHaveAttribute('aria-selected', 'true');
    let panel = screen.getByRole('tabpanel');
    expect(
      within(panel).getByRole('heading', {
        level: 3,
        name: '在无法相聚时重构舞台',
      }),
    ).toBeVisible();
    expect(
      within(panel).getByRole('img', { name: '在无法相聚时重构舞台主视觉' }),
    ).toHaveAttribute('loading', 'lazy');
    expect(
      within(panel).getByRole('img', { name: '在无法相聚时重构舞台辅助视觉' }),
    ).toBeVisible();
    expect(
      within(panel).getByRole('link', {
        name: /在无法相聚时重构舞台关键节点的资料来源/,
      }),
    ).toHaveAttribute('href', 'https://example.com/rebuild-milestone');

    fireEvent.click(
      within(panel).getByRole('button', {
        name: '下一阶段：把虚拟歌声带进武道馆',
      }),
    );
    panel = screen.getByRole('tabpanel');
    expect(
      within(panel).getByRole('heading', {
        level: 3,
        name: '把虚拟歌声带进武道馆',
      }),
    ).toBeVisible();

    fireEvent.click(
      within(panel).getByRole('button', {
        name: '上一阶段：在无法相聚时重构舞台',
      }),
    );
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: '在无法相聚时重构舞台',
      }),
    ).toBeVisible();
  });

  it('keeps the same tabs and factual panel content with reduced motion', () => {
    motionPreference.reduced = true;
    render(<JourneySection chapters={chapters} />);

    expect(screen.getAllByRole('tab')).toHaveLength(6);
    expect(screen.getByRole('tabpanel')).toBeVisible();
    expect(screen.getByText('被发现的声音的第二段事实说明。')).toBeVisible();

    const previous = screen.getByRole('button', { name: '已是第一个阶段' });
    expect(previous).toBeDisabled();
    expect(
      screen.getByRole('button', { name: '下一阶段：从网络走向现场' }),
    ).toBeEnabled();
  });
});
