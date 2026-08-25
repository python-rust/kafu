import { describe, expect, it } from 'vitest';

import {
  galleryMedia,
  galleryVisuals,
  journeyChapters,
  kafMedia,
  selectedWorks,
} from '../src/content/kaf';

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
      expect(chapter.titleJa.trim()).not.toBe('');
      expect(chapter.titleEn.trim()).not.toBe('');
      expect(chapter.summary.trim()).not.toBe('');
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
          milestone.label.includes('組曲') &&
          milestone.label.includes('MIYAVI'),
      ),
    ).toBe(true);
    expect(
      fable.milestones.some((milestone) => milestone.label.includes('廻花')),
    ).toBe(true);
  });
});

describe('KAF production editorial data', () => {
  it('provides stable unique work IDs and rights-cleared visuals', () => {
    const workIds = selectedWorks.map((work) => work.id);

    expect(new Set(workIds).size).toBe(selectedWorks.length);
    expect(selectedWorks.filter((work) => work.featured)).toHaveLength(1);

    for (const work of selectedWorks) {
      expect(work.id.trim()).not.toBe('');
      expect(work.releaseDateTime).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(work.visual).toBeDefined();

      if (!work.visual) {
        throw new Error(`Missing production visual for work: ${work.id}`);
      }

      expect(work.visual.src.trim()).not.toBe('');
      expect(work.visual.alt.trim()).not.toBe('');
      expect(work.visual.width).toBeGreaterThan(0);
      expect(work.visual.height).toBeGreaterThan(0);
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
      expect(visual.src.trim()).not.toBe('');
      expect(visual.alt.trim()).not.toBe('');
      expect(visual.width).toBeGreaterThan(0);
      expect(visual.height).toBeGreaterThan(0);
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
      expect(media.src.trim()).not.toBe('');
      expect(media.alt.trim()).not.toBe('');
      expect(media.credit.trim()).not.toBe('');
      expect(media.licenseSummary.trim()).not.toBe('');
      expect(media.width).toBeGreaterThan(0);
      expect(media.height).toBeGreaterThan(0);
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
