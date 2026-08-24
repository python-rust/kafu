import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { App } from '../src/app/App';

describe('home page', () => {
  it('renders the KAF editorial fan-site structure and official destinations', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /花譜.*KAF/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('UNOFFICIAL FAN PROJECT · NON-COMMERCIAL'),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: '声が、風景を変えていく。' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Selected Works' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Visual Archive' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Go to the source.' }),
    ).toBeInTheDocument();

    const worksSection = screen
      .getByRole('heading', { name: 'Selected Works' })
      .closest('section');
    expect(worksSection).not.toBeNull();

    if (!worksSection) {
      throw new Error('Selected Works section was not rendered.');
    }

    expect(
      within(worksSection).getByRole('heading', { name: '深愛' }),
    ).toBeInTheDocument();
    expect(
      within(worksSection).getByRole('heading', { name: '寓話' }),
    ).toBeInTheDocument();
    expect(
      within(worksSection).getByRole('heading', { name: '魔法α' }),
    ).toBeInTheDocument();
    expect(
      within(worksSection).getByRole('heading', { name: '観測α' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: /OFFICIAL SITE/i }),
    ).toHaveAttribute('href', 'https://kaf.kamitsubaki.jp/');
    expect(screen.getByRole('link', { name: /YouTube/ })).toHaveAttribute(
      'href',
      'https://www.youtube.com/channel/UCQ1U65-CQdIoZ2_NA4Z4F7A',
    );
  });
});
