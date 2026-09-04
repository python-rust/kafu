import {
  createKafAvatarPublicManifest,
  kafAvatarAsset,
} from '../../../../src/content/kafAvatar';

interface R2Range {
  offset?: number;
  length?: number;
  suffix?: number;
}

interface R2ObjectMetadata {
  readonly size: number;
  readonly etag: string;
  readonly httpEtag: string;
  readonly range?: {
    readonly offset: number;
    readonly length: number;
  };
  writeHttpMetadata(headers: Headers): void;
}

interface R2ObjectBody extends R2ObjectMetadata {
  readonly body: ReadableStream<Uint8Array>;
}

interface R2BucketBinding {
  get(
    key: string,
    options?: { readonly range?: R2Range },
  ): Promise<R2ObjectBody | null>;
  head(key: string): Promise<R2ObjectMetadata | null>;
}

interface KafAvatarEnvironment {
  readonly KAF_AVATAR_ASSETS: R2BucketBinding;
}

interface PagesFunctionContext {
  readonly request: Request;
  readonly env: KafAvatarEnvironment;
}

interface ParsedByteRange {
  readonly offset: number;
  readonly length: number;
}

const MODEL_SECURITY_HEADERS = {
  'Accept-Ranges': 'bytes',
  'Cache-Control': kafAvatarAsset.cacheControl,
  'Cross-Origin-Resource-Policy': 'same-origin',
  'X-Content-Type-Options': 'nosniff',
} as const;

function notFound(): Response {
  return new Response('Not Found', {
    status: 404,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function methodNotAllowed(): Response {
  return new Response('Method Not Allowed', {
    status: 405,
    headers: {
      Allow: 'GET, HEAD',
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function parseByteRange(
  rangeHeader: string | null,
  size: number,
): ParsedByteRange | null | 'invalid' {
  if (rangeHeader === null) {
    return null;
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());

  if (!match) {
    return 'invalid';
  }

  const startText = match[1] ?? '';
  const endText = match[2] ?? '';

  if (startText === '' && endText === '') {
    return 'invalid';
  }

  if (startText === '') {
    const suffixLength = Number(endText);

    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) {
      return 'invalid';
    }

    const length = Math.min(size, suffixLength);
    return { offset: size - length, length };
  }

  const offset = Number(startText);

  if (!Number.isSafeInteger(offset) || offset < 0 || offset >= size) {
    return 'invalid';
  }

  if (endText === '') {
    return { offset, length: size - offset };
  }

  const requestedEnd = Number(endText);

  if (
    !Number.isSafeInteger(requestedEnd) ||
    requestedEnd < offset ||
    requestedEnd < 0
  ) {
    return 'invalid';
  }

  const end = Math.min(size - 1, requestedEnd);
  return { offset, length: end - offset + 1 };
}

function rangeNotSatisfiable(): Response {
  return new Response('Range Not Satisfiable', {
    status: 416,
    headers: {
      ...MODEL_SECURITY_HEADERS,
      'Content-Range': `bytes */${kafAvatarAsset.byteSize}`,
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

function createModelHeaders(
  object: R2ObjectMetadata,
  range: ParsedByteRange | null,
): Headers {
  const headers = new Headers();
  object.writeHttpMetadata(headers);

  headers.set('Accept-Ranges', MODEL_SECURITY_HEADERS['Accept-Ranges']);
  headers.set('Cache-Control', MODEL_SECURITY_HEADERS['Cache-Control']);
  headers.set(
    'Cross-Origin-Resource-Policy',
    MODEL_SECURITY_HEADERS['Cross-Origin-Resource-Policy'],
  );
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Content-Type', kafAvatarAsset.mimeType);
  headers.set(
    'Content-Disposition',
    `inline; filename="${kafAvatarAsset.downloadFilename}"`,
  );
  headers.set('ETag', object.httpEtag || `"${object.etag}"`);

  if (range) {
    const actualRange = object.range ?? range;
    const end = actualRange.offset + actualRange.length - 1;
    headers.set('Content-Length', String(actualRange.length));
    headers.set(
      'Content-Range',
      `bytes ${actualRange.offset}-${end}/${object.size}`,
    );
  } else {
    headers.set('Content-Length', String(object.size));
  }

  return headers;
}

function hasExpectedSize(object: R2ObjectMetadata): boolean {
  return object.size === kafAvatarAsset.byteSize;
}

function assetMetadataMismatch(): Response {
  return new Response('Asset metadata mismatch', {
    status: 502,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function createManifestResponse(request: Request): Response {
  const body = `${JSON.stringify(
    createKafAvatarPublicManifest(new URL(request.url).origin),
    null,
    2,
  )}\n`;
  const headers = new Headers({
    'Cache-Control': 'public, max-age=300, must-revalidate',
    'Content-Length': String(new TextEncoder().encode(body).byteLength),
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });

  return new Response(request.method === 'HEAD' ? null : body, { headers });
}

async function createModelResponse(
  request: Request,
  bucket: R2BucketBinding,
): Promise<Response> {
  if (request.method === 'HEAD') {
    const object = await bucket.head(kafAvatarAsset.objectKey);

    if (!object) {
      return notFound();
    }

    if (!hasExpectedSize(object)) {
      return assetMetadataMismatch();
    }

    const headers = createModelHeaders(object, null);

    if (request.headers.get('If-None-Match') === headers.get('ETag')) {
      return new Response(null, { status: 304, headers });
    }

    return new Response(null, { headers });
  }

  const range = parseByteRange(
    request.headers.get('Range'),
    kafAvatarAsset.byteSize,
  );

  if (range === 'invalid') {
    return rangeNotSatisfiable();
  }

  const object = await bucket.get(
    kafAvatarAsset.objectKey,
    range ? { range } : undefined,
  );

  if (!object) {
    return notFound();
  }

  if (!hasExpectedSize(object)) {
    return assetMetadataMismatch();
  }

  const headers = createModelHeaders(object, range);

  if (request.headers.get('If-None-Match') === headers.get('ETag')) {
    return new Response(null, { status: 304, headers });
  }

  return new Response(object.body, {
    status: range ? 206 : 200,
    headers,
  });
}

export async function onRequest({
  request,
  env,
}: PagesFunctionContext): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return methodNotAllowed();
  }

  const pathname = new URL(request.url).pathname;

  if (pathname === kafAvatarAsset.manifestPath) {
    return createManifestResponse(request);
  }

  if (pathname !== kafAvatarAsset.publicPath) {
    return notFound();
  }

  return createModelResponse(request, env.KAF_AVATAR_ASSETS);
}

export const _test = {
  parseByteRange,
};
