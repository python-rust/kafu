import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ImgHTMLAttributes,
  type SyntheticEvent,
} from 'react';

import {
  artworkRequestKey,
  hasLoadedArtwork,
  markArtworkElementLoaded,
  responsiveArtworkSourceSet,
  type ArtworkVariantRole,
} from './artworkLoadCache';
import styles from './ResponsiveArtwork.module.css';

export interface ArtworkVariant {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

export interface ResponsiveArtworkSource {
  readonly id: string;
  readonly alt: string;
  readonly thumbnail: ArtworkVariant;
  readonly medium: ArtworkVariant;
  readonly display: ArtworkVariant;
  readonly large: ArtworkVariant;
  readonly highDensity: ArtworkVariant;
  readonly placeholderDataUrl: string;
  readonly objectPosition?: string;
}

type ArtworkStatus = 'loading' | 'loaded' | 'error';

interface ArtworkShellStyle extends CSSProperties {
  '--artwork-aspect-ratio': string;
  '--artwork-placeholder': string;
  '--artwork-position': string;
}

interface ResponsiveArtworkProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'alt' | 'height' | 'src' | 'srcSet' | 'style' | 'width'
> {
  source: ResponsiveArtworkSource;
  alt?: string;
  variant?: 'responsive' | 'highDensity' | 'thumbnail';
  objectPosition?: string;
  style?: CSSProperties;
  preservePlaceholder?: boolean;
}

export function ResponsiveArtwork({
  source,
  alt = source.alt,
  variant = 'responsive',
  objectPosition = source.objectPosition,
  style,
  sizes,
  className,
  onLoad,
  onError,
  preservePlaceholder = false,
  ...imageProps
}: ResponsiveArtworkProps) {
  const selected =
    variant === 'thumbnail'
      ? source.thumbnail
      : variant === 'highDensity'
        ? source.highDensity
        : source.display;
  const srcSet =
    variant === 'responsive' ? responsiveArtworkSourceSet(source) : undefined;
  const resolvedSizes =
    variant === 'responsive' ? (sizes ?? '100vw') : undefined;
  const resolvedStyle = objectPosition ? { ...style, objectPosition } : style;
  const role = variant satisfies ArtworkVariantRole;
  const requestKey = artworkRequestKey(source, role, resolvedSizes);
  const imageRef = useRef<HTMLImageElement>(null);
  const initialStatus: ArtworkStatus = hasLoadedArtwork(
    source,
    role,
    resolvedSizes,
  )
    ? 'loaded'
    : 'loading';
  const [loadState, setLoadState] = useState<{
    requestKey: string;
    status: ArtworkStatus;
  }>(() => ({ requestKey, status: initialStatus }));
  const status =
    loadState.requestKey === requestKey ? loadState.status : initialStatus;

  useLayoutEffect(() => {
    const image = imageRef.current;

    if (image?.complete) {
      if (image.naturalWidth > 0) {
        markArtworkElementLoaded(image, requestKey);
        setLoadState({ requestKey, status: 'loaded' });
      } else {
        setLoadState({ requestKey, status: 'error' });
      }
      return;
    }

    setLoadState({
      requestKey,
      status: hasLoadedArtwork(source, role, resolvedSizes)
        ? 'loaded'
        : 'loading',
    });
  }, [requestKey, role, source]);

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    markArtworkElementLoaded(event.currentTarget, requestKey);
    setLoadState({ requestKey, status: 'loaded' });
    onLoad?.(event);
  };

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    setLoadState({ requestKey, status: 'error' });
    onError?.(event);
  };

  const shellStyle: ArtworkShellStyle = {
    '--artwork-aspect-ratio': `${selected.width} / ${selected.height}`,
    '--artwork-placeholder': `url("${source.placeholderDataUrl}")`,
    '--artwork-position': objectPosition ?? 'center',
  };
  const imageClassName = [styles.image, className].filter(Boolean).join(' ');

  return (
    <span
      className={styles.root}
      data-artwork-id={source.id}
      data-artwork-status={status}
      data-artwork-variant={variant}
      data-preserve-placeholder={preservePlaceholder ? 'true' : undefined}
      aria-busy={status === 'loading' ? true : undefined}
      style={shellStyle}
    >
      <span className={styles.feedback} aria-hidden="true">
        <span className={styles.progress} />
        <span className={styles.statusText}>
          {status === 'error' ? '图片加载失败' : '图片加载中'}
        </span>
      </span>

      <img
        {...imageProps}
        ref={imageRef}
        className={imageClassName}
        src={selected.src}
        srcSet={srcSet}
        sizes={resolvedSizes}
        alt={alt}
        width={selected.width}
        height={selected.height}
        style={resolvedStyle}
        onLoad={handleLoad}
        onError={handleError}
        data-media-id={source.id}
        data-media-variant={variant}
      />
    </span>
  );
}
