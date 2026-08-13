import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/app/components/layouts/Header';
import { USER_ROLE } from '@/constants/role';

// @vitest-environment jsdom

type MockSession = {
  data: { user: { role?: string } } | null;
};

let mockSession: MockSession;

vi.mock('next-auth/react', () => ({
  useSession: () => mockSession,
}));

vi.mock('@/lib/actions/signOut', () => ({
  customSignOut: vi.fn(),
}));

describe('Header', () => {
  beforeEach(() => {
    mockSession = { data: null };
  });

  it('未ログイン時はLogin/Sign Upリンクが表示される', () => {
    render(<Header />);

    expect(screen.getAllByText('Login').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sign Up').length).toBeGreaterThan(0);
    expect(screen.queryByText('Sign Out')).toBeNull();
  });

  it('ログイン時（非管理者）はSign Outが表示され、Post/Tagsは表示されない', () => {
    mockSession = { data: { user: { role: USER_ROLE.USER } } };
    render(<Header />);

    expect(screen.getAllByText('Sign Out').length).toBeGreaterThan(0);
    expect(screen.queryByText('Post')).toBeNull();
    expect(screen.queryByText('Tags')).toBeNull();
  });

  it('管理者ログイン時はPost/Tagsリンクが表示される', () => {
    mockSession = { data: { user: { role: USER_ROLE.ADMIN } } };
    render(<Header />);

    expect(screen.getAllByText('Post').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Tags').length).toBeGreaterThan(0);
  });

  it('メニューボタンをクリックするとモバイルナビゲーションが表示される', () => {
    render(<Header />);

    expect(screen.getAllByText('Home')).toHaveLength(1);

    const menuButton = screen.getByRole('button', { name: 'Open main menu' });
    expect(menuButton.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(menuButton);

    expect(menuButton.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getAllByText('Home')).toHaveLength(2);
  });
});
