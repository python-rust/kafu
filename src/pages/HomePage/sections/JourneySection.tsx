import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { useEffect, useRef, useState, type RefObject } from 'react';

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
  trackRef: RefObject<HTMLDivElement | null>;
}

interface JourneyVisualLayerProps {
  chapter: JourneyChapter;
  chapterCount: number;
  index: number;
  progress: MotionValue<number>;
}

const CHAPTER_OBSERVER_ROOT_MARGIN = '-48% 0px -48% 0px';

function formatSequence(index: number) {
  return String(index + 1).padStart(2, '0');
}

function getChapterAnchorId(id: string) {
  return `journey-${id}`;
}

function getLayerOpacityMapping(
  index: number,
  chapterCount: number,
): { input: number[]; output: number[] } {
  if (chapterCount <= 1) {
    return {
      input: [0, 1],
      output: [1, 1],
    };
  }

  const segmentSize = 1 / chapterCount;
  const segmentStart = index * segmentSize;
  const segmentEnd = (index + 1) * segmentSize;
  const fade = segmentSize * 0.22;

  if (index === 0) {
    return {
      input: [0, segmentEnd - fade, segmentEnd + fade],
      output: [1, 1, 0],
    };
  }

  if (index === chapterCount - 1) {
    return {
      input: [segmentStart - fade, segmentStart + fade, 1],
      output: [0, 1, 1],
    };
  }

  return {
    input: [
      segmentStart - fade,
      segmentStart + fade,
      segmentEnd - fade,
      segmentEnd + fade,
    ],
    output: [0, 1, 1, 0],
  };
}

function JourneyVisualLayer({
  chapter,
  chapterCount,
  index,
  progress,
}: JourneyVisualLayerProps) {
  const segmentSize = 1 / chapterCount;
  const segmentStart = index * segmentSize;
  const segmentEnd = (index + 1) * segmentSize;
  const segmentCenter = segmentStart + segmentSize / 2;
  const opacityMapping = getLayerOpacityMapping(index, chapterCount);
  const opacity = useTransform(
    progress,
    opacityMapping.input,
    opacityMapping.output,
  );
  const y = useTransform(
    progress,
    [segmentStart, segmentCenter, segmentEnd],
    [18, 0, -18],
  );
  const scale = useTransform(
    progress,
    [segmentStart, segmentCenter, segmentEnd],
    [1.035, 1, 1.02],
  );

  return (
    <motion.figure
      className={styles.visualLayer}
      style={{ opacity, scale, y }}
      aria-hidden="true"
    >
      <img
        src={chapter.primaryVisual.src}
        alt=""
        width={chapter.primaryVisual.width}
        height={chapter.primaryVisual.height}
        loading="lazy"
        decoding="async"
        style={
          chapter.primaryVisual.objectPosition
            ? { objectPosition: chapter.primaryVisual.objectPosition }
            : undefined
        }
      />
    </motion.figure>
  );
}

function JourneyDesktopStage({
  activeIndex,
  chapters,
  trackRef,
}: JourneyDesktopStageProps) {
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });
  const progressScale = useTransform(scrollYProgress, [0, 1], [0.02, 1]);
  const activeChapter = chapters[activeIndex];

  if (!activeChapter) {
    return null;
  }

  const visibleLayers = chapters
    .map((chapter, index) => ({ chapter, index }))
    .filter(({ index }) => Math.abs(index - activeIndex) <= 1);

  return (
    <aside
      className={styles.stage}
      aria-hidden="true"
      data-testid="journey-sticky-stage"
    >
      <div className={styles.stageFrame}>
        <div className={styles.stageSignal} />
        <div className={styles.visualStack}>
          {visibleLayers.map(({ chapter, index }) => (
            <JourneyVisualLayer
              key={chapter.id}
              chapter={chapter}
              chapterCount={chapters.length}
              index={index}
              progress={scrollYProgress}
            />
          ))}
        </div>

        <motion.div
          key={activeChapter.id}
          className={styles.stageMeta}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
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

        <div className={styles.stageProgress}>
          <span className={styles.stageProgressTrack}>
            <motion.span
              className={styles.stageProgressFill}
              style={{ scaleY: progressScale }}
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
  const trackRef = useRef<HTMLDivElement | null>(null);
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
        const activeEntry = entries.find((entry) => entry.isIntersecting);

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
            <p className={styles.eyebrow}>KAF PHENOMENON CHAPTERS</p>
            <h2 id="journey-heading">声と景色、その六つの章。</h2>
          </div>
          <p className={styles.introCopy}>
            Scroll through the chronology. Every chapter remains readable
            without motion; on larger screens the visual stage follows the same
            native document flow.
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

        <div className={styles.track} ref={trackRef}>
          {shouldReduceMotion === true ? null : (
            <JourneyDesktopStage
              activeIndex={safeActiveIndex}
              chapters={chapters}
              trackRef={trackRef}
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
