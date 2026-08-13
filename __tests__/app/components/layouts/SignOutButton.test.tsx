import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SignOutButton from '@/app/components/layouts/SignOutButton';

// @vitest-environment jsdom

let mockPending = false;
const mockStartTransition = vi.fn((callback: () => void) => callback());
const mockCustomSignOut = vi.fn();

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return {
    ...actual,
    useTransition: () => [mockPending, mockStartTransition],
  };
});

vi.mock('@/lib/actions/signOut', () => ({
  customSignOut: () => mockCustomSignOut(),
}));

describe('SignOutButton', () => {
  beforeEach(() => {
    mockPending = false;
    mockStartTransition.mockClear();
    mockCustomSignOut.mockClear();
  });

  it('通常時は"Sign Out"を表示し、ボタンは有効になる', () => {
    render(<SignOutButton />);

    const button = screen.getByRole('button') as HTMLButtonElement;
    expect(button.textContent).toBe('Sign Out');
    expect(button.disabled).toBe(false);
  });

  it('クリックするとcustomSignOutが呼ばれる', () => {
    render(<SignOutButton />);

    fireEvent.click(screen.getByRole('button'));

    expect(mockStartTransition).toHaveBeenCalled();
    expect(mockCustomSignOut).toHaveBeenCalled();
  });

  it('isPendingがtrueの場合、"Signing out..."を表示しボタンが無効になる', () => {
    mockPending = true;
    render(<SignOutButton />);

    const button = screen.getByRole('button') as HTMLButtonElement;
    expect(button.textContent).toBe('Signing out...');
    expect(button.disabled).toBe(true);
  });
});
