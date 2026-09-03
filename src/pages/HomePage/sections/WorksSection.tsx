import {
  ResponsiveArtwork,
  type ResponsiveArtworkSource,
} from '../components/ResponsiveArtwork';
import {
  FEATURED_WORK_ARTWORK_SIZES,
  SUPPORTING_WORK_ARTWORK_SIZES,
} from '../components/artworkSizes';
import { SectionHeading } from '../components/SectionHeading';
import styles from './WorksSection.module.css';

export interface WorkVisual extends ResponsiveArtworkSource {}

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

function WorkMeta({ work }: { work: WorkItem }) {
  return (
    <div className={styles.workMeta}>
      <time dateTime={work.releaseDateTime}>{work.releaseDate}</time>
      <span>{work.kind}</span>
    </div>
  );
}

export function WorksSection({ works, title = '代表作品' }: WorksSectionProps) {
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
                  <ResponsiveArtwork
                    source={featuredWork.visual}
                    loading="lazy"
                    fetchPriority="auto"
                    decoding="async"
                    sizes={FEATURED_WORK_ARTWORK_SIZES}
                  />
                </div>
              </figure>
            ) : (
              <div className={styles.featuredFallback} aria-hidden="true">
                {featuredWork.title}
              </div>
            )}
          </div>

          <div className={styles.featuredCopy}>
            <WorkMeta work={featuredWork} />
            <h3 lang="ja">{featuredWork.title}</h3>
            <p>{featuredWork.description}</p>
            <a
              className={styles.officialLink}
              href={featuredWork.sourceUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`${featuredWork.title}的官方页面（在新窗口打开）`}
            >
              查看官方页面 <span aria-hidden="true">↗</span>
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
                      <ResponsiveArtwork
                        source={work.visual}
                        loading="lazy"
                        fetchPriority="auto"
                        decoding="async"
                        sizes={SUPPORTING_WORK_ARTWORK_SIZES}
                      />
                    </div>
                  </figure>
                ) : (
                  <div className={styles.typeFallback} aria-hidden="true">
                    {work.title}
                  </div>
                )}
              </div>

              <div className={styles.supportingCopy}>
                <WorkMeta work={work} />
                <h3 lang="ja">{work.title}</h3>
                <p>{work.description}</p>
                <a
                  className={styles.officialLink}
                  href={work.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${work.title}的官方页面（在新窗口打开）`}
                >
                  查看官方页面 <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
