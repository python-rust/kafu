import { describe, expect, it } from 'vitest';

import {
  createKafAvatarPublicManifest,
  kafAvatarAsset,
} from '../src/content/kafAvatar';

describe('KAF avatar asset lock', () => {
  it('keeps public paths and R2 keys content-addressed by the model hash', () => {
    expect(kafAvatarAsset.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(kafAvatarAsset.sha256Prefix).toBe(
      kafAvatarAsset.sha256.slice(0, kafAvatarAsset.sha256Prefix.length),
    );
    expect(kafAvatarAsset.publicPath).toContain(kafAvatarAsset.sha256Prefix);
    expect(kafAvatarAsset.objectKey).toContain(kafAvatarAsset.sha256Prefix);
    expect(kafAvatarAsset.publicPath).not.toContain('r2.dev');
  });

  it('publishes only reproducibility metadata and the same-origin download URL', () => {
    expect(createKafAvatarPublicManifest('https://kafu.example')).toEqual({
      id: kafAvatarAsset.id,
      title: kafAvatarAsset.title,
      version: kafAvatarAsset.version,
      format: kafAvatarAsset.format,
      author: kafAvatarAsset.author,
      permissionSummary: kafAvatarAsset.permissionSummary,
      byteSize: kafAvatarAsset.byteSize,
      sha256: kafAvatarAsset.sha256,
      downloadUrl: `https://kafu.example${kafAvatarAsset.publicPath}`,
    });
  });
});
