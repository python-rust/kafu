import styles from './OfficialLinksSection.module.css';

export interface OfficialLinkItem {
  label: string;
  note: string;
  href: string;
}

interface OfficialLinksSectionProps {
  links: readonly OfficialLinkItem[];
  eyebrow?: string;
  title?: string;
}

export function OfficialLinksSection({
  links,
  eyebrow = 'PHENOMENON / OFFICIAL SOURCES',
  title = 'Go to the source.',
}: OfficialLinksSectionProps) {
  return (
    <section
      className={styles.section}
      id="links"
      aria-labelledby="links-title"
    >
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 id="links-title">{title}</h2>
          <p>
            新闻、日程、完整作品目录与社交动态会持续变化，请回到官方来源确认最新信息；这个非官方站点不替代官方发布。
          </p>
        </div>

        <ol className={styles.links}>
          {links.map((link, index) => (
            <li key={`${link.label}-${link.href}`}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${link.label}: ${link.note}. Official source (opens in a new tab)`}
              >
                <span className={styles.index} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <strong>{link.label}</strong>
                <span className={styles.note}>{link.note}</span>
                <span className={styles.arrow} aria-hidden="true">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
