import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const motionPreference = vi.hoisted(() => ({ reduced: false }));

const artworkLoadHarness = vi.hoisted(() => {
  interface Variant {
    src: string;
    width: number;
  }

  interface Source {
    id: string;
    thumbnail: Variant;
    medium: Variant;
    display: Variant;
    large: Variant;
    highDensity: Variant;
  }

  interface PendingRequest {
    key: string;
    resolve: (value: string) => void;
    reject: (error: Error) => void;
    promise: Promise<string>;
  }

  const loadedRequests = new Set<string>();
  const pendingRequests = new Map<string, PendingRequest>();
  const preload = vi.fn();

  const sourceSet = (source: Source) =>
    [
      source.thumbnail,
      source.medium,
      source.display,
      source.large,
      source.highDensity,
    ]
      .sort((first, second) => first.width - second.width)
      .map((variant) => `${variant.src} ${variant.width}w`)
      .join(', ');

  const requestKey = (
    source: Source,
    role: 'responsive' | 'highDensity' | 'thumbnail',
    sizes?: string,
  ) => `${source.id}|${role}|${sizes ?? ''}|1024x1`;

  preload.mockImplementation(
    (source: Source, sizes: string, _priority: 'auto' | 'high' | 'low') => {
      const key = requestKey(source, 'responsive', sizes);

      if (loadedRequests.has(key)) {
        return Promise.resolve(source.display.src);
      }

      const existing = pendingRequests.get(source.id);
      if (existing) {
        return existing.promise;
      }

      let resolveRequest!: (value: string) => void;
      let rejectRequest!: (error: Error) => void;
      const promise = new Promise<string>((resolve, reject) => {
        resolveRequest = resolve;
        rejectRequest = reject;
      });
      pendingRequests.set(source.id, {
        key,
        resolve: resolveRequest,
        reject: rejectRequest,
        promise,
      });
      return promise;
    },
  );

  return {
    module: {
      artworkRequestKey: requestKey,
      responsiveArtworkSourceSet: sourceSet,
      hasLoadedArtwork: (
        source: Source,
        role: 'responsive' | 'highDensity' | 'thumbnail',
        sizes?: string,
      ) => loadedRequests.has(requestKey(source, role, sizes)),
      markArtworkElementLoaded: (image: HTMLImageElement, key: string) => {
        loadedRequests.add(key);
        return image.currentSrc || image.src;
      },
      preloadResponsiveArtwork: preload,
      __resetArtworkLoadCacheForTests: () => {
        loadedRequests.clear();
        pendingRequests.clear();
      },
    },
    preload,
    resolve(sourceId: string) {
      const pending = pendingRequests.get(sourceId);
      if (!pending) {
        throw new Error(`No pending artwork request for ${sourceId}.`);
      }
      loadedRequests.add(pending.key);
      pendingRequests.delete(sourceId);
      pending.resolve(`/resolved/${sourceId}.webp`);
    },
    reject(sourceId: string) {
      const pending = pendingRequests.get(sourceId);
      if (!pending) {
        throw new Error(`No pending artwork request for ${sourceId}.`);
      }
      pendingRequests.delete(sourceId);
      pending.reject(new Error(`Rejected ${sourceId}`));
    },
    reset() {
      loadedRequests.clear();
      pendingRequests.clear();
      preload.mockClear();
    },
  };
});

const scrollamaHarness = vi.hoisted(() => {
  type Direction = 'up' | 'down';
  type EnterCallback = (response: {
    element: HTMLElement;
    index: number;
    direction: Direction;
  }) => void;

  let enterCallback: EnterCallback | undefined;
  const instance: {
    setup: ReturnType<typeof vi.fn>;
    onStepEnter: ReturnType<typeof vi.fn>;
    offset: ReturnType<typeof vi.fn>;
    resize: ReturnType<typeof vi.fn>;
    destroy: ReturnType<typeof vi.fn>;
  } = {
    setup: vi.fn(),
    onStepEnter: vi.fn(),
    offset: vi.fn(),
    resize: vi.fn(),
    destroy: vi.fn(),
  };

  instance.setup.mockImplementation(() => instance);
  instance.onStepEnter.mockImplementation((callback: EnterCallback) => {
    enterCallback = callback;
    return instance;
  });
  instance.offset.mockImplementation(() => instance);
  instance.resize.mockImplementation(() => instance);

  const factory = vi.fn(() => instance);

  return {
    factory,
    instance,
    enter(index: number, direction: Direction) {
      const element = document.querySelectorAll<HTMLElement>(
        '[data-journey-step]',
      )[index];

      if (!element || !enterCallback) {
        throw new Error(`Unable to trigger Scrollama step ${index}.`);
      }

      enterCallback({ element, index, direction });
    },
    reset() {
      enterCallback = undefined;
      factory.mockClear();
      instance.setup.mockClear();
      instance.onStepEnter.mockClear();
      instance.offset.mockClear();
      instance.resize.mockClear();
      instance.destroy.mockClear();
    },
  };
});

