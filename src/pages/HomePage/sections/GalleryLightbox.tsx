import Lightbox, {
  type LightboxExternalProps,
} from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

export default function GalleryLightbox({
  portal,
  ...props
}: LightboxExternalProps) {
  return (
    <Lightbox
      {...props}
      portal={{
        ...portal,
        container: {
          ...portal?.container,
          // GallerySection restores focus after the portal has fully exited.
          // Suppress the package's earlier focus restore, which can scroll a
          // smooth-scrolling document while the covered stage is still changing.
          onFocus: () => undefined,
        },
      }}
      plugins={[Zoom]}
      zoom={{
        maxZoomPixelRatio: 1.5,
        zoomInMultiplier: 2,
        doubleClickMaxStops: 2,
        keyboardMoveDistance: 64,
        wheelZoomDistanceFactor: 100,
        pinchZoomV4: true,
        scrollToZoom: false,
      }}
    />
  );
}
