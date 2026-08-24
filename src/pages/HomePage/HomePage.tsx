import { motion } from 'motion/react';

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
            一个正在形成中的数字观测站。音乐、时间与视觉将逐层进入这个空间。
          </p>
        </motion.div>
      </section>
    </main>
  );
}
