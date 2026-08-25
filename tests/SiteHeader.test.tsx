import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  SiteHeader,
  type SiteHeaderNavItem,
} from '../src/pages/HomePage/sections/SiteHeader';

const navFixture = [
  { label: 'Journey', href: '#journey' },
  { label: 'Works', href: '#works' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Official Links', href: '#official' },
] as const satisfies readonly SiteHeaderNavItem[];

describe('SiteHeader', () => {
  it('renders fan-project identity, status, and semantic anchor navigation', () => {
    render(
      <SiteHeader
        projectName="KAF Observatory Test"
        statusLabel="UNOFFICIAL / NON-COMMERCIAL"
        navLabel="KAF sections"
        navItems={navFixture}
      />,
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('KAF Observatory Test')).toBeInTheDocument();
    expect(screen.getByText('UNOFFICIAL / NON-COMMERCIAL')).toBeInTheDocument();

    const navigation = screen.getByRole('navigation', { name: 'KAF sections' });
    expect(
      within(navigation).getByRole('link', { name: 'Journey' }),
    ).toHaveAttribute('href', '#journey');
    expect(
      within(navigation).getByRole('link', { name: 'Works' }),
    ).toHaveAttribute('href', '#works');
    expect(
      within(navigation).getByRole('link', { name: 'Gallery' }),
    ).toHaveAttribute('href', '#gallery');
    expect(
      within(navigation).getByRole('link', { name: 'Official Links' }),
    ).toHaveAttribute('href', '#official');
  });

  it('ships the required direct navigation as the stable default contract', () => {
    render(<SiteHeader />);

    const navigation = screen.getByRole('navigation', {
      name: 'Primary navigation',
    });

    expect(within(navigation).getAllByRole('link')).toHaveLength(4);
    expect(
      within(navigation).getByRole('link', { name: 'Journey' }),
    ).toHaveAttribute('href', '#journey');
  });
});
