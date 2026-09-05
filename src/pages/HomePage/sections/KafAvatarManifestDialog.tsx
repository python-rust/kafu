import * as Dialog from '@radix-ui/react-dialog';
import type { RefObject } from 'react';

import {
  createKafAvatarPublicManifest,
  kafAvatarAsset,
} from '../../../content/kafAvatar';
import styles from './KafAvatarManifestDialog.module.css';

interface KafAvatarManifestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

export default function KafAvatarManifestDialog({
  open,
  onOpenChange,
  triggerRef,
}: KafAvatarManifestDialogProps) {
  const manifest = createKafAvatarPublicManifest(window.location.origin);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay}>
          <Dialog.Content
            className={styles.panel}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              triggerRef.current?.focus({ preventScroll: true });
            }}
          >
            <header className={styles.header}>
              <Dialog.Title className={styles.title}>模型清单</Dialog.Title>
              <Dialog.Close className={styles.close}>关闭</Dialog.Close>
            </header>
            <Dialog.Description className={styles.description}>
              {manifest.title}
            </Dialog.Description>

            <dl className={styles.metadata}>
              <div>
                <dt>模型制作</dt>
                <dd>{manifest.author}</dd>
              </div>
              <div>
                <dt>授权</dt>
                <dd>{manifest.permissionSummary}</dd>
              </div>
              <div>
                <dt>模型标识</dt>
                <dd>{manifest.id}</dd>
              </div>
              <div>
                <dt>版本</dt>
                <dd>{manifest.version}</dd>
              </div>
              <div>
                <dt>格式</dt>
                <dd>{manifest.format}</dd>
              </div>
              <div>
                <dt>文件大小</dt>
                <dd>
                  {kafAvatarAsset.byteSizeLabel}（
                  {manifest.byteSize.toLocaleString('zh-CN')} 字节）
                </dd>
              </div>
              <div>
                <dt>SHA-256</dt>
                <dd>
                  <code>{manifest.sha256}</code>
                </dd>
              </div>
            </dl>

            <p className={styles.permission}>
              公开下载不代表开放许可；其他用途请另行确认授权。
            </p>
            <a
              className={styles.download}
              href={manifest.downloadUrl}
              download={kafAvatarAsset.downloadFilename}
            >
              下载 VRM 模型
            </a>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
