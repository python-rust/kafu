import styles from './MediaCredit.module.css';

interface MediaCreditProps {
  credit: string;
  href: string;
  subject: string;
  tone?: 'light' | 'dark';
}

export function MediaCredit({
  credit,
  href,
  subject,
  tone = 'dark',
}: MediaCreditProps) {
  return (
    <a
      className={styles.credit}
      data-tone={tone}
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`${subject}の画像出典：${credit}（新しいタブで開く）`}
    >
      <span>{credit}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}
