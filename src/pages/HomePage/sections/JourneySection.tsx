import * as Tabs from '@radix-ui/react-tabs';
import { motion, useReducedMotion } from 'motion/react';
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
  secondaryVisual?: JourneyVisual;
}

interface JourneySectionProps {
  chapters: readonly JourneyChapter[];
}

const panelTransition = {
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1],
} as const;

export function JourneySection({ chapters }: JourneySectionProps) {
  const firstChapterId = chapters[0]?.id ?? '';
  const [activeId, setActiveId] = useState(firstChapterId);
  const [direction, setDirection] = useState(1);
  const shouldReduceMotion = useReducedMotion();
  const tabListRef = useRef<HTMLDivElement>(null);
  const activeIndex = Math.max(
    chapters.findIndex((chapter) => chapter.id === activeId),
    0,
  );
  const activeChapter = chapters[activeIndex];

  useEffect(() => {
    if (!chapters.some((chapter) => chapter.id === activeId)) {
      setActiveId(chapters[0]?.id ?? '');
    }
  }, [activeId, chapters]);

  useEffect(() => {
    const activeTrigger = tabListRef.current?.querySelector<HTMLElement>(
      `[data-era-id="${activeId}"]`,
    );

    if (typeof activeTrigger?.scrollIntoView === 'function') {
      activeTrigger.scrollIntoView({
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [activeId, shouldReduceMotion]);

  if (!activeChapter) {
    return null;
  }

  const selectChapter = (nextId: string) => {
    const nextIndex = chapters.findIndex((chapter) => chapter.id === nextId);

    if (nextIndex < 0 || nextId === activeId) {
      return;
    }

    setDirection(nextIndex > activeIndex ? 1 : -1);
    setActiveId(nextId);
  };

  const goToChapter = (nextIndex: number) => {
    const nextChapter = chapters[nextIndex];

    if (nextChapter) {
      selectChapter(nextChapter.id);
    }
  };

  const previousChapter = chapters[activeIndex - 1];
  const nextChapter = chapters[activeIndex + 1];

  return (
    <section
      id="journey"
      className={styles.journey}
      data-theme={activeChapter.theme}
      aria-labelledby="journey-heading"
    >
      <div className={styles.inner}>
        <SectionHeading id="journey-heading" tone="light">
          成长轨迹
        </SectionHeading>

        <Tabs.Root
          className={styles.theatre}
          value={activeId}
          onValueChange={selectChapter}
          activationMode="automatic"
        >
          <Tabs.List
            className={styles.eraRail}
            aria-label="花谱成长阶段"
            ref={tabListRef}
          >
            {chapters.map((chapter) => (
              <Tabs.Trigger
                className={styles.eraTrigger}
                data-era-id={chapter.id}
                key={chapter.id}
                value={chapter.id}
                aria-label={`${chapter.yearLabel}：${chapter.titleZh}`}
              >
                {chapter.yearLabel}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {chapters.map((chapter) => (
            <Tabs.Content
              className={styles.panel}
              key={chapter.id}
              value={chapter.id}
            >
              <motion.article
                className={styles.panelInner}
                data-testid="journey-era-panel"
                initial={
                  shouldReduceMotion ? false : { opacity: 0, x: direction * 24 }
                }
                animate={{ opacity: 1, x: 0 }}
                transition={
                  shouldReduceMotion ? { duration: 0 } : panelTransition
                }
              >
                <div className={styles.visualCollage}>
                  <figure className={styles.primaryVisual}>
                    <ResponsiveArtwork
                      source={chapter.primaryVisual}
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>

                  {chapter.secondaryVisual ? (
                    <figure className={styles.secondaryVisual}>
                      <ResponsiveArtwork
                        source={chapter.secondaryVisual}
                        loading="lazy"
                        decoding="async"
                      />
                    </figure>
                  ) : null}
                </div>

                <div className={styles.story}>
                  <header className={styles.storyHeader}>
                    <p className={styles.year}>{chapter.yearLabel}</p>
                    <h3>{chapter.titleZh}</h3>
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

                  <div className={styles.panelActions}>
                    <button
                      type="button"
                      disabled={!previousChapter}
                      onClick={() => goToChapter(activeIndex - 1)}
                      aria-label={
                        previousChapter
                          ? `上一阶段：${previousChapter.titleZh}`
                          : '已是第一个阶段'
                      }
                    >
                      上一阶段
                    </button>
                    <button
                      type="button"
                      disabled={!nextChapter}
                      onClick={() => goToChapter(activeIndex + 1)}
                      aria-label={
                        nextChapter
                          ? `下一阶段：${nextChapter.titleZh}`
                          : '已是最后一个阶段'
                      }
                    >
                      下一阶段
                    </button>
                  </div>
                </div>
              </motion.article>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </div>
    </section>
  );
}
