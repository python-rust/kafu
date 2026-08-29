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
  { label: '軌跡', href: '#journey' },
  { label: '作品', href: '#works' },
  { label: '視覚', href: '#visuals' },
  { label: '公式', href: '#links' },
] as const satisfies readonly SiteHeaderNavItem[];

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
          navLabel="花譜サイト内ナビゲーション"
          navItems={homeNavItems}
        />

        <main>
          <HeroSection
            visual={heroMedia}
            statement="歌、姿、舞台。花譜が重ねてきた変化を、作品と時間から辿る。"
            description="2018年から現在までの活動をまとめた私設アーカイブ。"
            officialUrl={officialWebsite.href}
          />
          <JourneySection chapters={journeyChapters} />
          <WorksSection works={selectedWorks} />
          <GallerySection visuals={galleryVisuals} />
          <OfficialLinksSection links={officialLinks} />
        </main>

        <SiteFooter
          projectLabel="KAF OBSERVATORY"
          mediaCreditsHref="#visuals"
          mediaCreditsLabel="画像出典"
        />
      </div>
    </MotionConfig>
  );
}
