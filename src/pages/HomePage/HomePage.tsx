import { MotionConfig, motion } from 'motion/react';

import {
  heroVisual,
  officialLinks,
  selectedWorks,
  visualArchive,
} from '../../content/kaf';
import styles from './HomePage.module.css';

const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
} as const;

const imageReveal = {
  initial: { opacity: 0, scale: 0.985 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] },
} as const;

function ExternalArrow() {
  return <span aria-hidden="true">↗</span>;
}

export function HomePage() {
  const featuredWork = selectedWorks.find((work) => work.featured);

  if (!featuredWork) {
    throw new Error('Selected works must include one featured work.');
  }

  const supportingWorks = selectedWorks.filter((work) => work !== featuredWork);

  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.page}>
        <header className={styles.topbar}>
          <a
            className={styles.brand}
            href="#top"
            aria-label="KAF Observatory 首页顶部"
          >
            <span className={styles.brandMain}>KAF</span>
            <span className={styles.brandSub}>OBSERVATORY</span>
          </a>

          <nav className={styles.nav} aria-label="页面章节导航">
            <a href="#about">ABOUT</a>
            <a href="#works">WORKS</a>
            <a href="#visuals">VISUALS</a>
            <a href="#links">LINKS</a>
          </nav>

          <span className={styles.fanLabel}>
            UNOFFICIAL FAN PROJECT · NON-COMMERCIAL
          </span>
        </header>

        <main>
          <section
            className={styles.hero}
            id="top"
            aria-labelledby="hero-title"
          >
            <div className={styles.heroGrid}>
              <motion.div className={styles.heroCopy} {...reveal}>
                <p className={styles.eyebrow}>
                  OBSERVATION / 001 · VIRTUAL SINGER
                </p>
                <h1 id="hero-title" className={styles.heroTitle}>
                  <span className={styles.heroKanji}>花譜</span>
                  <span className={styles.heroLatin}>KAF</span>
                </h1>

                <p className={styles.heroStatement}>
                  声音像一束无法被固定的光，穿过现实与虚拟，也穿过每一次被重新命名的风景。
                </p>
                <p className={styles.heroBody}>
                  KAF Observatory
                  是一个非官方、非商业的花譜粉丝观测站。我们从音乐、视觉与时间中，整理那些值得再次凝视的瞬间。
                </p>

                <div className={styles.heroActions}>
                  <a
                    className={styles.primaryLink}
                    href="https://kaf.kamitsubaki.jp/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    OFFICIAL SITE <ExternalArrow />
                  </a>
                  <a className={styles.textLink} href="#works">
                    VIEW SELECTED WORKS <span aria-hidden="true">↓</span>
                  </a>
                </div>

                <dl className={styles.heroMeta}>
                  <div>
                    <dt>ACTIVITY</dt>
                    <dd>SINCE 2018</dd>
                  </div>
                  <div>
                    <dt>FIELD</dt>
                    <dd>VOICE / VISUAL / STORY</dd>
                  </div>
                  <div>
                    <dt>ISSUE</dt>
                    <dd>2026 · 01</dd>
                  </div>
                </dl>
              </motion.div>

              <motion.figure className={styles.heroFigure} {...imageReveal}>
                <div className={styles.heroImageFrame}>
                  <img
                    className={styles.heroImage}
                    src={heroVisual.image}
                    alt={heroVisual.alt}
                    width="860"
                    height="484"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                  <span className={styles.imageIndex} aria-hidden="true">
                    01
                  </span>
                  <span className={styles.petalOne} aria-hidden="true" />
                  <span className={styles.petalTwo} aria-hidden="true" />
                </div>
                <figcaption className={styles.heroCaption}>
                  <span>{heroVisual.title}</span>
                  <a
                    href={heroVisual.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {heroVisual.credit} <ExternalArrow />
                  </a>
                </figcaption>
              </motion.figure>
            </div>
          </section>

          <section
            className={styles.section}
            id="about"
            aria-labelledby="about-title"
          >
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>OBSERVATION / 002 · ABOUT</p>
              <h2 id="about-title">声が、風景を変えていく。</h2>
            </div>

            <div className={styles.aboutGrid}>
              <p className={styles.aboutLead}>
                花譜是 KAMITSUBAKI STUDIO 的起点之一。自 2018
                年开始活动以来，她以独特的歌声、虚拟形象与持续扩张的创作世界，连接音乐、影像、舞台和现实空间。
              </p>
              <div className={styles.aboutBody}>
                <p>
                  这个站点不试图复制官方履历，而是选择“观测”的方式：把不同阶段的声音和视觉并置，让新访客能够快速理解她的轮廓，也让熟悉她的人重新发现作品之间的联系。
                </p>
                <a
                  className={styles.inlineLink}
                  href="https://kamitsubaki.jp/artist/kaf/"
                  target="_blank"
                  rel="noreferrer"
                >
                  READ OFFICIAL PROFILE <ExternalArrow />
                </a>
              </div>
              <div className={styles.aboutNotes} aria-label="花譜观测关键词">
                <span>VIRTUAL × REAL</span>
                <span>VOICE AS LANDSCAPE</span>
                <span>KAMITSUBAKI</span>
              </div>
            </div>
          </section>

          <section
            className={`${styles.section} ${styles.worksSection}`}
            id="works"
            aria-labelledby="works-title"
          >
            <div className={styles.sectionHeadingRow}>
              <div className={styles.sectionHeading}>
                <p className={styles.eyebrow}>OBSERVATION / 003 · MUSIC</p>
                <h2 id="works-title">Selected Works</h2>
              </div>
              <p className={styles.sectionIntro}>
                不是完整唱片目录，而是一条从“观测”到“深愛”的小型时间切片。
              </p>
            </div>

            <article className={styles.featuredWork}>
              <div className={styles.featuredNumber} aria-hidden="true">
                01
              </div>
              <div className={styles.featuredMeta}>
                <span>{featuredWork.releaseDate}</span>
                <span>{featuredWork.kind}</span>
                <span>CURRENT OBSERVATION</span>
              </div>
              <div className={styles.featuredCopy}>
                <h3>{featuredWork.title}</h3>
                <p>{featuredWork.description}</p>
                <a
                  href={featuredWork.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  OPEN OFFICIAL SOURCE <ExternalArrow />
                </a>
              </div>
            </article>

            <div className={styles.workList}>
              {supportingWorks.map((work, index) => (
                <article className={styles.workRow} key={work.title}>
                  <span className={styles.workIndex}>
                    {String(index + 2).padStart(2, '0')}
                  </span>
                  <div className={styles.workTitleBlock}>
                    <span>{work.kind}</span>
                    <h3>{work.title}</h3>
                  </div>
                  <p>{work.description}</p>
                  <time dateTime={work.releaseDate.replaceAll('.', '-')}>
                    {work.releaseDate}
                  </time>
                  <a
                    href={work.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${work.title} 官方资料`}
                  >
                    <ExternalArrow />
                  </a>
                </article>
              ))}
            </div>
          </section>

          <section
            className={`${styles.section} ${styles.visualSection}`}
            id="visuals"
            aria-labelledby="visuals-title"
          >
            <div className={styles.sectionHeadingRow}>
              <div className={styles.sectionHeading}>
                <p className={styles.eyebrow}>OBSERVATION / 004 · VISUAL</p>
                <h2 id="visuals-title">Visual Archive</h2>
              </div>
              <p className={styles.sectionIntro}>
                两个早期视觉切片：一个靠近日常，一个回到舞台。图片均从 piapro
                的逐作品非商业许可素材中选择。
              </p>
            </div>

            <div className={styles.visualGrid}>
              {visualArchive.map((visual, index) => (
                <figure className={styles.visualCard} key={visual.title}>
                  <div className={styles.visualImageWrap}>
                    <img
                      src={visual.image}
                      alt={visual.alt}
                      width="860"
                      height="484"
                      loading="lazy"
                      decoding="async"
                    />
                    <span aria-hidden="true">0{index + 2}</span>
                  </div>
                  <figcaption>
                    <div>
                      <span>
                        ARCHIVE / {String(index + 2).padStart(2, '0')}
                      </span>
                      <strong>{visual.title}</strong>
                    </div>
                    <a href={visual.sourceUrl} target="_blank" rel="noreferrer">
                      {visual.credit} <ExternalArrow />
                    </a>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section
            className={styles.linksSection}
            id="links"
            aria-labelledby="links-title"
          >
            <div className={styles.linksInner}>
              <div className={styles.linksIntro}>
                <p className={styles.eyebrow}>OBSERVATION / 005 · OUTBOUND</p>
                <h2 id="links-title">Go to the source.</h2>
                <p>
                  新闻、日程、完整作品与社交动态都应回到官方渠道。这个粉丝站只负责整理观看方式，不替代官方信息源。
                </p>
              </div>

              <div className={styles.officialLinks}>
                {officialLinks.map((link, index) => (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    key={link.label}
                  >
                    <span className={styles.linkIndex}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={styles.linkLabel}>{link.label}</span>
                    <span className={styles.linkNote}>{link.note}</span>
                    <ExternalArrow />
                  </a>
                ))}
              </div>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <div>
            <span className={styles.footerMark}>KAF OBSERVATORY</span>
            <p>
              Unofficial, non-commercial fan project. Not affiliated with KAF or
              KAMITSUBAKI STUDIO.
            </p>
          </div>
          <div className={styles.footerMeta}>
            <span>MEDIA SOURCES · PIAPRO</span>
            <span>CURATED / 2026</span>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
