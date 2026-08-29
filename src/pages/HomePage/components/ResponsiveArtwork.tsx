import type { CSSProperties, ImgHTMLAttributes } from 'react';

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
  readonly objectPosition?: string;
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

export function ResponsiveArtwork({
  source,
  alt = source.alt,
  variant = 'responsive',
  objectPosition = source.objectPosition,
  style,
  ...imageProps
}: ResponsiveArtworkProps) {
  const selected =
    variant === 'thumbnail'
      ? source.thumbnail
      : variant === 'highDensity'
        ? source.highDensity
        : source.display;
  const srcSet =
    variant === 'responsive'
      ? `${source.display.src} 1x, ${source.highDensity.src} 2x`
      : undefined;
  const resolvedStyle = objectPosition ? { ...style, objectPosition } : style;

  return (
    <img
      {...imageProps}
      src={selected.src}
      srcSet={srcSet}
      alt={alt}
      width={selected.width}
      height={selected.height}
      style={resolvedStyle}
      data-media-id={source.id}
      data-media-variant={variant}
    />
  );
}
