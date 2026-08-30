import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import scrollama from 'scrollama';
import { useEffect, useRef, useState } from 'react';

import {
  ResponsiveArtwork,
  type ResponsiveArtworkSource,
} from '../components/ResponsiveArtwork';
import {
  hasLoadedArtwork,
  preloadResponsiveArtwork,
} from '../components/artworkLoadCache';
import { SectionHeading } from '../components/SectionHeading';
import styles from './JourneySection.module.css';

type JourneyTheme =
  'origin' | 'observation' | 'rebuild' | 'expansion' | 'fable' | 'transcendent';

interface JourneyVisual extends ResponsiveArtworkSource {}

interface JourneyMilestone {
  date: string;
  label: string;
  sourceUrl: string;
}

interface JourneyChapter {
  id: string;
  period: string;
  yearLabel: string;
  titleZh: string;
  summary: readonly string[];
  theme: JourneyTheme;
  milestones: readonly JourneyMilestone[];
  primaryVisual: JourneyVisual;
}

interface JourneySectionProps {
  chapters: readonly JourneyChapter[];
}

type ScrollDirection = 'up' | 'down';
type ScrollamaOffset = number | `${number}px`;

interface ScrollamaStepResponse {
  element: HTMLElement;
  index: number;
  direction: ScrollDirection;
}

interface ScrollamaRuntime {
  setup(options: {
    step: HTMLElement[];
    offset: ScrollamaOffset;
    progress?: boolean;
  }): ScrollamaRuntime;
  onStepEnter(
    callback: (response: ScrollamaStepResponse) => void,
  ): ScrollamaRuntime;
  offset(value: ScrollamaOffset): ScrollamaRuntime;
  resize(): ScrollamaRuntime;
  destroy(): void;
}

const createScrollama = scrollama as unknown as () => ScrollamaRuntime;

const WIDE_LAYOUT_QUERY = '(min-width: 64rem)';
const PORTRAIT_QUERY = '(orientation: portrait)';
const WIDE_TRIGGER_OFFSET = 0.52;
const MIN_COMPACT_TRIGGER_OFFSET = 180;
const COMPACT_TRIGGER_MARGIN = 0;
const COMPACT_BOTTOM_GUARD = 96;

const stageTransition = {
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1],
} as const;
const JOURNEY_STAGE_SIZES =
  '(max-width: 64rem) 100vw, (max-width: 88rem) 46vw, 40rem';

function getChapterAnchorId(id: string) {
  return `journey-${id}`;
}

function getTriggerOffset(
  isWideLayout: boolean,
  stage: HTMLElement | null,
): ScrollamaOffset {
  if (isWideLayout) {
    return WIDE_TRIGGER_OFFSET;
  }

  const header = document.querySelector<HTMLElement>('header');
  const headerHeight = header?.getBoundingClientRect().height ?? 0;
  const stageHeight = stage?.getBoundingClientRect().height ?? 0;
  const desiredOffset = Math.round(
    headerHeight + stageHeight + COMPACT_TRIGGER_MARGIN,
  );
  const maximumOffset = Math.max(
    MIN_COMPACT_TRIGGER_OFFSET,
    window.innerHeight - COMPACT_BOTTOM_GUARD,
  );
  const compactOffset = Math.min(
    maximumOffset,
    Math.max(MIN_COMPACT_TRIGGER_OFFSET, desiredOffset),
  );

  return `${compactOffset}px`;
}

