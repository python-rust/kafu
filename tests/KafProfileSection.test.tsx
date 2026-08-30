import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { KafProfileSection } from '../src/pages/HomePage/sections/KafProfileSection';
import { createMediaFixture } from './fixtures/media';

const profile = {
  paragraphs: [
    '花谱是 KAMITSUBAKI STUDIO 旗下的日本虚拟歌手。2018 年，她在 14 岁时开始活动。',
    '她以原创歌曲、专辑和个人演唱会为主要活动形式。',
  ],
  facts: [
    { label: '开始活动', value: '2018 年' },
    { label: '出道年龄', value: '14 岁' },
    { label: '所属', value: 'KAMITSUBAKI STUDIO' },
    { label: '主要活动', value: '原创音乐与个人演唱会' },
  ],
  visual: createMediaFixture({
    id: 'profile-visual',
    src: '/fixtures/profile.jpg',
    alt: '花谱人物视觉图',
    width: 1600,
    height: 900,
  }),
} as const;

describe('KafProfileSection', () => {
  it('renders one factual profile with a semantic fact list', () => {
    const { container } = render(<KafProfileSection profile={profile} />);
    const section = screen.getByRole('region', { name: '认识花谱' });

    expect(within(section).getAllByRole('heading')).toHaveLength(1);
    expect(within(section).getByText(profile.paragraphs[0])).toBeVisible();
    expect(within(section).getByText(profile.paragraphs[1])).toBeVisible();

    for (const fact of profile.facts) {
      expect(within(section).getByText(fact.label)).toBeVisible();
      expect(within(section).getByText(fact.value)).toBeVisible();
    }

    const visual = within(section).getByRole('img', {
      name: profile.visual.alt,
    });
    expect(visual).toHaveAttribute('loading', 'lazy');
    expect(visual).toHaveAttribute(
      'srcset',
      `${profile.visual.thumbnail.src} ${profile.visual.thumbnail.width}w, ${profile.visual.display.src} ${profile.visual.display.width}w, ${profile.visual.highDensity.src} ${profile.visual.highDensity.width}w`,
    );
    expect(visual).toHaveAttribute(
      'sizes',
      '(max-width: 44rem) calc(100vw - 2.5rem), (max-width: 88rem) 38vw, 32rem',
    );

    expect(
      container.querySelector('[data-testid="primer-sticky-stage"]'),
    ).toBeNull();
    expect(container.querySelector('[data-primer-index]')).toBeNull();
    expect(container.querySelectorAll('article')).toHaveLength(0);
  });

  it('does not render the removed slogan and question-card pattern', () => {
    render(<KafProfileSection profile={profile} />);

    expect(screen.queryByText('为什么特别')).not.toBeInTheDocument();
    expect(screen.queryByText(/虚拟形象是入口/)).not.toBeInTheDocument();
    expect(screen.queryByText('从哪里开始')).not.toBeInTheDocument();
    expect(screen.queryByText(/先听起点/)).not.toBeInTheDocument();
  });
});
