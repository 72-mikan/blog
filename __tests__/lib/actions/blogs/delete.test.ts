import { describe, it, expect, vi, beforeEach } from 'vitest';
import dotenv from 'dotenv';
import { deleteBlogPost } from '@/lib/actions/blogs/delete';
import { auth } from '@/auth';
import type { Mock } from 'vitest';
import { cookies } from 'next/headers';

dotenv.config();

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('deleteBlogPost', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('未ログインの場合はエラーを返す', async () => {
    (auth as Mock).mockResolvedValue(null);

    const result = await deleteBlogPost(1);

    expect(result?.success).toBe(false);
    expect(result?.errors?.error).toBe('ログインが必要です。');
  });

  it('APIエラー時にエラーを返す', async () => {
    (auth as Mock).mockResolvedValue({ user: { id: 'user-1' } });
    (cookies as Mock).mockReturnValue({ toString: () => 'session=abc' });

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({
        errors: { error: '削除に失敗しました。' },
      }),
    }) as any;

    const result = await deleteBlogPost(1);

    expect(result?.success).toBe(false);
    expect(result?.errors?.error).toBe('削除に失敗しました。');
  });

  it('正常時にsuccessを返す', async () => {
    (auth as Mock).mockResolvedValue({ user: { id: 'user-1' } });
    (cookies as Mock).mockReturnValue({ toString: () => 'session=abc' });

    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as any;

    const result = await deleteBlogPost(1);

    expect(result?.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      `${process.env.URL}/api/blogs/1`,
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Cookie: 'session=abc',
        }),
      })
    );
  });
});
