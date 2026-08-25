import { MotionConfig } from 'motion/react';

import {
  galleryVisuals,
  heroMedia,
  journeyChapters,
  officialLinks,
  selectedWorks,
} from '../../content/kaf';
import { GallerySection } from './sections/GallerySection';
import { HeroSection } from './sections/HeroSection';
import { JourneySection } from './sections/JourneySection';
import { OfficialLinksSection } from './sections/OfficialLinksSection';
import { SiteFooter } from './sections/SiteFooter';
import { SiteHeader, type SiteHeaderNavItem } from './sections/SiteHeader';
import { WorksSection } from './sections/WorksSection';

const homeNavItems = [
  { label: 'Journey', href: '#journey' },
  { label: 'Works', href: '#works' },
  { label: 'Gallery', href: '#visuals' },
  { label: 'Official Links', href: '#links' },
] as const satisfies readonly SiteHeaderNavItem[];

const heroMetadata = [
  { label: 'ACTIVITY', value: 'SINCE 2018' },
  { label: 'FIELD', value: 'VOICE / VISUAL / STORY' },
  { label: 'JOURNEY', value: 'SIX CHAPTERS' },
] as const;

const fanProjectStatus = 'UNOFFICIAL FAN PROJECT / NON-COMMERCIAL';

export function HomePage() {
  const officialWebsite = officialLinks.find(
    (link) => link.label === 'Official Website',
  );

  if (!officialWebsite) {
    throw new Error('Official links must include the KAF official website.');
  }

  return (
    <MotionConfig reducedMotion="user">
      <div>
        <SiteHeader
          statusLabel={fanProjectStatus}
          navLabel="KAF homepage sections"
          navItems={homeNavItems}
        />

        <main>
          <HeroSection
            visual={heroMedia}
            statement="声音像一束无法被固定的光，穿过现实与虚拟，也穿过每一次被重新命名的风景。"
            description="KAF Observatory 是一个非官方、非商业的花譜粉丝观测站。沿着六个阶段，我们从声音、视觉与时间里重新观察她持续变化的创作世界。"
            officialUrl={officialWebsite.href}
            statusLabel={fanProjectStatus}
            metadata={heroMetadata}
          />
          <JourneySection chapters={journeyChapters} />
          <WorksSection works={selectedWorks} />
          <GallerySection visuals={galleryVisuals} />
          <OfficialLinksSection links={officialLinks} />
        </main>

        <SiteFooter
          projectLabel="KAF OBSERVATORY"
          mediaCreditsHref="#visuals"
          mediaCreditsLabel="Media credits in Visual Archive"
          curationLabel="CURATED / 2026"
        />
      </div>
    </MotionConfig>
  );
}