vi.mock(
  '../src/pages/HomePage/components/artworkLoadCache',
  () => artworkLoadHarness.module,
);

vi.mock('scrollama', () => ({ default: scrollamaHarness.factory }));

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
) {
  return {
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
}

const chapters = [
  chapterFixture('origin', '2018', '被发现的声音', 'origin', 0),
  chapterFixture('observation', '2019', '从网络走向现场', 'observation', 1),
  chapterFixture('rebuild', '2020–2021', '在无法相聚时重构舞台', 'rebuild', 2),
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

function stubBrowserLayout(wide = true) {
  vi.stubGlobal('IntersectionObserver', class IntersectionObserver {});
  vi.stubGlobal(
    'ResizeObserver',
    class ResizeObserver {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('min-width') ? wide : true,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

describe('JourneySection', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    motionPreference.reduced = false;
    scrollamaHarness.reset();
    artworkLoadHarness.reset();
    stubBrowserLayout(true);
  });

  it('renders six source-ordered story steps and one dominant sticky image', () => {
    const { container, unmount } = render(
      <JourneySection chapters={chapters} />,
    );

    const journey = screen.getByRole('region', { name: '成长轨迹' });
    const articles = within(journey).getAllByRole('article');
    const headings = within(journey).getAllByRole('heading', { level: 3 });

    expect(articles).toHaveLength(6);
    expect(headings.map((heading) => heading.textContent)).toEqual([
      '被发现的声音',
      '从网络走向现场',
      '在无法相聚时重构舞台',
      '把虚拟歌声带进武道馆',
      '进入创作的第二章',
      '走向更大的世界',
    ]);
    expect(container.querySelectorAll('[data-journey-step]')).toHaveLength(6);
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    const stage = screen.getByTestId('journey-sticky-stage');
    expect(stage).toHaveAttribute('data-active-index', '0');
    expect(stage.querySelectorAll('img')).toHaveLength(1);
    expect(
      container.querySelectorAll('[class*="secondaryVisual"]'),
    ).toHaveLength(0);
    expect(scrollamaHarness.instance.setup).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 0.52, progress: false }),
    );

    unmount();
    expect(scrollamaHarness.instance.destroy).toHaveBeenCalledOnce();
  });

  it('keeps the previous clear stage while a new era loads, then reuses cached eras', async () => {
    render(<JourneySection chapters={chapters} />);

    let stage = screen.getByTestId('journey-sticky-stage');
    const initialImage = stage.querySelector('img');
    if (!initialImage) throw new Error('Missing initial Journey image.');
    expect(artworkLoadHarness.preload).not.toHaveBeenCalled();
    fireEvent.load(initialImage);

    expect(stage).toHaveAttribute('data-displayed-visual-index', '0');
    expect(stage).toHaveAttribute('data-stage-load-status', 'idle');
    expect(artworkLoadHarness.preload).not.toHaveBeenCalled();

    act(() => scrollamaHarness.enter(0, 'down'));
    await waitFor(() => {
      expect(artworkLoadHarness.preload).toHaveBeenCalledWith(
        chapters[1].primaryVisual,
        expect.any(String),
        'low',
      );
    });

    act(() => scrollamaHarness.enter(2, 'down'));

    stage = screen.getByTestId('journey-sticky-stage');
    expect(stage).toHaveAttribute('data-active-index', '2');
    expect(stage).toHaveAttribute('data-displayed-visual-index', '0');
    expect(stage).toHaveAttribute('data-stage-load-status', 'loading');
    expect(stage).toHaveTextContent('被发现的声音');
    expect(stage).toHaveTextContent('下一阶段图片加载中');
    expect(
      stage.querySelector('[data-artwork-id="origin-visual"]'),
    ).toHaveAttribute('data-artwork-status', 'loaded');
    expect(artworkLoadHarness.preload).toHaveBeenCalledWith(
      chapters[2].primaryVisual,
      expect.any(String),
      'auto',
    );

    await act(async () => artworkLoadHarness.resolve('rebuild-visual'));

    await waitFor(() => {
      expect(stage).toHaveAttribute('data-displayed-visual-index', '2');
    });
    expect(stage).toHaveAttribute('data-stage-load-status', 'idle');
    expect(
      stage.querySelector('[data-artwork-id="rebuild-visual"]'),
    ).toHaveAttribute('data-artwork-status', 'loaded');
    expect(stage).not.toHaveTextContent('下一阶段图片加载中');

    const activeRequestCountBeforeRevisit =
      artworkLoadHarness.preload.mock.calls.filter(
        ([source, , priority]) =>
          source === chapters[0].primaryVisual && priority === 'auto',
      ).length;

    act(() => scrollamaHarness.enter(0, 'up'));

    await waitFor(() => {
      expect(stage).toHaveAttribute('data-displayed-visual-index', '0');
    });
    expect(stage).toHaveAttribute('data-stage-load-status', 'idle');
    expect(
      stage.querySelector('[data-artwork-id="origin-visual"]'),
    ).toHaveAttribute('data-artwork-status', 'loaded');
    expect(
      artworkLoadHarness.preload.mock.calls.filter(
        ([source, , priority]) =>
          source === chapters[0].primaryVisual && priority === 'auto',
      ),
    ).toHaveLength(activeRequestCountBeforeRevisit);
    expect(document.querySelector('[data-journey-index="0"]')).toHaveAttribute(
      'data-active',
      'true',
    );
  });

  it('shows a restrained stage error without replacing the previous clear image', async () => {
    render(<JourneySection chapters={chapters} />);
    const stage = screen.getByTestId('journey-sticky-stage');
    const initialImage = stage.querySelector('img');
    if (!initialImage) throw new Error('Missing initial Journey image.');
    fireEvent.load(initialImage);

    act(() => scrollamaHarness.enter(3, 'down'));
    await act(async () => artworkLoadHarness.reject('expansion-visual'));

    await waitFor(() => {
      expect(stage).toHaveAttribute('data-stage-load-status', 'error');
    });
    expect(stage).toHaveAttribute('data-displayed-visual-index', '0');
    expect(stage).toHaveTextContent('被发现的声音');
    expect(stage).toHaveTextContent('图片暂未加载');
    expect(
      stage.querySelector('[data-artwork-id="origin-visual"]'),
    ).toHaveAttribute('data-artwork-status', 'loaded');
  });

  it('uses a compact pixel offset and renders all six images in reduced motion', () => {
    cleanup();
    scrollamaHarness.reset();
    vi.unstubAllGlobals();
    stubBrowserLayout(false);

    const { unmount } = render(<JourneySection chapters={chapters} />);
    const setupOptions = scrollamaHarness.instance.setup.mock.calls[0]?.[0] as
      { offset?: unknown } | undefined;

    expect(setupOptions?.offset).toMatch(/^\d+px$/);
    unmount();

    cleanup();
    scrollamaHarness.reset();
    motionPreference.reduced = true;
    render(<JourneySection chapters={chapters} />);

    expect(
      screen.queryByTestId('journey-sticky-stage'),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(6);
    expect(screen.getAllByRole('img')).toHaveLength(6);
    expect(scrollamaHarness.factory).not.toHaveBeenCalled();

    for (const chapter of chapters) {
      expect(
        screen.getByRole('img', { name: chapter.primaryVisual.alt }),
      ).toHaveAttribute('loading', 'lazy');
      expect(screen.getByText(chapter.summary[1])).toBeVisible();
    }
  });
});
