import { useReducedMotion } from 'motion/react';
import * as m from 'motion/react-m';

import {
  ResponsiveArtwork,
  type ResponsiveArtworkSource,
} from '../components/ResponsiveArtwork';
import styles from './HeroSection.module.css';

export interface HeroVisual extends ResponsiveArtworkSource {}

export interface HeroSectionProps {
  visual: HeroVisual;
  title?: string;
  role?: string;
  primaryHref?: `#${string}`;
  primaryLabel?: string;
  secondaryHref?: `#${string}`;
  secondaryLabel?: string;
}

const revealTransition = {
  duration: 0.66,
  ease: [0.22, 1, 0.36, 1],
} as const;

export function HeroSection({
  visual,
  title = '花谱',
  role = '日本虚拟歌手，KAMITSUBAKI STUDIO 旗下艺人。',
  primaryHref = '#about',
  primaryLabel = '人物介绍',
  secondaryHref = '#works',
  secondaryLabel = '代表作品',
}: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = shouldReduceMotion === false;
  const revealInitial = shouldAnimate ? { opacity: 0, y: 20 } : false;

  return (
    <section className={styles.hero} id="top" aria-labelledby="hero-title">
      <m.figure
        className={styles.visual}
        initial={shouldAnimate ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={shouldAnimate ? { duration: 0.9 } : { duration: 0 }}
      >
        <ResponsiveArtwork
          className={styles.visualImage}
          source={visual}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          sizes="100vw"
          preservePlaceholder
        />
      </m.figure>

      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.inner}>
        <m.div
          className={styles.copy}
          initial={revealInitial}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldAnimate ? revealTransition : { duration: 0 }}
        >
          <h1 id="hero-title">{title}</h1>
          <p className={styles.identityLine}>
            <span lang="ja">花譜</span> / KAF
          </p>
          <p className={styles.role}>{role}</p>

          <div className={styles.actions}>
            <a className={styles.primaryLink} href={primaryHref}>
              {primaryLabel} <span aria-hidden="true">↓</span>
            </a>
            <a className={styles.secondaryLink} href={secondaryHref}>
              {secondaryLabel} <span aria-hidden="true">→</span>
            </a>
          </div>
        </m.div>
      </div>
    </section>
  );
}
