import {
  artworkRequestKey,
  preloadArtwork,
  type ArtworkFetchPriority,
  type ArtworkPreloadOptions,
  type ArtworkVariantRole,
} from './artworkLoadCache';
import type { ResponsiveArtworkSource } from './ResponsiveArtwork';

export interface ArtworkWarmupJob {
  readonly id: string;
  readonly source: ResponsiveArtworkSource;
  readonly role?: ArtworkVariantRole;
  readonly sizes?: string;
}

export interface ArtworkWarmupGroup {
  readonly id: string;
  readonly jobs: readonly ArtworkWarmupJob[];
}

export interface ArtworkWarmupSummary {
  readonly completedJobIds: readonly string[];
  readonly failedJobIds: readonly string[];
  readonly cancelled: boolean;
}

export interface ArtworkWarmupController {
  readonly finished: Promise<ArtworkWarmupSummary>;
  cancel(): void;
}

interface NetworkInformationLike {
  readonly effectiveType?: string;
  readonly saveData?: boolean;
}

interface NavigatorWithConnection extends Navigator {
  readonly connection?: NetworkInformationLike;
}

interface IdleCallbackRuntime {
  readonly requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => number;
  readonly cancelIdleCallback?: (handle: number) => void;
}

interface ArtworkWarmupRuntime {
  readonly concurrency: number;
  readonly fetchPriority: ArtworkFetchPriority;
  readonly preload: typeof preloadArtwork;
  readonly waitForBackgroundTurn: (signal: AbortSignal) => Promise<boolean>;
  readonly waitForVisibility: (signal: AbortSignal) => Promise<boolean>;
}

const WARMUP_START_MARK = 'kafu-artwork-warmup-start';
const WARMUP_COMPLETE_MARK = 'kafu-artwork-warmup-complete';

function markPerformance(name: string) {
  if (typeof performance !== 'undefined' && 'mark' in performance) {
    performance.mark(name);
  }
}

function resolveConcurrency() {
  if (typeof navigator === 'undefined') {
    return 1;
  }

  const connection = (navigator as NavigatorWithConnection).connection;
  if (
    connection?.saveData ||
    connection?.effectiveType === 'slow-2g' ||
    connection?.effectiveType === '2g' ||
    connection?.effectiveType === '3g'
  ) {
    return 1;
  }

  return 2;
}

function waitForWindowLoad(signal: AbortSignal) {
  if (typeof window === 'undefined' || document.readyState === 'complete') {
    return Promise.resolve(!signal.aborted);
  }

  return new Promise<boolean>((resolve) => {
    let settled = false;
    const finish = (loaded: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      window.removeEventListener('load', handleLoad);
      signal.removeEventListener('abort', handleAbort);
      resolve(loaded);
    };
    const handleLoad = () => finish(true);
    const handleAbort = () => finish(false);

    window.addEventListener('load', handleLoad, { once: true });
    signal.addEventListener('abort', handleAbort, { once: true });
  });
}

function waitForBackgroundTurn(signal: AbortSignal) {
  if (signal.aborted || typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  return new Promise<boolean>((resolve) => {
    const idleWindow = window as unknown as IdleCallbackRuntime;
    let settled = false;
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;

    const finish = (ready: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      if (
        idleHandle !== undefined &&
        typeof idleWindow.cancelIdleCallback === 'function'
      ) {
        idleWindow.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== undefined) {
        window.clearTimeout(timeoutHandle);
      }
      signal.removeEventListener('abort', handleAbort);
      resolve(ready);
    };
    const handleAbort = () => finish(false);

    signal.addEventListener('abort', handleAbort, { once: true });

    if (typeof idleWindow.requestIdleCallback === 'function') {
      idleHandle = idleWindow.requestIdleCallback(() => finish(true), {
        timeout: 1_500,
      });
      return;
    }

    timeoutHandle = window.setTimeout(() => finish(true), 0);
  });
}

function waitForVisibility(signal: AbortSignal) {
  if (
    signal.aborted ||
    typeof document === 'undefined' ||
    document.visibilityState !== 'hidden'
  ) {
    return Promise.resolve(!signal.aborted);
  }

  return new Promise<boolean>((resolve) => {
    let settled = false;
    const finish = (visible: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      signal.removeEventListener('abort', handleAbort);
      resolve(visible);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'hidden') {
        finish(true);
      }
    };
    const handleAbort = () => finish(false);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    signal.addEventListener('abort', handleAbort, { once: true });
  });
}

