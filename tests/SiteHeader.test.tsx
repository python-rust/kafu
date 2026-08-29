import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  SiteHeader,
  type SiteHeaderNavItem,
} from '../src/pages/HomePage/sections/SiteHeader';

const navFixture = [
  { label: '軌跡', href: '#journey' },
  { label: '作品', href: '#works' },
  { label: '視覚', href: '#visuals' },
  { label: '公式', href: '#links' },
] as const satisfies readonly SiteHeaderNavItem[];

describe('SiteHeader', () => {
  it('renders direct project identity and semantic Japanese anchor navigation', () => {
    render(
      <SiteHeader
        projectName="KAF Observatory Test"
        navLabel="KAF sections"
        navItems={navFixture}
      />,
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('KAF Observatory Test')).toBeInTheDocument();
    expect(
      screen.queryByText('UNOFFICIAL / NON-COMMERCIAL'),
    ).not.toBeInTheDocument();

    const navigation = screen.getByRole('navigation', { name: 'KAF sections' });
    expect(
      within(navigation).getByRole('link', { name: '軌跡' }),
    ).toHaveAttribute('href', '#journey');
    expect(
      within(navigation).getByRole('link', { name: '作品' }),
    ).toHaveAttribute('href', '#works');
    expect(
      within(navigation).getByRole('link', { name: '視覚' }),
    ).toHaveAttribute('href', '#visuals');
    expect(
      within(navigation).getByRole('link', { name: '公式' }),
    ).toHaveAttribute('href', '#links');
  });

  it('ships the four required direct destinations as the stable default contract', () => {
    render(<SiteHeader />);

    const navigation = screen.getByRole('navigation', {
      name: '主なナビゲーション',
    });

    expect(within(navigation).getAllByRole('link')).toHaveLength(4);
    expect(
      within(navigation).getByRole('link', { name: '軌跡' }),
    ).toHaveAttribute('href', '#journey');
    expect(
      within(navigation).getByRole('link', { name: '視覚' }),
    ).toHaveAttribute('href', '#visuals');
  });
});
