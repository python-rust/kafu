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
        图片作者与制作：花譜 / PALOW. / 川サキケンジ / とり
      </p>
      <details className={styles.details}>
        <summary>图片来源（{media.length} 项）</summary>
        <ol className={styles.list}>
          {media.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <span className={styles.credit}>{item.credit}</span>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`${item.title}的作品页面（在新窗口打开）`}
              >
                作品页面
              </a>
              <a
                href={item.licenseUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`${item.title}的使用条件（在新窗口打开）`}
              >
                使用条件
              </a>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
