import { useEffect, useState } from 'react';

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
  { label: '认识花谱', href: '#about' },
  { label: '动态形象', href: '#avatar' },
  { label: '成长轨迹', href: '#journey' },
  { label: '代表作品', href: '#works' },
  { label: '视觉档案', href: '#visuals' },
  { label: '官方入口', href: '#links' },
] as const satisfies readonly SiteHeaderNavItem[];

export function SiteHeader({
  projectName = '花谱观察站',
  homeHref = '#top',
  navLabel = '页面主要导航',
  navItems = defaultSiteHeaderNavItems,
}: SiteHeaderProps) {
  const [activeHref, setActiveHref] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const sections = navItems
      .map((item) => document.querySelector<HTMLElement>(item.href))
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const viewportCenter = window.innerHeight * 0.46;
        const activeEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => {
            const leftCenter =
              left.boundingClientRect.top + left.boundingClientRect.height / 2;
            const rightCenter =
              right.boundingClientRect.top +
              right.boundingClientRect.height / 2;

            return (
              Math.abs(leftCenter - viewportCenter) -
              Math.abs(rightCenter - viewportCenter)
            );
          })[0];

        if (activeEntry) {
          setActiveHref(`#${activeEntry.target.id}`);
        }
      },
      {
        root: null,
        rootMargin: '-36% 0px -54% 0px',
        threshold: 0,
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [navItems]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a
          className={styles.brand}
          href={homeHref}
          aria-label={`${projectName}，返回页面顶部`}
        >
          {projectName}
        </a>

        <nav className={styles.nav} aria-label={navLabel}>
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={`${item.href}-${item.label}`}>
                <a
                  className={styles.navLink}
                  data-active={activeHref === item.href ? 'true' : undefined}
                  aria-current={
                    activeHref === item.href ? 'location' : undefined
                  }
                  href={item.href}
                >
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
