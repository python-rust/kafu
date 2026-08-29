import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import styles from './JourneySection.module.css';

type JourneyTheme =
  'origin' | 'observation' | 'rebuild' | 'expansion' | 'fable' | 'transcendent';

interface JourneyVisual {
  src: string;
  alt: string;
  width: number;
  height: number;
  credit: string;
  sourceUrl: string;
  objectPosition?: string;
}

interface JourneyMilestone {
  date: string;
  label: string;
  sourceUrl: string;
}

interface JourneyChapter {
  id: string;
  period: string;
  yearLabel: string;
  titleJa: string;
  titleEn: string;
  summary: string;
  theme: JourneyTheme;
  milestones: readonly JourneyMilestone[];
  primaryVisual: JourneyVisual;
  secondaryVisual?: JourneyVisual;
}

interface JourneySectionProps {
  chapters: readonly JourneyChapter[];
}

interface JourneyDesktopStageProps {
  activeIndex: number;
  chapters: readonly JourneyChapter[];
}

const CHAPTER_OBSERVER_ROOT_MARGIN = '-44% 0px -44% 0px';

const stageVisualTransition = {
  duration: 0.46,
  ease: [0.22, 1, 0.36, 1],
} as const;

function formatSequence(index: number) {
  return String(index + 1).padStart(2, '0');
}

function getChapterAnchorId(id: string) {
  return `journey-${id}`;
}

