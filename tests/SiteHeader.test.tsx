import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  SiteHeader,
  type SiteHeaderNavItem,
} from '../src/pages/HomePage/sections/SiteHeader';

const navFixture = [
  { label: '认识花谱', href: '#about' },
  { label: '成长轨迹', href: '#journey' },
  { label: '代表作品', href: '#works' },
  { label: '视觉档案', href: '#visuals' },
  { label: '官方入口', href: '#links' },
] as const satisfies readonly SiteHeaderNavItem[];

describe('SiteHeader', () => {
  it('renders direct project identity and semantic Chinese anchor navigation', () => {
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
      within(navigation).getByRole('link', { name: '认识花谱' }),
    ).toHaveAttribute('href', '#about');
    expect(
      within(navigation).getByRole('link', { name: '成长轨迹' }),
    ).toHaveAttribute('href', '#journey');
    expect(
      within(navigation).getByRole('link', { name: '代表作品' }),
    ).toHaveAttribute('href', '#works');
    expect(
      within(navigation).getByRole('link', { name: '视觉档案' }),
    ).toHaveAttribute('href', '#visuals');
    expect(
      within(navigation).getByRole('link', { name: '官方入口' }),
    ).toHaveAttribute('href', '#links');
  });

  it('ships the five required direct destinations as the stable default contract', () => {
    render(<SiteHeader />);

    const navigation = screen.getByRole('navigation', {
      name: '页面主要导航',
    });

    expect(within(navigation).getAllByRole('link')).toHaveLength(5);
    expect(
      within(navigation).getByRole('link', { name: '认识花谱' }),
    ).toHaveAttribute('href', '#about');
    expect(
      within(navigation).getByRole('link', { name: '成长轨迹' }),
    ).toHaveAttribute('href', '#journey');
    expect(
      within(navigation).getByRole('link', { name: '视觉档案' }),
    ).toHaveAttribute('href', '#visuals');
  });
});
