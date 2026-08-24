import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { App } from '../src/app/App';

describe('home page', () => {
  it('renders the fan-project identity and observatory introduction', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    expect(
      screen.getByText('UNOFFICIAL FAN PROJECT · 2026'),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /花譜/ })).toBeInTheDocument();
    expect(
      screen.getByText(
        '一个正在形成中的数字观测站。音乐、时间与视觉将逐层进入这个空间。',
      ),
    ).toBeInTheDocument();
  });
});
