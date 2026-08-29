import { motion, useReducedMotion } from 'motion/react';

import { MediaCredit } from '../components/MediaCredit';
import styles from './HeroSection.module.css';

export interface HeroVisual {
  src: string;
  alt: string;
  width: number;
  height: number;
  credit: string;
  sourceUrl: string;
  objectPosition?: string;
}

export interface HeroSectionProps {
  visual: HeroVisual;
  statement: string;
  description: string;
  officialUrl: string;
  titleJa?: string;
  officialLabel?: string;
  journeyHref?: `#${string}`;
  journeyLabel?: string;
}

const revealTransition = {
  duration: 0.66,
  ease: [0.22, 1, 0.36, 1],
} as const;

export function HeroSection({
  visual,
  statement,
  description,
  officialUrl,
  titleJa = '花譜',
  officialLabel = '公式サイト',
  journeyHref = '#journey',
  journeyLabel = '軌跡を見る',
}: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = shouldReduceMotion === false;
  const revealInitial = shouldAnimate ? { opacity: 0, y: 20 } : false;

  return (
    <section className={styles.hero} id="top" aria-labelledby="hero-title">
      <motion.figure
        className={styles.visual}
        initial={shouldAnimate ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={shouldAnimate ? { duration: 0.9 } : { duration: 0 }}
      >
        <img
          className={styles.visualImage}
          src={visual.src}
          alt={visual.alt}
          width={visual.width}
          height={visual.height}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          style={
            visual.objectPosition
              ? { objectPosition: visual.objectPosition }
              : undefined
          }
        />
      </motion.figure>

      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.inner}>
        <motion.div
          className={styles.copy}
          initial={revealInitial}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldAnimate ? revealTransition : { duration: 0 }}
        >
          <h1 id="hero-title">{titleJa}</h1>
          <p className={styles.statement}>{statement}</p>
          <p className={styles.description}>{description}</p>

          <div className={styles.actions}>
            <a
              className={styles.officialLink}
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {officialLabel} <span aria-hidden="true">↗</span>
            </a>
            <a className={styles.journeyLink} href={journeyHref}>
              {journeyLabel} <span aria-hidden="true">↓</span>
            </a>
          </div>
        </motion.div>

        <p className={styles.credit}>
          <MediaCredit
            credit={visual.credit}
            href={visual.sourceUrl}
            subject={titleJa}
            tone="light"
          />
        </p>
      </div>
    </section>
  );
}
