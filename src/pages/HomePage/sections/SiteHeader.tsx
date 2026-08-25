import styles from './SiteHeader.module.css';

export interface SiteHeaderNavItem {
  label: string;
  href: `#${string}`;
}

export interface SiteHeaderProps {
  projectName?: string;
  statusLabel?: string;
  homeHref?: `#${string}`;
  navLabel?: string;
  navItems?: readonly SiteHeaderNavItem[];
}

export const defaultSiteHeaderNavItems = [
  { label: 'Journey', href: '#journey' },
  { label: 'Works', href: '#works' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Official Links', href: '#official' },
] as const satisfies readonly SiteHeaderNavItem[];

export function SiteHeader({
  projectName = 'KAF Observatory',
  statusLabel = 'UNOFFICIAL / NON-COMMERCIAL',
  homeHref = '#top',
  navLabel = 'Primary navigation',
  navItems = defaultSiteHeaderNavItems,
}: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.identity}>
          <a className={styles.brand} href={homeHref}>
            <span className={styles.brandSignal} aria-hidden="true" />
            <span>{projectName}</span>
          </a>
          <span className={styles.status}>{statusLabel}</span>
        </div>

        <nav className={styles.nav} aria-label={navLabel}>
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={`${item.href}-${item.label}`}>
                <a className={styles.navLink} href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
