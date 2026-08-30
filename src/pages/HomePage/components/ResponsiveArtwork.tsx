import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ImgHTMLAttributes,
  type SyntheticEvent,
} from 'react';

import styles from './ResponsiveArtwork.module.css';

export interface ArtworkVariant {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

export interface ResponsiveArtworkSource {
  readonly id: string;
  readonly alt: string;
  readonly display: ArtworkVariant;
  readonly highDensity: ArtworkVariant;
  readonly thumbnail: ArtworkVariant;
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
}

function responsiveSourceSet(source: ResponsiveArtworkSource) {
  const candidates = [source.thumbnail, source.display, source.highDensity];
  const uniqueCandidates = new Map<number, ArtworkVariant>();

  for (const candidate of candidates) {
    uniqueCandidates.set(candidate.width, candidate);
  }

  return [...uniqueCandidates.values()]
    .sort((first, second) => first.width - second.width)
    .map((candidate) => `${candidate.src} ${candidate.width}w`)
    .join(', ');
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
  ...imageProps
}: ResponsiveArtworkProps) {
  const selected =
    variant === 'thumbnail'
      ? source.thumbnail
      : variant === 'highDensity'
        ? source.highDensity
        : source.display;
  const srcSet =
    variant === 'responsive' ? responsiveSourceSet(source) : undefined;
  const resolvedSizes =
    variant === 'responsive' ? (sizes ?? '100vw') : undefined;
  const resolvedStyle = objectPosition ? { ...style, objectPosition } : style;
  const requestKey = `${selected.src}|${srcSet ?? ''}|${resolvedSizes ?? ''}`;
  const imageRef = useRef<HTMLImageElement>(null);
  const requestKeyRef = useRef(requestKey);
  const [status, setStatus] = useState<ArtworkStatus>('loading');
  requestKeyRef.current = requestKey;

  const revealLoadedImage = (image: HTMLImageElement, expectedKey: string) => {
    const markLoaded = () => {
      if (requestKeyRef.current === expectedKey) {
        setStatus('loaded');
      }
    };

    if (typeof image.decode !== 'function') {
      markLoaded();
      return;
    }

    void image.decode().then(markLoaded, markLoaded);
  };

  useEffect(() => {
    setStatus('loading');
    const image = imageRef.current;

    if (!image?.complete) {
      return;
    }

    if (image.naturalWidth > 0) {
      revealLoadedImage(image, requestKey);
    } else {
      setStatus('error');
    }
  }, [requestKey]);

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    onLoad?.(event);
    revealLoadedImage(event.currentTarget, requestKey);
  };

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    setStatus('error');
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
