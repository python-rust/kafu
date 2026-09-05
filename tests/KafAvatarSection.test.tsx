import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { kafAvatarAsset } from '../src/content/kafAvatar';
import { KafAvatarSection } from '../src/pages/HomePage/sections/KafAvatarSection';

vi.mock('../src/pages/HomePage/sections/KafVrmStage', () => ({
  default: ({ onReady }: { onReady: () => void }) => {
    useEffect(() => onReady(), [onReady]);
    return <canvas data-testid="mock-kaf-vrm-canvas" />;
  },
}));

afterEach(cleanup);

describe('KafAvatarSection', () => {
  it('exposes a static fallback and public model metadata before loading WebGL', () => {
    render(<KafAvatarSection />);

    expect(
      screen.getByRole('heading', { level: 2, name: '动态形象' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /花谱 VRM 模型预览/ }),
    ).toHaveAttribute('loading', 'lazy');
    expect(screen.getByText('mme', { exact: true })).toBeVisible();
    expect(screen.getByRole('link', { name: '作者的B站首页' })).toHaveAttribute(
      'href',
      kafAvatarAsset.authorBilibiliUrl,
    );
    expect(screen.getByRole('link', { name: '作者的B站首页' })).toHaveAttribute(
      'target',
      '_blank',
    );
    expect(screen.queryByText(kafAvatarAsset.sha256)).not.toBeInTheDocument();
    expect(screen.getByText(kafAvatarAsset.permissionSummary)).toBeVisible();
    expect(
      screen.queryByText(/这件网页角色|模型接近本区域|Cloudflare R2/),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '下载 VRM 模型' })).toHaveAttribute(
      'href',
      kafAvatarAsset.publicPath,
    );
    expect(
      screen.getByRole('button', { name: '查看模型清单' }),
    ).toHaveAttribute('aria-haspopup', 'dialog');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-kaf-vrm-canvas')).not.toBeInTheDocument();
  });

  it('allows an explicit load when viewport observation is unavailable', async () => {
    render(<KafAvatarSection />);

    fireEvent.click(screen.getByRole('button', { name: '加载动态形象' }));

    expect(
      await screen.findByTestId('mock-kaf-vrm-canvas'),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByTestId('kaf-avatar-stage')).toHaveAttribute(
        'data-status',
        'ready',
      ),
    );
    expect(screen.queryByText('动态形象已加载。')).not.toBeInTheDocument();
  });

  it('discloses canonical metadata in a dialog without loading the model', async () => {
    render(<KafAvatarSection />);
    const trigger = screen.getByRole('button', { name: '查看模型清单' });
    fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: '模型清单' });
    expect(within(dialog).getByText(kafAvatarAsset.sha256)).toBeVisible();
    expect(within(dialog).getByText(kafAvatarAsset.format)).toBeVisible();
    expect(
      within(dialog).getByText(kafAvatarAsset.permissionSummary),
    ).toBeVisible();
    expect(
      within(dialog).getByRole('link', { name: '下载 VRM 模型' }),
    ).toHaveAttribute(
      'href',
      new URL(kafAvatarAsset.publicPath, window.location.origin).href,
    );
    expect(screen.queryByTestId('mock-kaf-vrm-canvas')).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: '关闭' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
