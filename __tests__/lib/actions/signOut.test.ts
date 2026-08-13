import { describe, it, expect, vi, beforeEach } from 'vitest';
import { customSignOut } from '@/lib/actions/signOut';
import { signOut } from '@/auth';
import type { Mock } from 'vitest';

vi.mock('@/auth', () => ({
  signOut: vi.fn(),
}));

describe('customSignOut', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('next-authのsignOutを呼び出す', async () => {
    (signOut as Mock).mockResolvedValue(undefined);

    await customSignOut();

    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('signOutが失敗した場合はエラーが伝播する', async () => {
    (signOut as Mock).mockRejectedValue(new Error('signOut failed'));

    await expect(customSignOut()).rejects.toThrow('signOut failed');
  });
});
