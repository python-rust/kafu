import type {
  ArtworkVariant,
  ResponsiveArtworkSource,
} from './ResponsiveArtwork';

export type ArtworkVariantRole = 'responsive' | 'highDensity' | 'thumbnail';
export type ArtworkFetchPriority = 'auto' | 'high' | 'low';

export interface ArtworkPreloadOptions {
  readonly role?: ArtworkVariantRole;
  readonly sizes?: string;
  readonly fetchPriority?: ArtworkFetchPriority;
}

const loadedArtworkRequests = new Map<string, string>();
const pendingArtworkLoads = new Map<string, Promise<string>>();

function absoluteArtworkUrl(value: string) {
  if (typeof document === 'undefined') {
    return value;
  }

  return new URL(value, document.baseURI).href;
}

function responsiveCandidates(source: ResponsiveArtworkSource) {
  const candidates = [
    source.thumbnail,
    source.medium,
    source.display,
    source.large,
    source.highDensity,
  ];
  const uniqueCandidates = new Map<number, ArtworkVariant>();

  for (const candidate of candidates) {
    uniqueCandidates.set(candidate.width, candidate);
  }

  return [...uniqueCandidates.values()].sort(
    (first, second) => first.width - second.width,
  );
}

function selectedVariant(
  source: ResponsiveArtworkSource,
  role: ArtworkVariantRole,
) {
  if (role === 'thumbnail') {
    return source.thumbnail;
  }

  if (role === 'highDensity') {
    return source.highDensity;
  }

  return source.display;
}

function responsiveSelectionContext(role: ArtworkVariantRole) {
  if (role !== 'responsive' || typeof window === 'undefined') {
    return '';
  }

  return `${window.innerWidth}x${window.devicePixelRatio}`;
}

export function responsiveArtworkSourceSet(source: ResponsiveArtworkSource) {
  return responsiveCandidates(source)
    .map((candidate) => `${candidate.src} ${candidate.width}w`)
    .join(', ');
}

export function artworkRequestKey(
  source: ResponsiveArtworkSource,
  role: ArtworkVariantRole,
  sizes?: string,
) {
  const selected = selectedVariant(source, role);
  const srcSet =
    role === 'responsive' ? responsiveArtworkSourceSet(source) : '';
  const resolvedSizes = role === 'responsive' ? (sizes ?? '100vw') : '';

  return [
    source.id,
    role,
    selected.src,
    srcSet,
    resolvedSizes,
    responsiveSelectionContext(role),
  ].join('|');
}

export function hasLoadedArtwork(
  source: ResponsiveArtworkSource,
  role: ArtworkVariantRole,
  sizes?: string,
) {
  return loadedArtworkRequests.has(artworkRequestKey(source, role, sizes));
}

export function markArtworkElementLoaded(
  image: HTMLImageElement,
  requestKey: string,
) {
  const loadedUrl = image.currentSrc || image.src;
  const absoluteUrl = loadedUrl ? absoluteArtworkUrl(loadedUrl) : '';

  if (absoluteUrl) {
    loadedArtworkRequests.set(requestKey, absoluteUrl);
  }

  return absoluteUrl;
}

export function preloadResponsiveArtwork(
  source: ResponsiveArtworkSource,
  sizes: string,
  fetchPriority: ArtworkFetchPriority = 'low',
) {
  return preloadArtwork(source, {
    role: 'responsive',
    sizes,
    fetchPriority,
  });
}

export function preloadArtwork(
  source: ResponsiveArtworkSource,
  {
    role = 'responsive',
    sizes,
    fetchPriority = 'low',
  }: ArtworkPreloadOptions = {},
) {
  if (typeof Image === 'undefined') {
    return Promise.reject(new Error('Image preloading is not available.'));
  }

  const resolvedSizes = role === 'responsive' ? (sizes ?? '100vw') : undefined;
  const selected = selectedVariant(source, role);
  const requestKey = artworkRequestKey(source, role, resolvedSizes);
  const loadedUrl = loadedArtworkRequests.get(requestKey);

  if (loadedUrl !== undefined) {
    return Promise.resolve(loadedUrl || absoluteArtworkUrl(selected.src));
  }

  const existingRequest = pendingArtworkLoads.get(requestKey);

  if (existingRequest) {
    return existingRequest;
  }

  const request = new Promise<string>((resolve, reject) => {
    const image = new Image();

    image.decoding = 'async';
    image.loading = 'eager';
    image.fetchPriority = fetchPriority;
    if (role === 'responsive') {
      image.sizes = resolvedSizes ?? '100vw';
      image.srcset = responsiveArtworkSourceSet(source);
    }
    image.onload = () => {
      const resolvedUrl = markArtworkElementLoaded(image, requestKey);
      image.onload = null;
      image.onerror = null;
      resolve(resolvedUrl || absoluteArtworkUrl(selected.src));
    };
    image.onerror = () => {
      image.onload = null;
      image.onerror = null;
      reject(new Error(`Unable to preload ${role} artwork: ${source.id}`));
    };
    image.src = selected.src;
  }).finally(() => {
    pendingArtworkLoads.delete(requestKey);
  });

  pendingArtworkLoads.set(requestKey, request);
  return request;
}

export function __resetArtworkLoadCacheForTests() {
  loadedArtworkRequests.clear();
  pendingArtworkLoads.clear();
}