export function JourneySection({ chapters }: JourneySectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayedVisualIndex, setDisplayedVisualIndex] = useState(0);
  const [stageLoadStatus, setStageLoadStatus] = useState<
    'idle' | 'loading' | 'error'
  >('idle');
  const [displayedVisualReady, setDisplayedVisualReady] = useState(false);
  const [journeyActivated, setJourneyActivated] = useState(false);
  const [scrollDirection, setScrollDirection] =
    useState<ScrollDirection>('down');
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const safeActiveIndex = Math.min(
    activeIndex,
    Math.max(chapters.length - 1, 0),
  );
  const activeChapter = chapters[safeActiveIndex];
  const safeDisplayedVisualIndex = Math.min(
    displayedVisualIndex,
    Math.max(chapters.length - 1, 0),
  );
  const displayedChapter = chapters[safeDisplayedVisualIndex] ?? activeChapter;
  const reducedMotion = shouldReduceMotion === true;
  const supportsScrollytelling =
    typeof window !== 'undefined' &&
    typeof IntersectionObserver !== 'undefined' &&
    typeof ResizeObserver !== 'undefined';
  const linearJourney = reducedMotion || !supportsScrollytelling;

  useEffect(() => {
    if (linearJourney || typeof window === 'undefined' || !sectionRef.current) {
      return;
    }

    const steps = Array.from(
      sectionRef.current.querySelectorAll<HTMLElement>('[data-journey-step]'),
    );

    if (steps.length === 0) {
      return;
    }

    const wideLayout = window.matchMedia(WIDE_LAYOUT_QUERY);
    const portraitLayout = window.matchMedia(PORTRAIT_QUERY);
    const scroller = createScrollama();
    let resizeFrame = 0;

    scroller
      .setup({
        step: steps,
        offset: getTriggerOffset(wideLayout.matches, stageRef.current),
        progress: false,
      })
      .onStepEnter(({ index, direction }) => {
        if (index < 0 || index >= chapters.length) {
          return;
        }

        setJourneyActivated(true);
        setScrollDirection(direction);
        setActiveIndex((currentIndex) =>
          currentIndex === index ? currentIndex : index,
        );
      });

    const refreshLayout = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        scroller.offset(getTriggerOffset(wideLayout.matches, stageRef.current));
        scroller.resize();
      });
    };

    const geometryObserver = new ResizeObserver(refreshLayout);
    const header = document.querySelector<HTMLElement>('header');

    if (header) {
      geometryObserver.observe(header);
    }

    if (stageRef.current) {
      geometryObserver.observe(stageRef.current);
    }

    wideLayout.addEventListener('change', refreshLayout);
    portraitLayout.addEventListener('change', refreshLayout);

    return () => {
      window.cancelAnimationFrame(resizeFrame);
      geometryObserver.disconnect();
      wideLayout.removeEventListener('change', refreshLayout);
      portraitLayout.removeEventListener('change', refreshLayout);
      scroller.destroy();
    };
  }, [chapters.length, linearJourney]);

  useEffect(() => {
    if (linearJourney || !activeChapter) {
      return;
    }

    const activeVisualLoaded = hasLoadedArtwork(
      activeChapter.primaryVisual,
      'responsive',
      JOURNEY_STAGE_SIZES,
    );

    if (safeDisplayedVisualIndex === safeActiveIndex) {
      if (activeVisualLoaded) {
        setDisplayedVisualReady(true);
      }
      setStageLoadStatus('idle');
      return;
    }

    if (activeVisualLoaded) {
      setDisplayedVisualIndex(safeActiveIndex);
      setDisplayedVisualReady(true);
      setStageLoadStatus('idle');
      return;
    }

    let cancelled = false;
    setStageLoadStatus('loading');

    void preloadResponsiveArtwork(
      activeChapter.primaryVisual,
      JOURNEY_STAGE_SIZES,
      'auto',
    ).then(
      () => {
        if (!cancelled) {
          setDisplayedVisualIndex(safeActiveIndex);
          setDisplayedVisualReady(true);
          setStageLoadStatus('idle');
        }
      },
      () => {
        if (!cancelled) {
          setStageLoadStatus('error');
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [activeChapter, linearJourney, safeActiveIndex, safeDisplayedVisualIndex]);

  useEffect(() => {
    if (
      linearJourney ||
      stageLoadStatus !== 'idle' ||
      !displayedChapter ||
      !displayedVisualReady ||
      !journeyActivated
    ) {
      return;
    }

    const adjacentIndex =
      safeDisplayedVisualIndex + (scrollDirection === 'down' ? 1 : -1);
    const adjacentChapter = chapters[adjacentIndex];

    if (!adjacentChapter) {
      return;
    }

    void preloadResponsiveArtwork(
      adjacentChapter.primaryVisual,
      JOURNEY_STAGE_SIZES,
      'low',
    ).catch(() => {
      // Adjacent preloading is opportunistic; the active transition retries it.
    });
  }, [
    chapters,
    displayedChapter,
    displayedVisualReady,
    journeyActivated,
    linearJourney,
    safeDisplayedVisualIndex,
    scrollDirection,
    stageLoadStatus,
  ]);

  if (!activeChapter || !displayedChapter) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id="journey"
      className={styles.journey}
      data-theme={activeChapter.theme}
      aria-labelledby="journey-heading"
    >
      <div className={styles.inner}>
        <SectionHeading id="journey-heading" tone="light">
          成长轨迹
        </SectionHeading>

        <div className={styles.scrolly}>
          {linearJourney ? null : (
            <aside
              ref={stageRef}
              className={styles.stage}
              data-testid="journey-sticky-stage"
              data-active-index={safeActiveIndex}
              data-displayed-visual-index={safeDisplayedVisualIndex}
              data-stage-load-status={stageLoadStatus}
              aria-hidden="true"
            >
              <div className={styles.stageFrame}>
                <div className={styles.visualStack}>
                  <AnimatePresence initial={false}>
                    <motion.figure
                      className={styles.stageVisual}
                      key={displayedChapter.id}
                      initial={{ opacity: 0, scale: 1.012 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.995 }}
                      transition={stageTransition}
                    >
                      <ResponsiveArtwork
                        source={displayedChapter.primaryVisual}
                        alt=""
                        loading="lazy"
                        fetchPriority="auto"
                        decoding="async"
                        sizes={JOURNEY_STAGE_SIZES}
                        onLoad={() => setDisplayedVisualReady(true)}
                      />
                    </motion.figure>
                  </AnimatePresence>
                </div>

                {stageLoadStatus !== 'idle' ? (
                  <div
                    className={styles.stageLoading}
                    data-status={stageLoadStatus}
                  >
                    <span className={styles.stageLoadingLine} />
                    <span>
                      {stageLoadStatus === 'error'
                        ? '图片暂未加载'
                        : '下一阶段图片加载中'}
                    </span>
                  </div>
                ) : null}

                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    className={styles.stageMeta}
                    key={displayedChapter.id}
                    initial={{
                      opacity: 0,
                      y: scrollDirection === 'down' ? 12 : -12,
                    }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      y: scrollDirection === 'down' ? -8 : 8,
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <span>{displayedChapter.yearLabel}</span>
                    <strong>{displayedChapter.titleZh}</strong>
                  </motion.div>
                </AnimatePresence>

                <ol className={styles.stageProgress}>
                  {chapters.map((chapter, index) => (
                    <li
                      key={chapter.id}
                      data-active={
                        index === safeActiveIndex ? 'true' : undefined
                      }
                      data-complete={
                        index < safeActiveIndex ? 'true' : undefined
                      }
                    >
                      <span>{chapter.yearLabel}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          )}

          <ol className={styles.steps}>
            {chapters.map((chapter, index) => {
              const isActive = index === safeActiveIndex;
              const anchorId = getChapterAnchorId(chapter.id);
              const titleId = `${anchorId}-title`;

              return (
                <li className={styles.stepItem} key={chapter.id}>
                  <article
                    id={anchorId}
                    className={styles.step}
                    data-journey-step
                    data-journey-index={index}
                    data-active={isActive ? 'true' : undefined}
                    aria-labelledby={titleId}
                  >
                    {linearJourney ? (
                      <figure className={styles.linearVisual}>
                        <ResponsiveArtwork
                          source={chapter.primaryVisual}
                          loading="lazy"
                          fetchPriority="low"
                          decoding="async"
                          sizes="(max-width: 88rem) calc(100vw - 2.5rem), 88rem"
                        />
                      </figure>
                    ) : null}

                    <header className={styles.stepHeader}>
                      <p className={styles.year}>{chapter.yearLabel}</p>
                      <h3 id={titleId}>{chapter.titleZh}</h3>
                    </header>

                    <div className={styles.summary}>
                      {chapter.summary.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>

                    <div className={styles.milestoneBlock}>
                      <h4>关键节点</h4>
                      <ol className={styles.milestones}>
                        {chapter.milestones.map((milestone) => (
                          <li key={`${milestone.date}-${milestone.sourceUrl}`}>
                            <time dateTime={milestone.date}>
                              {milestone.date}
                            </time>
                            <span>{milestone.label}</span>
                            <a
                              href={milestone.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`${milestone.label}的资料来源（在新窗口打开）`}
                            >
                              来源
                            </a>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
