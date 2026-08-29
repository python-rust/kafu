import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { lazy, Suspense, useMemo, useState } from 'react';
import type { Slide } from 'yet-another-react-lightbox';

import { MediaCredit } from '../components/MediaCredit';
import { SectionHeading } from '../components/SectionHeading';
import styles from './GallerySection.module.css';

const loadGalleryLightbox = () => import('./GalleryLightbox');
const GalleryLightbox = lazy(loadGalleryLightbox);

export interface GalleryVisual {
  id: string;
  title: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  credit: string;
  sourceUrl: string;
}

interface GallerySectionProps {
  visuals: readonly GalleryVisual[];
  title?: string;
}

const stageTransition = {
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1],
} as const;

export function GallerySection({
  visuals,
  title = '視覚',
}: GallerySectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const safeActiveIndex = Math.min(
    activeIndex,
    Math.max(visuals.length - 1, 0),
  );
  const activeVisual = visuals[safeActiveIndex];
  const slides = useMemo<readonly Slide[]>(
    () =>
      visuals.map((visual) => ({
        src: visual.src,
        alt: visual.alt,
        width: visual.width,
        height: visual.height,
        imageFit: 'contain',
      })),
    [visuals],
  );

  if (!activeVisual) {
    return null;
  }

  const changeActiveVisual = (index: number) => {
    setActiveIndex(index);
  };

  const openLightbox = () => {
    setLightboxOpen(true);
  };

  return (
    <section
      className={styles.section}
      id="visuals"
      aria-labelledby="visuals-title"
    >
      <div className={styles.backdrop} aria-hidden="true">
        <AnimatePresence initial={false} mode="sync">
          <motion.img
            key={activeVisual.id}
            src={activeVisual.src}
            alt=""
            width={activeVisual.width}
            height={activeVisual.height}
            loading="lazy"
            decoding="async"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : stageTransition}
          />
        </AnimatePresence>
      </div>

      <div className={styles.inner}>
        <SectionHeading id="visuals-title" tone="light">
          {title}
        </SectionHeading>

        <div className={styles.theatre}>
          <button
            className={styles.stageButton}
            type="button"
            onClick={openLightbox}
            onFocus={() => void loadGalleryLightbox()}
            onPointerEnter={() => void loadGalleryLightbox()}
            aria-label={`${activeVisual.title}を拡大表示`}
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                className={styles.stageVisual}
                key={activeVisual.id}
                initial={
                  shouldReduceMotion ? false : { opacity: 0, scale: 1.012 }
                }
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.994 }}
                transition={
                  shouldReduceMotion ? { duration: 0 } : stageTransition
                }
              >
                <img
                  src={activeVisual.src}
                  alt={activeVisual.alt}
                  width={activeVisual.width}
                  height={activeVisual.height}
                  loading="lazy"
                  decoding="async"
                />
              </motion.span>
            </AnimatePresence>
            <span className={styles.expandIcon} aria-hidden="true">
              拡大
            </span>
          </button>

          <div className={styles.activeMeta} aria-live="polite">
            <h3>{activeVisual.title}</h3>
            <MediaCredit
              credit={activeVisual.credit}
              href={activeVisual.sourceUrl}
              subject={activeVisual.title}
              tone="light"
            />
          </div>
        </div>

        <ol className={styles.thumbnailRail} aria-label="画像を選ぶ">
          {visuals.map((visual, index) => {
            const isActive = index === safeActiveIndex;

            return (
              <li key={visual.id}>
                <button
                  type="button"
                  className={styles.thumbnailButton}
                  data-selected={isActive ? 'true' : undefined}
                  aria-pressed={isActive}
                  aria-label={`${visual.title}を表示`}
                  onClick={() => changeActiveVisual(index)}
                >
                  <span className={styles.thumbnailImage}>
                    <img
                      src={visual.src}
                      alt=""
                      width={visual.width}
                      height={visual.height}
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <span className={styles.thumbnailTitle}>{visual.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {lightboxOpen ? (
        <Suspense fallback={null}>
          <GalleryLightbox
            className={styles.lightbox ?? ''}
            open
            close={() => setLightboxOpen(false)}
            index={safeActiveIndex}
            slides={slides}
            carousel={{ finite: true, imageFit: 'contain', preload: 1 }}
            controller={{
              aria: true,
              closeOnBackdropClick: true,
              closeOnEscape: true,
            }}
            animation={{ fade: 220, swipe: 320, navigation: 280 }}
            labels={{
              Previous: '前の画像',
              Next: '次の画像',
              Close: '閉じる',
              Slide: '画像',
              Carousel: '画像一覧',
              Lightbox: '画像を拡大表示',
              'Photo gallery': '花譜の視覚資料',
              '{index} of {total}': '{total}枚中{index}枚',
            }}
            on={{
              view: ({ index }) => setActiveIndex(index),
            }}
          />
        </Suspense>
      ) : null}
    </section>
  );
}
