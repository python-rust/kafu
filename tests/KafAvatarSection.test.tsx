import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
    expect(screen.getByText(kafAvatarAsset.sha256)).toBeVisible();
    expect(screen.getByRole('link', { name: '下载 VRM 模型' })).toHaveAttribute(
      'href',
      kafAvatarAsset.publicPath,
    );
    expect(screen.getByRole('link', { name: '查看模型清单' })).toHaveAttribute(
      'href',
      kafAvatarAsset.manifestPath,
    );
    expect(screen.queryByTestId('mock-kaf-vrm-canvas')).not.toBeInTheDocument();
  });

  it('allows an explicit load when viewport observation is unavailable', async () => {
    render(<KafAvatarSection />);

    fireEvent.click(screen.getByRole('button', { name: '加载动态形象' }));

    expect(
      await screen.findByTestId('mock-kaf-vrm-canvas'),
    ).toBeInTheDocument();
    expect(await screen.findByText('动态形象已加载。')).toBeInTheDocument();
  });
});
