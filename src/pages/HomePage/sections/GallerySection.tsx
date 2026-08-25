import styles from './GallerySection.module.css';

export interface GalleryVisual {
  id: string;
  title: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  credit: string;
  sourceUrl: string;
}

interface GallerySectionProps {
  visuals: readonly GalleryVisual[];
  eyebrow?: string;
  title?: string;
  intro?: string;
}

export function GallerySection({
  visuals,
  eyebrow = 'PHENOMENON / VISUAL ARCHIVE',
  title = 'Visual Archive',
  intro = 'A controlled visual sequence with credits kept adjacent to every source image.',
}: GallerySectionProps) {
  return (
    <section
      className={styles.section}
      id="visuals"
      aria-labelledby="visuals-title"
    >
      <div className={styles.inner}>
        <header className={styles.headingRow}>
          <div>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h2 id="visuals-title" className={styles.heading}>
              {title}
            </h2>
          </div>
          <p className={styles.intro}>{intro}</p>
        </header>

        <div className={styles.grid}>
          {visuals.map((visual, index) => (
            <figure
              className={styles.figure}
              data-rhythm={String(index % 5)}
              key={visual.id}
            >
              <div className={styles.imageFrame}>
                <img
                  src={visual.src}
                  alt={visual.alt}
                  width={visual.width}
                  height={visual.height}
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.index} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <figcaption>
                <div className={styles.captionTitle}>
                  <span>ARCHIVE / {String(index + 1).padStart(2, '0')}</span>
                  <h3>{visual.title}</h3>
                </div>
                <div className={styles.captionSource}>
                  <span>{visual.credit}</span>
                  <a
                    href={visual.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${visual.title} visual source, ${visual.credit} (opens in a new tab)`}
                  >
                    SOURCE <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <span className={styles.signalArc} aria-hidden="true" />
    </section>
  );
}
