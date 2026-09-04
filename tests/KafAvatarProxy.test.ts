import { describe, expect, it, vi } from 'vitest';

import { onRequest, _test } from '../functions/assets/models/kaf/[[path]]';
import { kafAvatarAsset } from '../src/content/kafAvatar';

interface FakeRange {
  readonly offset: number;
  readonly length: number;
}

function createObject(body = 'glTF', range?: FakeRange) {
  return {
    size: kafAvatarAsset.byteSize,
    etag: '0123456789abcdef',
    httpEtag: '"0123456789abcdef"',
    ...(range ? { range } : {}),
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(body));
        controller.close();
      },
    }),
    writeHttpMetadata(headers: Headers) {
      headers.set('Content-Type', kafAvatarAsset.mimeType);
      headers.set('Cache-Control', kafAvatarAsset.cacheControl);
    },
  };
}

function createBucket() {
  const get = vi.fn(
    async (
      _key: string,
      options?: {
        readonly range?: {
          readonly offset?: number;
          readonly length?: number;
        };
      },
    ) => {
      const range = options?.range;
      return createObject(
        range ? 'part' : 'glTF',
        range?.offset !== undefined && range.length !== undefined
          ? { offset: range.offset, length: range.length }
          : undefined,
      );
    },
  );
  const head = vi.fn(async () => createObject());

  return { get, head };
}

function request(
  path: string,
  bucket: ReturnType<typeof createBucket>,
  init?: RequestInit,
) {
  return onRequest({
    request: new Request(`https://kafu.example${path}`, init),
    env: { KAF_AVATAR_ASSETS: bucket },
  });
}

describe('KAF avatar Pages Function', () => {
  it('serves a public machine-readable manifest from the shared asset lock', async () => {
    const bucket = createBucket();
    const response = await request(kafAvatarAsset.manifestPath, bucket);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(
      'application/json; charset=utf-8',
    );
    await expect(response.json()).resolves.toMatchObject({
      id: kafAvatarAsset.id,
      author: 'mme',
      byteSize: kafAvatarAsset.byteSize,
      sha256: kafAvatarAsset.sha256,
      downloadUrl: `https://kafu.example${kafAvatarAsset.publicPath}`,
    });
    expect(bucket.get).not.toHaveBeenCalled();
    expect(bucket.head).not.toHaveBeenCalled();
  });

  it('streams the locked full model with immutable public metadata', async () => {
    const bucket = createBucket();
    const response = await request(kafAvatarAsset.publicPath, bucket);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('glTF');
    expect(bucket.get).toHaveBeenCalledWith(
      kafAvatarAsset.objectKey,
      undefined,
    );
    expect(response.headers.get('Content-Type')).toBe(kafAvatarAsset.mimeType);
    expect(response.headers.get('Content-Length')).toBe(
      String(kafAvatarAsset.byteSize),
    );
    expect(response.headers.get('Cache-Control')).toBe(
      kafAvatarAsset.cacheControl,
    );
    expect(response.headers.get('Accept-Ranges')).toBe('bytes');
    expect(response.headers.get('ETag')).toBe('"0123456789abcdef"');
  });

  it('serves metadata-only HEAD responses without fetching the body', async () => {
    const bucket = createBucket();
    const response = await request(kafAvatarAsset.publicPath, bucket, {
      method: 'HEAD',
    });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('');
    expect(bucket.head).toHaveBeenCalledWith(kafAvatarAsset.objectKey);
    expect(bucket.get).not.toHaveBeenCalled();
    expect(response.headers.get('Content-Length')).toBe(
      String(kafAvatarAsset.byteSize),
    );
  });

  it('supports a single byte range and rejects invalid or multiple ranges', async () => {
    const bucket = createBucket();
    const response = await request(kafAvatarAsset.publicPath, bucket, {
      headers: { Range: 'bytes=0-3' },
    });

    expect(response.status).toBe(206);
    expect(await response.text()).toBe('part');
    expect(bucket.get).toHaveBeenCalledWith(kafAvatarAsset.objectKey, {
      range: { offset: 0, length: 4 },
    });
    expect(response.headers.get('Content-Range')).toBe(
      `bytes 0-3/${kafAvatarAsset.byteSize}`,
    );
    expect(response.headers.get('Content-Length')).toBe('4');

    const invalid = await request(kafAvatarAsset.publicPath, createBucket(), {
      headers: { Range: 'bytes=0-1,4-5' },
    });
    expect(invalid.status).toBe(416);
    expect(invalid.headers.get('Content-Range')).toBe(
      `bytes */${kafAvatarAsset.byteSize}`,
    );
  });

  it('rejects unknown paths and non-read methods before touching R2', async () => {
    const unknownBucket = createBucket();
    const unknown = await request(
      '/assets/models/kaf/v1/unlisted.vrm',
      unknownBucket,
    );
    expect(unknown.status).toBe(404);
    expect(unknownBucket.get).not.toHaveBeenCalled();

    const writeBucket = createBucket();
    const write = await request(kafAvatarAsset.publicPath, writeBucket, {
      method: 'POST',
    });
    expect(write.status).toBe(405);
    expect(write.headers.get('Allow')).toBe('GET, HEAD');
    expect(writeBucket.get).not.toHaveBeenCalled();
  });

  it('parses open-ended and suffix ranges against the locked size', () => {
    expect(_test.parseByteRange('bytes=10-', 100)).toEqual({
      offset: 10,
      length: 90,
    });
    expect(_test.parseByteRange('bytes=-12', 100)).toEqual({
      offset: 88,
      length: 12,
    });
    expect(_test.parseByteRange('bytes=100-', 100)).toBe('invalid');
  });
});
