import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import scrollama from 'scrollama';
import { useEffect, useRef, useState } from 'react';

import {
  ResponsiveArtwork,
  type ResponsiveArtworkSource,
} from '../components/ResponsiveArtwork';
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
const COMPACT_TRIGGER_RATIO = 0.72;
const MIN_COMPACT_TRIGGER_OFFSET = 180;

const stageTransition = {
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1],
} as const;

function getChapterAnchorId(id: string) {
  return `journey-${id}`;
}

function getTriggerOffset(isWideLayout: boolean): ScrollamaOffset {
  if (isWideLayout) {
    return WIDE_TRIGGER_OFFSET;
  }

  const compactOffset = Math.max(
    MIN_COMPACT_TRIGGER_OFFSET,
    Math.round(window.innerHeight * COMPACT_TRIGGER_RATIO),
  );

  return `${compactOffset}px`;
}

export function JourneySection({ chapters }: JourneySectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollDirection, setScrollDirection] =
    useState<ScrollDirection>('down');
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const safeActiveIndex = Math.min(
    activeIndex,
    Math.max(chapters.length - 1, 0),
  );
  const activeChapter = chapters[safeActiveIndex];
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
        offset: getTriggerOffset(wideLayout.matches),
        progress: false,
      })
      .onStepEnter(({ index, direction }) => {
        if (index < 0 || index >= chapters.length) {
          return;
        }

        setScrollDirection(direction);
        setActiveIndex((currentIndex) =>
          currentIndex === index ? currentIndex : index,
        );
      });

    const refreshLayout = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        scroller.offset(getTriggerOffset(wideLayout.matches));
        scroller.resize();
      });
    };

    wideLayout.addEventListener('change', refreshLayout);
    portraitLayout.addEventListener('change', refreshLayout);

    return () => {
      window.cancelAnimationFrame(resizeFrame);
      wideLayout.removeEventListener('change', refreshLayout);
      portraitLayout.removeEventListener('change', refreshLayout);
      scroller.destroy();
    };
  }, [chapters.length, linearJourney]);

  if (!activeChapter) {
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
              className={styles.stage}
              data-testid="journey-sticky-stage"
              data-active-index={safeActiveIndex}
              aria-hidden="true"
            >
              <div className={styles.stageFrame}>
                <div className={styles.visualStack}>
                  <AnimatePresence initial={false} mode="wait">
                    <motion.figure
                      className={styles.stageVisual}
                      key={activeChapter.id}
                      initial={{ opacity: 0, scale: 1.012 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.995 }}
                      transition={stageTransition}
                    >
                      <ResponsiveArtwork
                        source={activeChapter.primaryVisual}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    </motion.figure>
                  </AnimatePresence>
                </div>

                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    className={styles.stageMeta}
                    key={activeChapter.id}
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
                    <span>{activeChapter.yearLabel}</span>
                    <strong>{activeChapter.titleZh}</strong>
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
                          decoding="async"
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
