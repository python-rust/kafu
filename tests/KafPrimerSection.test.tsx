import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const motionPreference = vi.hoisted(() => ({ reduced: false }));

vi.mock('motion/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('motion/react')>();

  return {
    ...actual,
    useInView: () => false,
    useReducedMotion: () => motionPreference.reduced,
  };
});

import { KafPrimerSection } from '../src/pages/HomePage/sections/KafPrimerSection';
import { createMediaFixture } from './fixtures/media';

const beats = [
  {
    id: 'identity',
    title: '她是谁',
    statement: '一个从网络深处被发现的声音。',
    summary: '用于测试的人物身份说明。',
    visual: createMediaFixture({
      id: 'identity-visual',
      src: '/fixtures/identity.jpg',
      alt: '身份视觉图',
      width: 1600,
      height: 900,
    }),
  },
  {
    id: 'voice',
    title: '为什么特别',
    statement: '虚拟形象是入口，真正留下人的是声音。',
    summary: '用于测试的声音说明。',
    visual: createMediaFixture({
      id: 'voice-visual',
      src: '/fixtures/voice.jpg',
      alt: '声音视觉图',
      width: 1600,
      height: 900,
    }),
  },
  {
    id: 'stage',
    title: '她走到了哪里',
    statement: '从屏幕里的歌，走进现实的大型舞台。',
    summary: '用于测试的舞台说明。',
    visual: createMediaFixture({
      id: 'stage-visual',
      src: '/fixtures/stage.jpg',
      alt: '舞台视觉图',
      width: 1600,
      height: 900,
    }),
  },
  {
    id: 'start',
    title: '从哪里开始',
    statement: '先听起点，再看现场，最后进入第二章。',
    summary: '用于测试的入门说明。',
    visual: createMediaFixture({
      id: 'start-visual',
      src: '/fixtures/start.jpg',
      alt: '入门视觉图',
      width: 1600,
      height: 900,
    }),
  },
] as const;

describe('KafPrimerSection', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    motionPreference.reduced = false;
  });

  it('renders four Chinese newcomer beats in source order', () => {
    render(<KafPrimerSection beats={beats} />);

    const section = screen.getByRole('region', { name: '认识花谱' });
    const articles = within(section).getAllByRole('article');
    const headings = within(section).getAllByRole('heading', { level: 3 });

    expect(articles).toHaveLength(4);
    expect(headings.map((heading) => heading.textContent)).toEqual([
      '她是谁',
      '为什么特别',
      '她走到了哪里',
      '从哪里开始',
    ]);
    expect(screen.getByTestId('primer-sticky-stage')).toBeInTheDocument();
    expect(
      within(section).getAllByText('一个从网络深处被发现的声音。'),
    ).toHaveLength(2);
    expect(
      within(section).getByRole('img', { name: '身份视觉图' }),
    ).toHaveAttribute('loading', 'lazy');
  });

  it('keeps every beat and image in normal flow for reduced-motion users', () => {
    motionPreference.reduced = true;

    render(<KafPrimerSection beats={beats} />);

    expect(screen.queryByTestId('primer-sticky-stage')).not.toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(4);

    for (const beat of beats) {
      expect(
        screen.getByRole('img', { name: beat.visual.alt }),
      ).toBeInTheDocument();
      expect(screen.getByText(beat.summary)).toBeVisible();
    }
  });
});
