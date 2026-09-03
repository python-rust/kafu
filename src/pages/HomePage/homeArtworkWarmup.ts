import type { ResponsiveArtworkSource } from './components/ResponsiveArtwork';
import {
  FEATURED_WORK_ARTWORK_SIZES,
  GALLERY_STAGE_ARTWORK_SIZES,
  JOURNEY_LINEAR_ARTWORK_SIZES,
  JOURNEY_STAGE_ARTWORK_SIZES,
  PROFILE_ARTWORK_SIZES,
  SUPPORTING_WORK_ARTWORK_SIZES,
} from './components/artworkSizes';
import type {
  ArtworkWarmupGroup,
  ArtworkWarmupJob,
} from './components/artworkWarmupQueue';

interface WarmupProfile {
  readonly visual: ResponsiveArtworkSource;
}

interface WarmupChapter {
  readonly id: string;
  readonly primaryVisual: ResponsiveArtworkSource;
}

interface WarmupWork {
  readonly id: string;
  readonly featured?: boolean;
  readonly visual?: ResponsiveArtworkSource;
}

interface HomeArtworkWarmupInput {
  readonly profile: WarmupProfile;
  readonly chapters: readonly WarmupChapter[];
  readonly works: readonly WarmupWork[];
  readonly galleryVisuals: readonly ResponsiveArtworkSource[];
  readonly linearJourney: boolean;
}

function responsiveJob(
  id: string,
  source: ResponsiveArtworkSource,
  sizes: string,
): ArtworkWarmupJob {
  return { id, source, role: 'responsive', sizes };
}

export function createHomeArtworkWarmupGroups({
  profile,
  chapters,
  works,
  galleryVisuals,
  linearJourney,
}: HomeArtworkWarmupInput): readonly ArtworkWarmupGroup[] {
  const journeySizes = linearJourney
    ? JOURNEY_LINEAR_ARTWORK_SIZES
    : JOURNEY_STAGE_ARTWORK_SIZES;
  const [primaryGalleryVisual, ...secondaryGalleryVisuals] = galleryVisuals;

  return [
    {
      id: 'profile',
      jobs: [
        responsiveJob(
          `profile:${profile.visual.id}`,
          profile.visual,
          PROFILE_ARTWORK_SIZES,
        ),
      ],
    },
    {
      id: 'journey',
      jobs: chapters.map((chapter) =>
        responsiveJob(
          `journey:${chapter.id}`,
          chapter.primaryVisual,
          journeySizes,
        ),
      ),
    },
    {
      id: 'works',
      jobs: works.flatMap((work) =>
        work.visual
          ? [
              responsiveJob(
                `work:${work.id}`,
                work.visual,
                work.featured
                  ? FEATURED_WORK_ARTWORK_SIZES
                  : SUPPORTING_WORK_ARTWORK_SIZES,
              ),
            ]
          : [],
      ),
    },
    {
      id: 'gallery-primary',
      jobs: primaryGalleryVisual
        ? [
            responsiveJob(
              `gallery-stage:${primaryGalleryVisual.id}`,
              primaryGalleryVisual,
              GALLERY_STAGE_ARTWORK_SIZES,
            ),
          ]
        : [],
    },
    {
      id: 'gallery-thumbnails',
      jobs: galleryVisuals.map((visual) => ({
        id: `gallery-thumbnail:${visual.id}`,
        source: visual,
        role: 'thumbnail',
      })),
    },
    {
      id: 'gallery-secondary',
      jobs: secondaryGalleryVisuals.map((visual) =>
        responsiveJob(
          `gallery-stage:${visual.id}`,
          visual,
          GALLERY_STAGE_ARTWORK_SIZES,
        ),
      ),
    },
  ];
}
