import { motion } from 'motion/react';

import { Live2DStage } from '../../features/live2d/Live2DStage';
import styles from './HomePage.module.css';

const reveal = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
} as const;

export function HomePage() {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <a className={styles.brand} href="/" aria-label="KAF Observatory 首页">
          KAF
          <span>OBSERVATORY</span>
        </a>

        <span className={styles.fanLabel}>UNOFFICIAL FAN PROJECT · 2026</span>
      </header>

      <section className={styles.hero}>
        <motion.div className={styles.copy} {...reveal}>
          <p className={styles.index}>OBSERVATION / 000</p>
          <h1>
            花譜
            <span>KAF</span>
          </h1>
          <p className={styles.lede}>
            一个正在形成中的数字观测站。现在先让角色活起来，再让音乐、时间与视觉逐层进入这个空间。
          </p>

          <div className={styles.statusRow}>
            <span className={styles.statusDot} aria-hidden="true" />
            <span>2D INTERACTION ONLINE</span>
          </div>
        </motion.div>

        <motion.div
          className={styles.character}
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <Live2DStage />
        </motion.div>

        <aside className={styles.annotation}>
          <span>POINTER TRACKING</span>
          <span>BLINK / BREATH</span>
          <span>CLICK REACTION</span>
        </aside>
      </section>

      <footer className={styles.footer}>
        <span>Prototype runtime: development puppet</span>
        <span>Formal Cubism R5 adapter boundary reserved</span>
      </footer>
    </main>
  );
}
