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
  eyebrow?: string;
  title?: string;
  intro?: string;
}

function VisualCredit({
  title,
  visual,
}: {
  title: string;
  visual: WorkVisual;
}) {
  if (!visual.credit && !visual.sourceUrl) {
    return null;
  }

  if (!visual.sourceUrl) {
    return <span>{visual.credit}</span>;
  }

  return (
    <a
      href={visual.sourceUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={`${title} visual source${visual.credit ? `, ${visual.credit}` : ''} (opens in a new tab)`}
    >
      {visual.credit ?? 'VISUAL SOURCE'} <span aria-hidden="true">↗</span>
    </a>
  );
}

export function WorksSection({
  works,
  eyebrow = 'PHENOMENON / SELECTED WORKS',
  title = 'Selected Works',
  intro = 'A small set of works, arranged as an editorial sequence rather than a complete discography.',
}: WorksSectionProps) {
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
        <header className={styles.headingRow}>
          <div>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h2 id="works-title" className={styles.heading}>
              {title}
            </h2>
          </div>
          <p className={styles.intro}>{intro}</p>
        </header>

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
                  <span className={styles.mediaSignal} aria-hidden="true">
                    CURRENT / 01
                  </span>
                </div>
                <figcaption>
                  <VisualCredit
                    title={featuredWork.title}
                    visual={featuredWork.visual}
                  />
                </figcaption>
              </figure>
            ) : (
              <div className={styles.featuredFallback} aria-hidden="true">
                <span>CURRENT / FEATURED</span>
                <strong>{featuredWork.title}</strong>
              </div>
            )}
          </div>

          <div className={styles.featuredCopy}>
            <div className={styles.featuredMeta}>
              <time dateTime={featuredWork.releaseDateTime}>
                {featuredWork.releaseDate}
              </time>
              <span>{featuredWork.kind}</span>
              <span>CURRENT WORK</span>
            </div>
            <h3>{featuredWork.title}</h3>
            <p>{featuredWork.description}</p>
            <a
              className={styles.officialLink}
              href={featuredWork.sourceUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`${featuredWork.title} official source (opens in a new tab)`}
            >
              OPEN OFFICIAL SOURCE <span aria-hidden="true">↗</span>
            </a>
          </div>
        </article>

        <div className={styles.supportingWorks}>
          {supportingWorks.map((work, index) => (
            <article
              className={styles.supportingWork}
              data-rhythm={String(index % 3)}
              key={work.id}
            >
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
                      <span aria-hidden="true">
                        {String(index + 2).padStart(2, '0')}
                      </span>
                    </div>
                    <figcaption>
                      <VisualCredit title={work.title} visual={work.visual} />
                    </figcaption>
                  </figure>
                ) : (
                  <div className={styles.typeFallback} aria-hidden="true">
                    <span>{String(index + 2).padStart(2, '0')}</span>
                    <strong>{work.kind}</strong>
                  </div>
                )}
              </div>

              <div className={styles.supportingCopy}>
                <div className={styles.supportingMeta}>
                  <span>{String(index + 2).padStart(2, '0')}</span>
                  <span>{work.kind}</span>
                  <time dateTime={work.releaseDateTime}>
                    {work.releaseDate}
                  </time>
                </div>
                <h3>{work.title}</h3>
                <p>{work.description}</p>
                <a
                  className={styles.officialLink}
                  href={work.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${work.title} official source (opens in a new tab)`}
                >
                  OFFICIAL SOURCE <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
      <span className={styles.signalLine} aria-hidden="true" />
    </section>
  );
}
