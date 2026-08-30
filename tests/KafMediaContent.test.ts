import { describe, expect, it } from 'vitest';

import {
  galleryMedia,
  galleryVisuals,
  journeyChapters,
  kafMedia,
  kafProfile,
  referenceSources,
  selectedWorks,
} from '../src/content/kaf';
import type { KafMediaVariant } from '../src/content/kaf';

const expectedChapterIds = [
  'origin-2018',
  'observation-2019',
  'magic-rebuilding-2020-2021',
  'expansion-2022-2023',
  'fable-2024',
  'transcendent-love-2025-2026',
];

const expectedNewMediaIds = [
  'origin-ito',
  'observation-past',
  'magic-keshiki',
  'fable-chewing-disco',
  'transcendent-ufo',
  'tori-portrait',
];

const getChapter = (id: string) => {
  const chapter = journeyChapters.find((candidate) => candidate.id === id);

  if (!chapter) {
    throw new Error(`Missing KAF journey chapter: ${id}`);
  }

  return chapter;
};

const expectVariant = (variant: KafMediaVariant) => {
  expect(variant.src.trim()).not.toBe('');
  expect(variant.width).toBeGreaterThan(0);
  expect(variant.height).toBeGreaterThan(0);
};

describe('KAF journey content', () => {
  it('keeps the six approved chapters in chronological order', () => {
    expect(journeyChapters.map((chapter) => chapter.id)).toEqual(
      expectedChapterIds,
    );
    expect(journeyChapters.map((chapter) => chapter.period)).toEqual([
      '2018',
      '2019',
      '2020–2021',
      '2022–2023',
      '2024',
      '2025–2026',
    ]);
  });

  it('keeps chapter and primary-visual IDs unique', () => {
    const chapterIds = journeyChapters.map((chapter) => chapter.id);
    const primaryVisualIds = journeyChapters.map(
      (chapter) => chapter.primaryVisual.id,
    );

    expect(new Set(chapterIds).size).toBe(chapterIds.length);
    expect(new Set(primaryVisualIds).size).toBe(journeyChapters.length);
  });

  it('provides verified official milestone sources for every chapter', () => {
    for (const chapter of journeyChapters) {
      expect(chapter.titleZh.trim()).not.toBe('');
      expect(chapter.summary).toHaveLength(2);
      for (const paragraph of chapter.summary) {
        expect(paragraph.trim()).not.toBe('');
      }
      expect(chapter.milestones.length).toBeGreaterThanOrEqual(2);

      for (const milestone of chapter.milestones) {
        expect(milestone.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(milestone.label.trim()).not.toBe('');

        const source = new URL(milestone.sourceUrl);
        expect(source.protocol).toBe('https:');
        expect(source.hostname).toBe('kaf.kamitsubaki.jp');
      }
    }
  });

  it('captures the required streamed-live, suite, and Kaika milestones', () => {
    const rebuild = getChapter('magic-rebuilding-2020-2021');
    const expansion = getChapter('expansion-2022-2023');
    const fable = getChapter('fable-2024');

    expect(
      rebuild.milestones.some(
        (milestone) =>
          milestone.date === '2020-03-23' &&
          milestone.label.includes('不可解(再)') &&
          milestone.label.includes('直播'),
      ),
    ).toBe(true);
    expect(
      expansion.milestones.some(
        (milestone) =>
          milestone.label.includes('组曲') &&
          milestone.label.includes('MIYAVI'),
      ),
    ).toBe(true);
    expect(
      fable.milestones.some((milestone) => milestone.label.includes('廻花')),
    ).toBe(true);
  });
});

describe('KAF Chinese profile content', () => {
  it('provides one factual profile with a verified local visual', () => {
    expect(kafProfile.paragraphs).toHaveLength(2);
    expect(kafProfile.facts.map((fact) => fact.label)).toEqual([
      '开始活动',
      '出道年龄',
      '所属',
      '主要活动',
    ]);
    expect(kafProfile.paragraphs.join(' ')).toContain('2018 年');
    expect(kafProfile.paragraphs.join(' ')).toContain('14 岁');
    expect(kafProfile.paragraphs.join(' ')).toContain('日本武道馆');
    expect(kafProfile.paragraphs.join(' ')).toContain('代代木第一体育馆');

    for (const paragraph of kafProfile.paragraphs) {
      expect(paragraph.trim()).not.toBe('');
    }
    for (const fact of kafProfile.facts) {
      expect(fact.label.trim()).not.toBe('');
      expect(fact.value.trim()).not.toBe('');
    }
    expect(kafMedia.some((media) => media.id === kafProfile.visual.id)).toBe(
      true,
    );
  });

  it('keeps official biography and Chinese-account references explicit', () => {
    expect(referenceSources).toHaveLength(4);
    expect(
      referenceSources.some((source) => source.id === 'bilibili-profile'),
    ).toBe(true);

    for (const source of referenceSources) {
      expect(source.label.trim()).not.toBe('');
      expect(source.note.trim()).not.toBe('');
      expect(new URL(source.href).protocol).toBe('https:');
    }
  });
});

describe('KAF production editorial data', () => {
  it('provides the complete five-album sequence without inventing a third-album cover', () => {
    const workIds = selectedWorks.map((work) => work.id);

    expect(new Set(workIds).size).toBe(selectedWorks.length);
    expect(selectedWorks.filter((work) => work.featured)).toHaveLength(1);
    expect(selectedWorks.map((work) => work.title)).toEqual([
      '深愛',
      '寓話',
      '狂想β',
      '魔法α',
      '観測α',
    ]);

    const thirdAlbum = selectedWorks.find(
      (work) => work.id === 'album-kyousou-beta-2023',
    );
    expect(thirdAlbum).toMatchObject({
      title: '狂想β',
      releaseDate: '2023.03.08',
      kind: '第 3 张专辑',
      sourceUrl: 'https://kaf.kamitsubaki.jp/discography/20230308/199/',
    });
    expect(thirdAlbum?.visual).toBeUndefined();

    for (const work of selectedWorks) {
      expect(work.id.trim()).not.toBe('');
      expect(work.releaseDateTime).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      if (!work.visual) {
        expect(work.id).toBe('album-kyousou-beta-2023');
        continue;
      }

      expect(work.visual.alt.trim()).not.toBe('');
      expectVariant(work.visual.preview);
      expectVariant(work.visual.display);
      expectVariant(work.visual.highDensity);
      expectVariant(work.visual.thumbnail);
      expect(work.visual.credit.trim()).not.toBe('');
      expect(new URL(work.visual.sourceUrl).protocol).toBe('https:');
      expect(kafMedia.some((media) => media.id === work.visual?.id)).toBe(true);
    }
  });

  it('exports gallery records ready for GallerySection consumption', () => {
    const galleryIds = galleryVisuals.map((visual) => visual.id);

    expect(galleryVisuals).toHaveLength(galleryMedia.length);
    expect(new Set(galleryIds).size).toBe(galleryVisuals.length);

    for (const visual of galleryVisuals) {
      expect(visual.id.trim()).not.toBe('');
      expect(visual.title.trim()).not.toBe('');
      expect(visual.alt.trim()).not.toBe('');
      expectVariant(visual.display);
      expectVariant(visual.highDensity);
      expectVariant(visual.thumbnail);
      expect(visual.credit.trim()).not.toBe('');
      expect(new URL(visual.sourceUrl).protocol).toBe('https:');
      expect(kafMedia.some((media) => media.id === visual.id)).toBe(true);
    }
  });
});

describe('KAF media manifest', () => {
  it('ships at least nine visuals including the six new acquisitions', () => {
    const mediaIds = new Set(kafMedia.map((media) => media.id));

    expect(kafMedia.length).toBeGreaterThanOrEqual(9);
    expect(expectedNewMediaIds).toHaveLength(6);

    for (const id of expectedNewMediaIds) {
      expect(mediaIds.has(id)).toBe(true);
    }
  });

  it('keeps media metadata complete and IDs unique', () => {
    const mediaIds = kafMedia.map((media) => media.id);
    expect(new Set(mediaIds).size).toBe(mediaIds.length);

    for (const media of kafMedia) {
      expect(media.title.trim()).not.toBe('');
      expect(media.alt.trim()).not.toBe('');
      expect(media.credit.trim()).not.toBe('');
      expect(media.licenseSummary.trim()).not.toBe('');
      expectVariant(media.preview);
      expectVariant(media.display);
      expectVariant(media.highDensity);
      expectVariant(media.thumbnail);
      expect(media.display.width).toBe(media.preview.width * 2);
      expect(media.display.height).toBe(media.preview.height * 2);
      expect(media.highDensity.width).toBe(media.preview.width * 4);
      expect(media.highDensity.height).toBe(media.preview.height * 4);
      expect(Math.max(media.thumbnail.width, media.thumbnail.height)).toBe(480);
      expect(media.display.src).toContain(`${media.id}-2x`);
      expect(media.highDensity.src).toContain(`${media.id}-4x`);
      expect(media.thumbnail.src).toContain(`${media.id}-thumb`);
      expect(media.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new URL(media.sourceUrl).protocol).toBe('https:');
      expect(new URL(media.licenseUrl).protocol).toBe('https:');
    }
  });

  it('resolves every journey visual through the shipping media manifest', () => {
    const mediaIds = new Set(kafMedia.map((media) => media.id));

    for (const chapter of journeyChapters) {
      expect(mediaIds.has(chapter.primaryVisual.id)).toBe(true);

      if (chapter.secondaryVisual) {
        expect(mediaIds.has(chapter.secondaryVisual.id)).toBe(true);
      }
    }

    for (const media of galleryMedia) {
      expect(mediaIds.has(media.id)).toBe(true);
    }
  });
});