function JourneyDesktopStage({
  activeIndex,
  chapters,
}: JourneyDesktopStageProps) {
  const activeChapter = chapters[activeIndex];

  if (!activeChapter) {
    return null;
  }

  const progress = (activeIndex + 1) / chapters.length;

  return (
    <aside
      className={styles.stage}
      aria-hidden="true"
      data-testid="journey-sticky-stage"
    >
      <div className={styles.stageFrame}>
        <div className={styles.stageSignal} />

        <div className={styles.visualStack}>
          <AnimatePresence initial={false} mode="sync">
            <motion.figure
              key={activeChapter.id}
              className={styles.visualLayer}
              initial={{ opacity: 0, scale: 1.018, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.992, y: -6 }}
              transition={stageVisualTransition}
            >
              <img
                src={activeChapter.primaryVisual.src}
                alt=""
                width={activeChapter.primaryVisual.width}
                height={activeChapter.primaryVisual.height}
                loading="lazy"
                decoding="async"
                style={
                  activeChapter.primaryVisual.objectPosition
                    ? {
                        objectPosition:
                          activeChapter.primaryVisual.objectPosition,
                      }
                    : undefined
                }
              />
            </motion.figure>
          </AnimatePresence>
        </div>

        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={activeChapter.id}
            className={styles.stageMeta}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className={styles.stageSequence}>
              CHAPTER {formatSequence(activeIndex)}
            </span>
            <strong className={styles.stageYear}>
              {activeChapter.yearLabel}
            </strong>
            <span className={styles.stageTitleJa}>{activeChapter.titleJa}</span>
            <span className={styles.stageTitleEn}>{activeChapter.titleEn}</span>
          </motion.div>
        </AnimatePresence>

        <div className={styles.stageProgress}>
          <span className={styles.stageProgressTrack}>
            <motion.span
              className={styles.stageProgressFill}
              initial={false}
              animate={{ scaleY: progress }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            />
          </span>
          <span className={styles.stageProgressCount}>
            {formatSequence(activeIndex)} /{' '}
            {String(chapters.length).padStart(2, '0')}
          </span>
        </div>
      </div>
    </aside>
  );
}

function ChapterVisual({ visual }: { visual: JourneyVisual }) {
  return (
    <figure className={styles.chapterFigure}>
      <img
        src={visual.src}
        alt={visual.alt}
        width={visual.width}
        height={visual.height}
        loading="lazy"
        decoding="async"
        style={
          visual.objectPosition
            ? { objectPosition: visual.objectPosition }
            : undefined
        }
      />
      <figcaption>
        <span>Visual credit</span>
        <a
          href={visual.sourceUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Visual source: ${visual.credit}`}
        >
          {visual.credit}
        </a>
      </figcaption>
    </figure>
  );
}

export function JourneySection({ chapters }: JourneySectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const chapterRefs = useRef<Array<HTMLElement | null>>([]);
  const safeActiveIndex = Math.min(
    activeIndex,
    Math.max(chapters.length - 1, 0),
  );
  const activeChapter = chapters[safeActiveIndex];

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const viewportCenter = window.innerHeight / 2;
        const activeEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => {
            const leftCenter =
              left.boundingClientRect.top + left.boundingClientRect.height / 2;
            const rightCenter =
              right.boundingClientRect.top +
              right.boundingClientRect.height / 2;

            return (
              Math.abs(leftCenter - viewportCenter) -
              Math.abs(rightCenter - viewportCenter)
            );
          })[0];

        if (!activeEntry) {
          return;
        }

        const rawIndex = activeEntry.target.getAttribute('data-journey-index');
        const nextIndex = rawIndex === null ? Number.NaN : Number(rawIndex);

        if (
          !Number.isInteger(nextIndex) ||
          nextIndex < 0 ||
          nextIndex >= chapters.length
        ) {
          return;
        }

        setActiveIndex((currentIndex) =>
          currentIndex === nextIndex ? currentIndex : nextIndex,
        );
      },
      {
        root: null,
        rootMargin: CHAPTER_OBSERVER_ROOT_MARGIN,
        threshold: 0,
      },
    );

    const chapterNodes = chapterRefs.current.slice(0, chapters.length);
    chapterNodes.forEach((node) => {
      if (node) {
        observer.observe(node);
      }
    });

    return () => observer.disconnect();
  }, [chapters.length]);

  return (
    <section
      id="journey"
      className={styles.journey}
      data-theme={activeChapter?.theme}
      aria-labelledby="journey-heading"
    >
      <div className={styles.inner}>
        <header className={styles.intro}>
          <div>
            <p className={styles.eyebrow}>KAF / CHRONOLOGY</p>
            <h2 id="journey-heading">声と景色、その六つの章。</h2>
          </div>
          <p className={styles.introCopy}>
            沿着时间向下阅读花譜的六个创作阶段。桌面端的视觉窗口只在章节切换时更新；移动端与减弱动态模式则保留完整、自然的线性叙事。
          </p>
        </header>

        <nav className={styles.chapterNav} aria-label="KAF journey chapters">
          <ol>
            {chapters.map((chapter, index) => {
              const isActive = index === safeActiveIndex;

              return (
                <li key={chapter.id}>
                  <a
                    href={`#${getChapterAnchorId(chapter.id)}`}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <span className={styles.currentMarker} aria-hidden="true">
                      {isActive ? '●' : '○'}
                    </span>
                    <span className={styles.navSequence} aria-hidden="true">
                      {formatSequence(index)}
                    </span>
                    <span className={styles.navYear}>{chapter.yearLabel}</span>
                    <span className={styles.srOnly}>{chapter.titleJa}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className={styles.track}>
          {shouldReduceMotion === true ? null : (
            <JourneyDesktopStage
              activeIndex={safeActiveIndex}
              chapters={chapters}
            />
          )}

          <ol className={styles.chapterList}>
            {chapters.map((chapter, index) => {
              const anchorId = getChapterAnchorId(chapter.id);
              const titleId = `${anchorId}-title`;
              const isActive = index === safeActiveIndex;
              const visuals = chapter.secondaryVisual
                ? [chapter.primaryVisual, chapter.secondaryVisual]
                : [chapter.primaryVisual];

              return (
                <li key={chapter.id} className={styles.chapterItem}>
                  <article
                    id={anchorId}
                    ref={(node) => {
                      chapterRefs.current[index] = node;
                    }}
                    className={styles.chapterArticle}
                    data-active={isActive ? 'true' : undefined}
                    data-theme={chapter.theme}
                    data-journey-index={index}
                    aria-labelledby={titleId}
                  >
                    <div className={styles.chapterHeading}>
                      <p className={styles.chapterKicker}>
                        <span aria-hidden="true">{formatSequence(index)}</span>
                        <span>{chapter.period}</span>
                      </p>
                      <p className={styles.chapterYear}>{chapter.yearLabel}</p>
                      <h3 id={titleId}>{chapter.titleJa}</h3>
                      <p className={styles.chapterTitleEn} lang="en">
                        {chapter.titleEn}
                      </p>
                    </div>

                    <div className={styles.chapterMedia}>
                      {visuals.map((visual) => (
                        <ChapterVisual
                          key={`${chapter.id}-${visual.src}`}
                          visual={visual}
                        />
                      ))}
                    </div>

                    <p className={styles.summary}>{chapter.summary}</p>

                    <ol className={styles.milestones} aria-label="Milestones">
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
                            aria-label={`Milestone source: ${milestone.label}`}
                          >
                            Source
                          </a>
                        </li>
                      ))}
                    </ol>
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
