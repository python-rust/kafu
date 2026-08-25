import styles from './SiteFooter.module.css';

interface SiteFooterProps {
  projectLabel: string;
  mediaCreditsHref: string;
  mediaCreditsLabel?: string;
  curationLabel: string;
}

export function SiteFooter({
  projectLabel,
  mediaCreditsHref,
  mediaCreditsLabel = 'Media credits & source provenance',
  curationLabel,
}: SiteFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.identity}>
        <span className={styles.project}>{projectLabel}</span>
        <p>
          Unofficial, non-commercial fan project. Not affiliated with KAF or
          KAMITSUBAKI STUDIO.
        </p>
      </div>

      <div className={styles.meta}>
        <a href={mediaCreditsHref}>{mediaCreditsLabel}</a>
        <span>{curationLabel}</span>
      </div>
    </footer>
  );
}
