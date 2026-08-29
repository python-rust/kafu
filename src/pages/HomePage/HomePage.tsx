import { MotionConfig } from 'motion/react';

import {
  galleryVisuals,
  heroMedia,
  journeyChapters,
  kafMedia,
  officialLinks,
  primerBeats,
  referenceSources,
  selectedWorks,
} from '../../content/kaf';
import { GallerySection } from './sections/GallerySection';
import { HeroSection } from './sections/HeroSection';
import { JourneySection } from './sections/JourneySection';
import { KafPrimerSection } from './sections/KafPrimerSection';
import { OfficialLinksSection } from './sections/OfficialLinksSection';
import { SiteFooter } from './sections/SiteFooter';
import { SiteHeader, type SiteHeaderNavItem } from './sections/SiteHeader';
import { WorksSection } from './sections/WorksSection';

const homeNavItems = [
  { label: '认识花谱', href: '#about' },
  { label: '成长轨迹', href: '#journey' },
  { label: '代表作品', href: '#works' },
  { label: '视觉档案', href: '#visuals' },
  { label: '官方入口', href: '#links' },
] as const satisfies readonly SiteHeaderNavItem[];

export function HomePage() {
  return (
    <MotionConfig reducedMotion="user">
      <div>
        <SiteHeader navLabel="花谱观察站页面导航" navItems={homeNavItems} />

        <main>
          <HeroSection
            visual={heroMedia}
            statement="她从网络里被听见，也把虚拟歌声带进了现实舞台。"
            description="这里用几分钟讲清花谱是谁、她经历了什么，以及第一次认识她可以从哪里开始。"
          />
          <KafPrimerSection beats={primerBeats} />
          <JourneySection chapters={journeyChapters} />
          <WorksSection works={selectedWorks} />
          <GallerySection visuals={galleryVisuals} />
          <OfficialLinksSection links={officialLinks} />
        </main>

        <SiteFooter
          projectLabel="花谱观察站"
          mediaSources={kafMedia}
          referenceSources={referenceSources}
        />
      </div>
    </MotionConfig>
  );
}
