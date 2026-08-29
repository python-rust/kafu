import {
  MediaSources,
  type MediaSourceEntry,
} from '../components/MediaSources';
import styles from './SiteFooter.module.css';

interface SiteFooterProps {
  projectLabel: string;
  mediaSources: readonly MediaSourceEntry[];
  referenceSources: readonly ReferenceSourceEntry[];
}

export interface ReferenceSourceEntry {
  readonly id: string;
  readonly label: string;
  readonly note: string;
  readonly href: string;
}

export function SiteFooter({
  projectLabel,
  mediaSources,
  referenceSources,
}: SiteFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.identity}>
        <span className={styles.project}>{projectLabel}</span>
        <p>
          这是一个面向中文读者的非官方、非营利粉丝页面，与花谱及 KAMITSUBAKI
          STUDIO 无隶属关系。
        </p>
      </div>

      <div className={styles.sources}>
        <MediaSources media={mediaSources} />
        <details className={styles.referenceDetails}>
          <summary>资料来源（{referenceSources.length} 项）</summary>
          <ol>
            {referenceSources.map((source) => (
              <li key={source.id}>
                <a
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${source.label}：${source.note}（在新窗口打开）`}
                >
                  <strong>{source.label}</strong>
                  <span>{source.note}</span>
                </a>
              </li>
            ))}
          </ol>
        </details>
      </div>
    </footer>
  );
}
