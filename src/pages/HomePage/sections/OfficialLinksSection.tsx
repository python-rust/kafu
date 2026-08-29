import { SectionHeading } from '../components/SectionHeading';
import styles from './OfficialLinksSection.module.css';

export interface OfficialLinkItem {
  label: string;
  note: string;
  href: string;
}

interface OfficialLinksSectionProps {
  links: readonly OfficialLinkItem[];
  title?: string;
}

export function OfficialLinksSection({
  links,
  title = '公式',
}: OfficialLinksSectionProps) {
  return (
    <section
      className={styles.section}
      id="links"
      aria-labelledby="links-title"
    >
      <div className={styles.inner}>
        <SectionHeading id="links-title" tone="light">
          {title}
        </SectionHeading>

        <ul className={styles.links}>
          {links.map((link) => (
            <li key={`${link.label}-${link.href}`}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${link.label}：${link.note}（新しいタブで開く）`}
              >
                <strong>{link.label}</strong>
                <span className={styles.note}>{link.note}</span>
                <span className={styles.arrow} aria-hidden="true">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
