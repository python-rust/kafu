import assetLock from './kafAvatar.json' with { type: 'json' };

export const kafAvatarAsset = assetLock;

export interface KafAvatarPublicManifest {
  id: string;
  title: string;
  version: string;
  format: string;
  author: string;
  permissionSummary: string;
  byteSize: number;
  sha256: string;
  downloadUrl: string;
}

export function createKafAvatarPublicManifest(
  origin: string,
): KafAvatarPublicManifest {
  return {
    id: kafAvatarAsset.id,
    title: kafAvatarAsset.title,
    version: kafAvatarAsset.version,
    format: kafAvatarAsset.format,
    author: kafAvatarAsset.author,
    permissionSummary: kafAvatarAsset.permissionSummary,
    byteSize: kafAvatarAsset.byteSize,
    sha256: kafAvatarAsset.sha256,
    downloadUrl: new URL(kafAvatarAsset.publicPath, origin).href,
  };
}