function deduplicateGroups(groups: readonly ArtworkWarmupGroup[]) {
  const seenRequests = new Set<string>();

  return groups
    .map((group) => ({
      ...group,
      jobs: group.jobs.filter((job) => {
        const role = job.role ?? 'responsive';
        const requestKey = artworkRequestKey(job.source, role, job.sizes);

        if (seenRequests.has(requestKey)) {
          return false;
        }

        seenRequests.add(requestKey);
        return true;
      }),
    }))
    .filter((group) => group.jobs.length > 0);
}

async function warmGroup(
  jobs: readonly ArtworkWarmupJob[],
  signal: AbortSignal,
  runtime: ArtworkWarmupRuntime,
  completedJobIds: string[],
  failedJobIds: string[],
) {
  const activeRequests = new Set<Promise<void>>();

  for (const job of jobs) {
    if (signal.aborted || !(await runtime.waitForVisibility(signal))) {
      break;
    }

    while (activeRequests.size >= runtime.concurrency) {
      await Promise.race(activeRequests);
      if (signal.aborted) {
        break;
      }
    }

    if (signal.aborted) {
      break;
    }

    const preloadOptions: ArtworkPreloadOptions = {
      fetchPriority: runtime.fetchPriority,
      ...(job.role ? { role: job.role } : {}),
      ...(job.sizes ? { sizes: job.sizes } : {}),
    };
    let request: Promise<void>;
    request = Promise.resolve()
      .then(() => runtime.preload(job.source, preloadOptions))
      .then(
        () => {
          completedJobIds.push(job.id);
        },
        () => {
          failedJobIds.push(job.id);
        },
      )
      .finally(() => {
        activeRequests.delete(request);
      });

    activeRequests.add(request);
  }

  await Promise.all(activeRequests);
}

export async function runArtworkWarmupQueue(
  groups: readonly ArtworkWarmupGroup[],
  signal: AbortSignal,
  runtime: Partial<ArtworkWarmupRuntime> = {},
): Promise<ArtworkWarmupSummary> {
  if (signal.aborted) {
    return {
      completedJobIds: [],
      failedJobIds: [],
      cancelled: true,
    };
  }

  const completedJobIds: string[] = [];
  const failedJobIds: string[] = [];
  const resolvedRuntime: ArtworkWarmupRuntime = {
    concurrency: Math.max(1, runtime.concurrency ?? resolveConcurrency()),
    fetchPriority: runtime.fetchPriority ?? 'low',
    preload: runtime.preload ?? preloadArtwork,
    waitForBackgroundTurn:
      runtime.waitForBackgroundTurn ?? waitForBackgroundTurn,
    waitForVisibility: runtime.waitForVisibility ?? waitForVisibility,
  };

  markPerformance(WARMUP_START_MARK);

  for (const group of deduplicateGroups(groups)) {
    if (
      signal.aborted ||
      !(await resolvedRuntime.waitForVisibility(signal)) ||
      !(await resolvedRuntime.waitForBackgroundTurn(signal))
    ) {
      break;
    }

    await warmGroup(
      group.jobs,
      signal,
      resolvedRuntime,
      completedJobIds,
      failedJobIds,
    );
  }

  if (!signal.aborted) {
    markPerformance(WARMUP_COMPLETE_MARK);
  }

  return {
    completedJobIds,
    failedJobIds,
    cancelled: signal.aborted,
  };
}

export function startArtworkWarmupQueue(
  groups: readonly ArtworkWarmupGroup[],
): ArtworkWarmupController {
  const controller = new AbortController();
  const finished = waitForWindowLoad(controller.signal).then((loaded) => {
    if (!loaded) {
      return {
        completedJobIds: [],
        failedJobIds: [],
        cancelled: true,
      } satisfies ArtworkWarmupSummary;
    }

    return runArtworkWarmupQueue(groups, controller.signal);
  });

  return {
    finished,
    cancel: () => controller.abort(),
  };
}
