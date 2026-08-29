import { MediaCredit } from '../components/MediaCredit';
import { SectionHeading } from '../components/SectionHeading';
import styles from './WorksSection.module.css';

export interface WorkVisual {
  src: string;
  alt: string;
  width: number;
  height: number;
  credit?: string;
  sourceUrl?: string;
}

export interface WorkItem {
  id: string;
  title: string;
  releaseDate: string;
  releaseDateTime?: string;
  kind: string;
  description: string;
  sourceUrl: string;
  featured?: boolean;
  visual?: WorkVisual;
}

interface WorksSectionProps {
  works: readonly WorkItem[];
  title?: string;
}

function WorkMediaCredit({
  title,
  visual,
}: {
  title: string;
  visual: WorkVisual;
}) {
  if (!visual.credit) {
    return null;
  }

  if (!visual.sourceUrl) {
    return <span className={styles.creditText}>{visual.credit}</span>;
  }

  return (
    <MediaCredit
      credit={visual.credit}
      href={visual.sourceUrl}
      subject={title}
      tone="light"
    />
  );
}

function WorkMeta({ work }: { work: WorkItem }) {
  return (
    <div className={styles.workMeta}>
      <time dateTime={work.releaseDateTime}>{work.releaseDate}</time>
      <span>{work.kind}</span>
    </div>
  );
}

export function WorksSection({ works, title = '作品' }: WorksSectionProps) {
  const featuredWorks = works.filter((work) => work.featured);
  const [featuredWork] = featuredWorks;

  if (!featuredWork || featuredWorks.length !== 1) {
    throw new Error('WorksSection requires exactly one featured work.');
  }

  const supportingWorks = works.filter((work) => work !== featuredWork);

  return (
    <section
      className={styles.section}
      id="works"
      aria-labelledby="works-title"
    >
      <div className={styles.inner}>
        <SectionHeading id="works-title" tone="light">
          {title}
        </SectionHeading>

        <article className={styles.featuredWork}>
          <div className={styles.featuredMedia}>
            {featuredWork.visual ? (
              <figure className={styles.featuredFigure}>
                <div className={styles.featuredFrame}>
                  <img
                    src={featuredWork.visual.src}
                    alt={featuredWork.visual.alt}
                    width={featuredWork.visual.width}
                    height={featuredWork.visual.height}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <figcaption>
                  <WorkMediaCredit
                    title={featuredWork.title}
                    visual={featuredWork.visual}
                  />
                </figcaption>
              </figure>
            ) : (
              <div className={styles.featuredFallback} aria-hidden="true">
                {featuredWork.title}
              </div>
            )}
          </div>

          <div className={styles.featuredCopy}>
            <WorkMeta work={featuredWork} />
            <h3>{featuredWork.title}</h3>
            <p>{featuredWork.description}</p>
            <a
              className={styles.officialLink}
              href={featuredWork.sourceUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`${featuredWork.title}の公式ページ（新しいタブで開く）`}
            >
              公式ページ <span aria-hidden="true">↗</span>
            </a>
          </div>
        </article>

        <div className={styles.supportingWorks}>
          {supportingWorks.map((work) => (
            <article className={styles.supportingWork} key={work.id}>
              <div className={styles.supportingMedia}>
                {work.visual ? (
                  <figure className={styles.supportingFigure}>
                    <div className={styles.supportingFrame}>
                      <img
                        src={work.visual.src}
                        alt={work.visual.alt}
                        width={work.visual.width}
                        height={work.visual.height}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <figcaption>
                      <WorkMediaCredit
                        title={work.title}
                        visual={work.visual}
                      />
                    </figcaption>
                  </figure>
                ) : (
                  <div className={styles.typeFallback} aria-hidden="true">
                    {work.title}
                  </div>
                )}
              </div>

              <div className={styles.supportingCopy}>
                <WorkMeta work={work} />
                <h3>{work.title}</h3>
                <p>{work.description}</p>
                <a
                  className={styles.officialLink}
                  href={work.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${work.title}の公式ページ（新しいタブで開く）`}
                >
                  公式ページ <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
