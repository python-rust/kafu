import {
  ResponsiveArtwork,
  type ResponsiveArtworkSource,
} from '../components/ResponsiveArtwork';
import { PROFILE_ARTWORK_SIZES } from '../components/artworkSizes';
import { SectionHeading } from '../components/SectionHeading';
import styles from './KafProfileSection.module.css';

export interface KafProfileFact {
  label: string;
  value: string;
}

export interface KafProfileContent {
  paragraphs: readonly string[];
  facts: readonly KafProfileFact[];
  visual: ResponsiveArtworkSource;
}

interface KafProfileSectionProps {
  profile: KafProfileContent;
  title?: string;
}

export function KafProfileSection({
  profile,
  title = '认识花谱',
}: KafProfileSectionProps) {
  return (
    <section
      className={styles.section}
      id="about"
      aria-labelledby="about-title"
    >
      <div className={styles.inner}>
        <SectionHeading id="about-title" tone="light">
          {title}
        </SectionHeading>

        <div className={styles.profile}>
          <figure className={styles.visual}>
            <ResponsiveArtwork
              source={profile.visual}
              loading="eager"
              fetchPriority="auto"
              decoding="async"
              sizes={PROFILE_ARTWORK_SIZES}
            />
          </figure>

          <div className={styles.content}>
            <div className={styles.biography}>
              {profile.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <dl className={styles.facts}>
              {profile.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
