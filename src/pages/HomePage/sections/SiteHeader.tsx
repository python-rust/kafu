import styles from './SiteHeader.module.css';

export interface SiteHeaderNavItem {
  label: string;
  href: `#${string}`;
}

export interface SiteHeaderProps {
  projectName?: string;
  homeHref?: `#${string}`;
  navLabel?: string;
  navItems?: readonly SiteHeaderNavItem[];
}

export const defaultSiteHeaderNavItems = [
  { label: '軌跡', href: '#journey' },
  { label: '作品', href: '#works' },
  { label: '視覚', href: '#visuals' },
  { label: '公式', href: '#links' },
] as const satisfies readonly SiteHeaderNavItem[];

export function SiteHeader({
  projectName = 'KAF Observatory',
  homeHref = '#top',
  navLabel = '主なナビゲーション',
  navItems = defaultSiteHeaderNavItems,
}: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a className={styles.brand} href={homeHref}>
          {projectName}
        </a>

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
