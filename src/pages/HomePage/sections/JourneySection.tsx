import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
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
  originalTitle: string;
  changeFrom: string;
  changeTo: string;
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

  return (
    <aside
      className={styles.stage}
      aria-hidden="true"
      data-testid="journey-sticky-stage"
    >
      <div className={styles.stageFrame}>
        <div className={styles.visualStack}>
          <AnimatePresence initial={false} mode="sync">
            <motion.figure
              key={activeChapter.id}
              className={styles.visualLayer}
              initial={{ opacity: 0, scale: 1.018 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.992 }}
              transition={stageVisualTransition}
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
            key={activeChapter.id}
            className={styles.stageMeta}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className={styles.stageYear}>{activeChapter.yearLabel}</span>
            <strong className={styles.stageTitleZh}>
              {activeChapter.titleZh}
            </strong>
            <span className={styles.stageOriginalTitle} lang="ja">
              {activeChapter.originalTitle}
            </span>
            <span className={styles.stageChange}>
              <span>{activeChapter.changeFrom}</span>
              <motion.span
                className={styles.stageChangeLine}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              />
              <span>{activeChapter.changeTo}</span>
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  );
}

function ChapterVisual({ visual }: { visual: JourneyVisual }) {
  return (
    <figure className={styles.chapterFigure}>
      <ResponsiveArtwork source={visual} loading="lazy" decoding="async" />
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
        <SectionHeading id="journey-heading" tone="light">
          成长轨迹
        </SectionHeading>

        <nav className={styles.chapterNav} aria-label="花谱成长阶段">
          <ol>
            {chapters.map((chapter, index) => {
              const isActive = index === safeActiveIndex;

              return (
                <li key={chapter.id}>
                  <a
                    href={`#${getChapterAnchorId(chapter.id)}`}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <span>{chapter.yearLabel}</span>
                    <span className={styles.srOnly}>{chapter.titleZh}</span>
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
                      <p className={styles.chapterYear}>{chapter.yearLabel}</p>
                      <h3 id={titleId}>{chapter.titleZh}</h3>
                      <p className={styles.originalTitle} lang="ja">
                        {chapter.originalTitle}
                      </p>
                      <p className={styles.changePair}>
                        <span>{chapter.changeFrom}</span>
                        <span aria-hidden="true">→</span>
                        <span>{chapter.changeTo}</span>
                      </p>
                    </div>

                    <div className={styles.chapterMedia}>
                      {visuals.map((visual) => (
                        <ChapterVisual
                          key={`${chapter.id}-${visual.id}`}
                          visual={visual}
                        />
                      ))}
                    </div>

                    <p className={styles.summary}>{chapter.summary}</p>

                    <ol className={styles.milestones} aria-label="关键节点">
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
