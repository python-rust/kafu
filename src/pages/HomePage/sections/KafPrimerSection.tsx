import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import {
  ResponsiveArtwork,
  type ResponsiveArtworkSource,
} from '../components/ResponsiveArtwork';
import { SectionHeading } from '../components/SectionHeading';
import styles from './KafPrimerSection.module.css';

export interface KafPrimerBeat {
  id: string;
  title: string;
  statement: string;
  summary: string;
  visual: ResponsiveArtworkSource;
}

interface KafPrimerSectionProps {
  beats: readonly KafPrimerBeat[];
  title?: string;
}

const stageTransition = {
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1],
} as const;

export function KafPrimerSection({
  beats,
  title = '认识花谱',
}: KafPrimerSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const stepRefs = useRef<Array<HTMLElement | null>>([]);
  const safeActiveIndex = Math.min(activeIndex, Math.max(beats.length - 1, 0));
  const activeBeat = beats[safeActiveIndex];

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const viewportCenter = window.innerHeight * 0.48;
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

        const rawIndex = activeEntry.target.getAttribute('data-primer-index');
        const nextIndex = rawIndex === null ? Number.NaN : Number(rawIndex);

        if (
          Number.isInteger(nextIndex) &&
          nextIndex >= 0 &&
          nextIndex < beats.length
        ) {
          setActiveIndex(nextIndex);
        }
      },
      {
        root: null,
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0,
      },
    );

    const stepNodes = stepRefs.current.slice(0, beats.length);
    stepNodes.forEach((node) => {
      if (node) {
        observer.observe(node);
      }
    });

    return () => observer.disconnect();
  }, [beats.length]);

  if (!activeBeat) {
    return null;
  }

  return (
    <section
      className={styles.section}
      id="about"
      aria-labelledby="about-title"
    >
      <div className={styles.inner}>
        <SectionHeading id="about-title" tone="light">
          {title}
        </SectionHeading>

        <div className={styles.track}>
          {shouldReduceMotion === true ? null : (
            <aside
              className={styles.stage}
              data-testid="primer-sticky-stage"
              aria-hidden="true"
            >
              <div className={styles.stageFrame}>
                <AnimatePresence initial={false} mode="sync">
                  <motion.figure
                    className={styles.stageVisual}
                    key={activeBeat.id}
                    initial={{ opacity: 0, scale: 1.018 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.992 }}
                    transition={stageTransition}
                  >
                    <ResponsiveArtwork
                      source={activeBeat.visual}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </motion.figure>
                </AnimatePresence>

                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    className={styles.stageCopy}
                    key={activeBeat.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <strong>{activeBeat.title}</strong>
                    <span>{activeBeat.statement}</span>
                  </motion.div>
                </AnimatePresence>

                <div className={styles.progress}>
                  {beats.map((beat, index) => (
                    <span
                      key={beat.id}
                      data-active={
                        index === safeActiveIndex ? 'true' : undefined
                      }
                    />
                  ))}
                </div>
              </div>
            </aside>
          )}

          <ol className={styles.steps}>
            {beats.map((beat, index) => {
              const active = index === safeActiveIndex;

              return (
                <li className={styles.stepItem} key={beat.id}>
                  <motion.article
                    ref={(node) => {
                      stepRefs.current[index] = node;
                    }}
                    className={styles.step}
                    data-active={active ? 'true' : undefined}
                    data-primer-index={index}
                    initial={false}
                    animate={{
                      opacity: active || shouldReduceMotion ? 1 : 0.78,
                      y: 0,
                    }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
                    }
                  >
                    <figure className={styles.mobileVisual}>
                      <ResponsiveArtwork
                        source={beat.visual}
                        loading="lazy"
                        decoding="async"
                      />
                    </figure>

                    <div className={styles.stepCopy}>
                      <h3>{beat.title}</h3>
                      <p className={styles.statement}>{beat.statement}</p>
                      <p className={styles.summary}>{beat.summary}</p>
                    </div>
                  </motion.article>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
