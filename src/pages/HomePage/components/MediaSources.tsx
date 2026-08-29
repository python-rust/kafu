import styles from './MediaSources.module.css';

export interface MediaSourceEntry {
  readonly id: string;
  readonly title: string;
  readonly credit: string;
  readonly sourceUrl: string;
  readonly licenseUrl: string;
}

interface MediaSourcesProps {
  media: readonly MediaSourceEntry[];
}

export function MediaSources({ media }: MediaSourcesProps) {
  return (
    <div className={styles.sources} id="media-sources">
      <p className={styles.creatorLine}>
        画像：花譜 / PALOW. / 川サキケンジ / とり
      </p>
      <details className={styles.details}>
        <summary>画像出典（{media.length}件）</summary>
        <ol className={styles.list}>
          {media.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <span className={styles.credit}>{item.credit}</span>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`${item.title}の作品ページ（新しいタブで開く）`}
              >
                作品ページ
              </a>
              <a
                href={item.licenseUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`${item.title}の利用条件（新しいタブで開く）`}
              >
                利用条件
              </a>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
