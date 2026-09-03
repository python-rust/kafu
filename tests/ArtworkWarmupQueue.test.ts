import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ArtworkPreloadOptions } from '../src/pages/HomePage/components/artworkLoadCache';
import {
  runArtworkWarmupQueue,
  type ArtworkWarmupGroup,
} from '../src/pages/HomePage/components/artworkWarmupQueue';
import {
  FEATURED_WORK_ARTWORK_SIZES,
  GALLERY_STAGE_ARTWORK_SIZES,
  JOURNEY_LINEAR_ARTWORK_SIZES,
  JOURNEY_STAGE_ARTWORK_SIZES,
  PROFILE_ARTWORK_SIZES,
  SUPPORTING_WORK_ARTWORK_SIZES,
} from '../src/pages/HomePage/components/artworkSizes';
import type { ResponsiveArtworkSource } from '../src/pages/HomePage/components/ResponsiveArtwork';
import { createHomeArtworkWarmupGroups } from '../src/pages/HomePage/homeArtworkWarmup';
import {
  galleryVisuals,
  journeyChapters,
  kafProfile,
  selectedWorks,
} from '../src/content/kaf';
import { createMediaFixture } from './fixtures/media';

interface PendingPreload {
  readonly resolve: () => void;
  readonly reject: () => void;
}

function createSource(id: string) {
  return createMediaFixture({
    id,
    src: `/fixtures/${id}.webp`,
    alt: `${id} artwork`,
    width: 1280,
    height: 720,
  });
}

afterEach(() => {
  performance.clearMarks();
  vi.restoreAllMocks();
});

