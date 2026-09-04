import { useReducedMotion } from 'motion/react';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import posterUrl from '../../../assets/kaf/avatar/poster/kaf-fukuro-hatdown.webp';
import { kafAvatarAsset } from '../../../content/kafAvatar';
import { SectionHeading } from '../components/SectionHeading';
import styles from './KafAvatarSection.module.css';

const KafVrmStage = lazy(() => import('./KafVrmStage'));

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

function formatLoadStatus(
  status: LoadStatus,
  progress: number | null,
  errorMessage: string | null,
): string {
  switch (status) {
    case 'idle':
      return '动态形象将在接近视口时加载。';
    case 'loading':
      return progress === null
        ? '正在加载动态形象…'
        : `正在加载动态形象 ${Math.round(progress * 100)}%`;
    case 'ready':
      return '动态形象已加载。';
    case 'error':
      return errorMessage ?? '动态形象暂时无法加载。';
  }
}

export function KafAvatarSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion() === true;
  const [supportsIntersectionObserver] = useState(
    () => typeof IntersectionObserver === 'function',
  );
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [progress, setProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || typeof IntersectionObserver !== 'function') {
      return;
    }

    const activityObserver = new IntersectionObserver(
      ([entry]) => setIsInViewport(entry?.isIntersecting ?? false),
      { threshold: 0.04 },
    );
    activityObserver.observe(section);

    if (shouldReduceMotion) {
      return () => activityObserver.disconnect();
    }

    const preloadObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setShouldLoad(true);
        setStatus('loading');
        preloadObserver.disconnect();
      },
      { rootMargin: '600px 0px' },
    );
    preloadObserver.observe(section);

    return () => {
      activityObserver.disconnect();
      preloadObserver.disconnect();
    };
  }, [shouldReduceMotion]);

  const startLoading = useCallback(() => {
    setShouldLoad(true);
    setIsInViewport(true);
    setStatus('loading');
    setProgress(null);
    setErrorMessage(null);
  }, []);

  const handleReady = useCallback(() => {
    setStatus('ready');
    setProgress(1);
    setErrorMessage(null);
  }, []);

  const handleError = useCallback((error: Error) => {
    setStatus('error');
    setProgress(null);
    setErrorMessage(error.message);
  }, []);

  const handleProgress = useCallback((nextProgress: number | null) => {
    setProgress(nextProgress);
  }, []);

  const retry = useCallback(() => {
    setAttempt((value) => value + 1);
    setStatus('loading');
    setProgress(null);
    setErrorMessage(null);
  }, []);

  const statusText = formatLoadStatus(status, progress, errorMessage);
  const showManualLoad =
    !shouldLoad && (shouldReduceMotion || !supportsIntersectionObserver);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      id="avatar"
      aria-labelledby="avatar-title"
    >
      <div className={styles.inner}>
        <SectionHeading id="avatar-title" tone="light">
          动态形象
        </SectionHeading>

        <div className={styles.layout}>
          <div
            className={styles.stage}
            data-status={status}
            data-testid="kaf-avatar-stage"
          >
            <img
              className={styles.poster}
              src={posterUrl}
              alt={status === 'ready' ? '' : '由 mme 制作的花谱 VRM 模型预览'}
              width="960"
              height="1200"
              loading="lazy"
              decoding="async"
            />

            {shouldLoad ? (
              <Suspense fallback={null}>
                <KafVrmStage
                  key={attempt}
                  modelUrl={kafAvatarAsset.publicPath}
                  isActive={isInViewport}
                  motionEnabled={
                    !shouldReduceMotion && supportsIntersectionObserver
                  }
                  onReady={handleReady}
                  onError={handleError}
                  onProgress={handleProgress}
                />
              </Suspense>
            ) : null}

            <div className={styles.stageStatus} aria-live="polite">
              <span>{statusText}</span>
              {showManualLoad ? (
                <button type="button" onClick={startLoading}>
                  加载动态形象
                </button>
              ) : null}
              {status === 'error' ? (
                <button type="button" onClick={retry}>
                  重新加载
                </button>
              ) : null}
            </div>
          </div>

          <div className={styles.content}>
            <p className={styles.lead}>
              这件网页角色保留了花谱模型原有的卡通材质、表情与头发物理，在浏览器中以固定的正面半身构图呈现。
            </p>
            <p className={styles.description}>
              模型接近本区域时才会从 Cloudflare R2
              加载。页面离开视口或进入后台后会暂停渲染；无法使用 WebGL
              时，仍保留静态预览。
            </p>

            <dl className={styles.metadata}>
              <div>
                <dt>模型制作</dt>
                <dd>{kafAvatarAsset.author}</dd>
              </div>
              <div>
                <dt>格式</dt>
                <dd>{kafAvatarAsset.format}</dd>
              </div>
              <div>
                <dt>文件大小</dt>
                <dd>{kafAvatarAsset.byteSizeLabel}</dd>
              </div>
              <div>
                <dt>授权</dt>
                <dd>{kafAvatarAsset.permissionSummary}</dd>
              </div>
            </dl>

            <p className={styles.checksum}>
              <span>SHA-256</span>
              <code>{kafAvatarAsset.sha256}</code>
            </p>

            <div className={styles.actions}>
              <a
                className={styles.primaryAction}
                href={kafAvatarAsset.publicPath}
                download={kafAvatarAsset.downloadFilename}
              >
                下载 VRM 模型
              </a>
              <a
                className={styles.secondaryAction}
                href={kafAvatarAsset.manifestPath}
              >
                查看模型清单
              </a>
            </div>

            <p className={styles.credit}>
              模型制作：{kafAvatarAsset.author}
              。经作者授权用于本非官方、非商业粉丝网站。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
