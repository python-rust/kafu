import { motion, useReducedMotion } from 'motion/react';

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

export interface HeroMetaItem {
  label: string;
  value: string;
}

export interface HeroSectionProps {
  visual: HeroVisual;
  statement: string;
  description: string;
  officialUrl: string;
  titleJa?: string;
  titleEn?: string;
  eyebrow?: string;
  projectName?: string;
  statusLabel?: string;
  officialLabel?: string;
  journeyHref?: `#${string}`;
  journeyLabel?: string;
  metadata?: readonly HeroMetaItem[];
}

const revealTransition = {
  duration: 0.66,
  ease: [0.22, 1, 0.36, 1],
} as const;

const visualTransition = {
  duration: 0.82,
  delay: 0.06,
  ease: [0.16, 1, 0.3, 1],
} as const;

function ExternalArrow() {
  return <span aria-hidden="true">↗</span>;
}

export function HeroSection({
  visual,
  statement,
  description,
  officialUrl,
  titleJa = '花譜',
  titleEn = 'KAF',
  eyebrow = 'OBSERVATION / KAF PHENOMENON',
  projectName = 'KAF Observatory',
  statusLabel = 'UNOFFICIAL / NON-COMMERCIAL',
  officialLabel = 'Official Site',
  journeyHref = '#journey',
  journeyLabel = 'Enter the Journey',
  metadata = [],
}: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = shouldReduceMotion === false;
  const revealInitial = shouldAnimate ? { opacity: 0, y: 18 } : false;
  const visualInitial = shouldAnimate
    ? { opacity: 0, scale: 0.985, y: 12 }
    : false;

  return (
    <section className={styles.hero} id="top" aria-labelledby="hero-title">
      <div className={styles.signalField} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className={styles.heroGrid}>
        <motion.div
          className={styles.identityPanel}
          initial={revealInitial}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldAnimate ? revealTransition : { duration: 0 }}
        >
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title} id="hero-title">
            <span className={styles.titleJa}>{titleJa}</span>
            <span className={styles.titleEn}>{titleEn}</span>
          </h1>
          <p className={styles.projectLine}>
            <span>{projectName}</span>
            <span aria-hidden="true">/</span>
            <strong>{statusLabel}</strong>
          </p>
        </motion.div>

        <motion.figure
          className={styles.visual}
          initial={visualInitial}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={shouldAnimate ? visualTransition : { duration: 0 }}
        >
          <div className={styles.visualFrame}>
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
            <span className={styles.visualIndex} aria-hidden="true">
              SIGNAL / 001
            </span>
            <span className={styles.registrationTop} aria-hidden="true" />
            <span className={styles.registrationBottom} aria-hidden="true" />
          </div>
          <figcaption className={styles.caption}>
            <span>VISUAL CREDIT</span>
            <a
              href={visual.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {visual.credit} <ExternalArrow />
            </a>
          </figcaption>
        </motion.figure>

        <motion.div
          className={styles.storyPanel}
          initial={revealInitial}
          animate={{ opacity: 1, y: 0 }}
          transition={
            shouldAnimate
              ? { ...revealTransition, delay: 0.1 }
              : { duration: 0 }
          }
        >
          <p className={styles.statement}>{statement}</p>

          <div className={styles.actions}>
            <a
              className={styles.officialLink}
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {officialLabel} <ExternalArrow />
            </a>
            <a className={styles.journeyLink} href={journeyHref}>
              <span>{journeyLabel}</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          <p className={styles.description}>{description}</p>

          {metadata.length > 0 ? (
            <dl className={styles.metadata}>
              {metadata.map((item) => (
                <div key={`${item.label}-${item.value}`}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