describe('artwork warmup queue', () => {
  it('keeps section groups in reading order while bounding requests inside a group', async () => {
    const topFirst = createSource('top-first');
    const topSecond = createSource('top-second');
    const lowerFirst = createSource('lower-first');
    const lowerSecond = createSource('lower-second');
    const started: string[] = [];
    const optionsById = new Map<string, ArtworkPreloadOptions>();
    const pending = new Map<string, PendingPreload>();
    const preload = vi.fn(
      (
        source: ResponsiveArtworkSource,
        options: ArtworkPreloadOptions = {},
      ) => {
        started.push(source.id);
        optionsById.set(source.id, options);

        return new Promise<string>((resolve, reject) => {
          pending.set(source.id, {
            resolve: () => resolve(source.display.src),
            reject: () => reject(new Error(`Rejected ${source.id}`)),
          });
        });
      },
    );
    const groups: readonly ArtworkWarmupGroup[] = [
      {
        id: 'top',
        jobs: [
          { id: 'top-first', source: topFirst, sizes: '40rem' },
          { id: 'top-second', source: topSecond, sizes: '40rem' },
        ],
      },
      {
        id: 'lower',
        jobs: [
          { id: 'lower-first', source: lowerFirst, sizes: '30rem' },
          { id: 'lower-second', source: lowerSecond, sizes: '30rem' },
        ],
      },
    ];
    const controller = new AbortController();
    const finished = runArtworkWarmupQueue(groups, controller.signal, {
      concurrency: 2,
      fetchPriority: 'low',
      preload,
      waitForBackgroundTurn: vi.fn().mockResolvedValue(true),
      waitForVisibility: vi.fn().mockResolvedValue(true),
    });

    await vi.waitFor(() =>
      expect(started).toEqual(['top-first', 'top-second']),
    );
    expect(started).not.toContain('lower-first');

    pending.get('top-second')?.resolve();
    await Promise.resolve();
    expect(started).toEqual(['top-first', 'top-second']);

    pending.get('top-first')?.resolve();
    await vi.waitFor(() =>
      expect(started).toEqual([
        'top-first',
        'top-second',
        'lower-first',
        'lower-second',
      ]),
    );

    pending.get('lower-first')?.resolve();
    pending.get('lower-second')?.resolve();
    const summary = await finished;

    expect(summary.cancelled).toBe(false);
    expect(summary.failedJobIds).toEqual([]);
    expect(new Set(summary.completedJobIds)).toEqual(
      new Set(['top-first', 'top-second', 'lower-first', 'lower-second']),
    );
    expect(optionsById.get('top-first')).toEqual({
      fetchPriority: 'low',
      sizes: '40rem',
    });
    expect(
      performance.getEntriesByName('kafu-artwork-warmup-start'),
    ).toHaveLength(1);
    expect(
      performance.getEntriesByName('kafu-artwork-warmup-complete'),
    ).toHaveLength(1);
  });

  it('deduplicates exact requests, continues after failures, and keeps distinct layout contexts', async () => {
    const repeated = createSource('repeated');
    const broken = createSource('broken');
    const final = createSource('final');
    const started: string[] = [];
    const preload = vi.fn(
      (
        source: ResponsiveArtworkSource,
        options: ArtworkPreloadOptions = {},
      ) => {
        started.push(
          `${source.id}:${options.sizes ?? options.role ?? 'responsive'}`,
        );
        if (source.id === 'broken') {
          throw new Error('Expected warmup failure');
        }
        return Promise.resolve(source.display.src);
      },
    );
    const controller = new AbortController();
    const summary = await runArtworkWarmupQueue(
      [
        {
          id: 'first',
          jobs: [{ id: 'repeated-first', source: repeated, sizes: '40rem' }],
        },
        {
          id: 'duplicates-and-errors',
          jobs: [
            { id: 'repeated-duplicate', source: repeated, sizes: '40rem' },
            { id: 'broken', source: broken, sizes: '30rem' },
            { id: 'repeated-other-size', source: repeated, sizes: '30rem' },
          ],
        },
        {
          id: 'last',
          jobs: [{ id: 'final', source: final, role: 'thumbnail' }],
        },
      ],
      controller.signal,
      {
        concurrency: 1,
        preload,
        waitForBackgroundTurn: vi.fn().mockResolvedValue(true),
        waitForVisibility: vi.fn().mockResolvedValue(true),
      },
    );

    expect(started).toEqual([
      'repeated:40rem',
      'broken:30rem',
      'repeated:30rem',
      'final:thumbnail',
    ]);
    expect(summary.completedJobIds).toEqual([
      'repeated-first',
      'repeated-other-size',
      'final',
    ]);
    expect(summary.failedJobIds).toEqual(['broken']);
    expect(summary.cancelled).toBe(false);
  });

  it('serializes background work when the browser reports a constrained connection', async () => {
    const originalConnection = Object.getOwnPropertyDescriptor(
      navigator,
      'connection',
    );
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { effectiveType: '3g', saveData: false },
    });

    try {
      const first = createSource('constrained-first');
      const second = createSource('constrained-second');
      const started: string[] = [];
      const pending = new Map<string, () => void>();
      const preload = vi.fn((source: ResponsiveArtworkSource) => {
        started.push(source.id);
        return new Promise<string>((resolve) => {
          pending.set(source.id, () => resolve(source.display.src));
        });
      });
      const controller = new AbortController();
      const finished = runArtworkWarmupQueue(
        [
          {
            id: 'constrained',
            jobs: [
              { id: first.id, source: first, sizes: '40rem' },
              { id: second.id, source: second, sizes: '40rem' },
            ],
          },
        ],
        controller.signal,
        {
          preload,
          waitForBackgroundTurn: vi.fn().mockResolvedValue(true),
          waitForVisibility: vi.fn().mockResolvedValue(true),
        },
      );

      await vi.waitFor(() => expect(started).toEqual(['constrained-first']));
      pending.get('constrained-first')?.();
      await vi.waitFor(() =>
        expect(started).toEqual(['constrained-first', 'constrained-second']),
      );
      pending.get('constrained-second')?.();

      expect((await finished).completedJobIds).toEqual([
        'constrained-first',
        'constrained-second',
      ]);
    } finally {
      if (originalConnection) {
        Object.defineProperty(navigator, 'connection', originalConnection);
      } else {
        Reflect.deleteProperty(navigator, 'connection');
      }
    }
  });

  it('does not start or complete a queue that was cancelled before scheduling', async () => {
    const source = createSource('cancelled');
    const preload = vi.fn(() => Promise.resolve(source.display.src));
    const controller = new AbortController();
    controller.abort();

    const summary = await runArtworkWarmupQueue(
      [
        {
          id: 'cancelled',
          jobs: [{ id: 'cancelled', source, sizes: '40rem' }],
        },
      ],
      controller.signal,
      {
        preload,
        waitForBackgroundTurn: vi.fn().mockResolvedValue(true),
        waitForVisibility: vi.fn().mockResolvedValue(true),
      },
    );

    expect(preload).not.toHaveBeenCalled();
    expect(summary).toEqual({
      completedJobIds: [],
      failedJobIds: [],
      cancelled: true,
    });
    expect(
      performance.getEntriesByName('kafu-artwork-warmup-start'),
    ).toHaveLength(0);
    expect(
      performance.getEntriesByName('kafu-artwork-warmup-complete'),
    ).toHaveLength(0);
  });
});

