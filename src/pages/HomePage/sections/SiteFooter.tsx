import {
  MediaSources,
  type MediaSourceEntry,
} from '../components/MediaSources';
import styles from './SiteFooter.module.css';

interface SiteFooterProps {
  projectLabel: string;
  mediaSources: readonly MediaSourceEntry[];
}

export function SiteFooter({ projectLabel, mediaSources }: SiteFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.identity}>
        <span className={styles.project}>{projectLabel}</span>
        <p>
          花譜およびKAMITSUBAKI
          STUDIOとは関係のない、非公式・非営利のファンサイトです。
        </p>
      </div>

      <div className={styles.sources}>
        <MediaSources media={mediaSources} />
      </div>
    </footer>
  );
}
