import styles from './SiteFooter.module.css';

interface SiteFooterProps {
  projectLabel: string;
  mediaCreditsHref: string;
  mediaCreditsLabel?: string;
}

export function SiteFooter({
  projectLabel,
  mediaCreditsHref,
  mediaCreditsLabel = '画像出典',
}: SiteFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.identity}>
        <span className={styles.project}>{projectLabel}</span>
        <p>
          花譜およびKAMITSUBAKI
          STUDIOとは関係のない、非公式・非営利のファンサイトです。
        </p>
      </div>

      <div className={styles.meta}>
        <a href={mediaCreditsHref}>{mediaCreditsLabel}</a>
      </div>
    </footer>
  );
}