describe('home artwork warmup plan', () => {
  it('maps every page image role into top-to-bottom warmup groups', () => {
    const groups = createHomeArtworkWarmupGroups({
      profile: kafProfile,
      chapters: journeyChapters,
      works: selectedWorks,
      galleryVisuals,
      linearJourney: false,
    });

    expect(groups.map((group) => group.id)).toEqual([
      'profile',
      'journey',
      'works',
      'gallery-primary',
      'gallery-thumbnails',
      'gallery-secondary',
    ]);
    expect(groups[0]?.jobs).toEqual([
      expect.objectContaining({
        id: `profile:${kafProfile.visual.id}`,
        sizes: PROFILE_ARTWORK_SIZES,
      }),
    ]);
    expect(groups[1]?.jobs.map((job) => job.id)).toEqual(
      journeyChapters.map((chapter) => `journey:${chapter.id}`),
    );
    expect(
      groups[1]?.jobs.every((job) => job.sizes === JOURNEY_STAGE_ARTWORK_SIZES),
    ).toBe(true);
    expect(groups[2]?.jobs.map((job) => job.id)).toEqual(
      selectedWorks.map((work) => `work:${work.id}`),
    );
    expect(groups[2]?.jobs[0]?.sizes).toBe(FEATURED_WORK_ARTWORK_SIZES);
    expect(
      groups[2]?.jobs
        .slice(1)
        .every((job) => job.sizes === SUPPORTING_WORK_ARTWORK_SIZES),
    ).toBe(true);
    expect(groups[3]?.jobs).toEqual([
      expect.objectContaining({
        id: `gallery-stage:${galleryVisuals[0]?.id}`,
        sizes: GALLERY_STAGE_ARTWORK_SIZES,
      }),
    ]);
    expect(groups[4]?.jobs.map((job) => job.id)).toEqual(
      galleryVisuals.map((visual) => `gallery-thumbnail:${visual.id}`),
    );
    expect(groups[4]?.jobs.every((job) => job.role === 'thumbnail')).toBe(true);
    expect(groups[5]?.jobs.map((job) => job.id)).toEqual(
      galleryVisuals.slice(1).map((visual) => `gallery-stage:${visual.id}`),
    );
  });

  it('uses the in-flow Journey layout size contract for reduced-motion fallback', () => {
    const groups = createHomeArtworkWarmupGroups({
      profile: kafProfile,
      chapters: journeyChapters,
      works: selectedWorks,
      galleryVisuals,
      linearJourney: true,
    });

    expect(
      groups[1]?.jobs.every(
        (job) => job.sizes === JOURNEY_LINEAR_ARTWORK_SIZES,
      ),
    ).toBe(true);
  });
});
