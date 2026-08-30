import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { lazy, Suspense, useMemo, useState } from 'react';
import type { Slide } from 'yet-another-react-lightbox';

import {
  ResponsiveArtwork,
  type ResponsiveArtworkSource,
} from '../components/ResponsiveArtwork';
import { SectionHeading } from '../components/SectionHeading';
import styles from './GallerySection.module.css';

const loadGalleryLightbox = () => import('./GalleryLightbox');
const GalleryLightbox = lazy(loadGalleryLightbox);

export interface GalleryVisual extends ResponsiveArtworkSource {
  title: string;
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
  title = '视觉档案',
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
        src: visual.highDensity.src,
        alt: visual.alt,
        width: visual.highDensity.width,
        height: visual.highDensity.height,
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
      <div
        className={styles.backdrop}
        aria-hidden="true"
        data-testid="gallery-backdrop"
      >
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={activeVisual.id}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : stageTransition}
          >
            <ResponsiveArtwork
              source={activeVisual}
              variant="thumbnail"
              alt=""
              loading="lazy"
              fetchPriority="low"
              decoding="async"
            />
          </motion.div>
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
            aria-label={`${activeVisual.title}，点击放大`}
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
                <ResponsiveArtwork
                  source={activeVisual}
                  loading="lazy"
                  fetchPriority="low"
                  decoding="async"
                  sizes="(max-width: 56rem) calc(100vw - 2.5rem), (max-width: 88rem) 68vw, 58rem"
                />
              </motion.span>
            </AnimatePresence>
            <span className={styles.expandIcon} aria-hidden="true">
              放大
            </span>
          </button>

          <div className={styles.activeMeta} aria-live="polite">
            <h3 lang="ja">{activeVisual.title}</h3>
          </div>
        </div>

        <ol className={styles.thumbnailRail} aria-label="选择图片">
          {visuals.map((visual, index) => {
            const isActive = index === safeActiveIndex;

            return (
              <li key={visual.id}>
                <button
                  type="button"
                  className={styles.thumbnailButton}
                  data-selected={isActive ? 'true' : undefined}
                  aria-pressed={isActive}
                  aria-label={`${visual.title}，显示此图`}
                  onClick={() => changeActiveVisual(index)}
                >
                  <span className={styles.thumbnailImage}>
                    <ResponsiveArtwork
                      source={visual}
                      variant="thumbnail"
                      alt=""
                      loading="lazy"
                      fetchPriority="low"
                      decoding="async"
                    />
                  </span>
                  <span className={styles.thumbnailTitle} lang="ja">
                    {visual.title}
                  </span>
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
            animation={{ fade: 220, swipe: 320, navigation: 280, zoom: 280 }}
            labels={{
              Previous: '上一张图片',
              Next: '下一张图片',
              Close: '关闭',
              Slide: '图片',
              Carousel: '图片列表',
              Lightbox: '放大查看图片',
              'Photo gallery': '花谱视觉档案',
              '{index} of {total}': '第{index}张，共{total}张',
              'Zoom in': '放大',
              'Zoom out': '缩小',
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
