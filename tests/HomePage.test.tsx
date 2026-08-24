import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { App } from '../src/app/App';

describe('home page', () => {
  it('renders the fan-project identity and interactive development puppet', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    expect(
      screen.getByText('UNOFFICIAL FAN PROJECT · 2026'),
    ).toBeInTheDocument();

    const puppet = screen.getByRole('button', {
      name: '与开发中的花谱 2D 角色互动',
    });

    await user.click(puppet);

    expect(screen.getByText('01 SIGNALS')).toBeInTheDocument();
  });
});
