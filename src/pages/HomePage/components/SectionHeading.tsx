import type { ReactNode } from 'react';

import styles from './SectionHeading.module.css';

interface SectionHeadingProps {
  id: string;
  children: ReactNode;
  tone?: 'light' | 'dark';
  className?: string;
}

export function SectionHeading({
  id,
  children,
  tone = 'dark',
  className,
}: SectionHeadingProps) {
  const rootClassName = [styles.root, className].filter(Boolean).join(' ');

  return (
    <header className={rootClassName} data-tone={tone}>
      <h2 id={id}>{children}</h2>
    </header>
  );
}
