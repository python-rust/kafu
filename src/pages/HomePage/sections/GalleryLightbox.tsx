import Lightbox, {
  type LightboxExternalProps,
} from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

export default function GalleryLightbox(props: LightboxExternalProps) {
  return (
    <Lightbox
      {...props}
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
