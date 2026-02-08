import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBlogPost } from '@/lib/actions/blogs/create';
import type { Mock } from 'vitest';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('createBlogPost', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('正常系のテスト', () => {
    it('記事の投稿完了でredirectが呼ばれる', async () => {
      (auth as Mock).mockResolvedValue({ user: { id: 'user-1' } });
      global.fetch = vi.fn().mockResolvedValue({ ok: true }) as any;

      const formData = new FormData();
      formData.append('title', 'タイトル');
      formData.append('tag', 'tag1 tag2');
      formData.append('context', '本文');
      formData.append('isPublic', 'true');

      await createBlogPost(undefined, formData);

      expect(redirect).toHaveBeenCalledWith('/blogs');
    });
  });

  describe('異常系のテスト', () => {
    it('ログインしていない場合、エラーを返す。', async () => {
      (auth as Mock).mockResolvedValue(null);
      const formData = new FormData();

      const result = await createBlogPost(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.error).toBe('ログインが必要です。');
    });

    it('バリデーションエラー時にエラーとformDataを返す', async () => {
      (auth as Mock).mockResolvedValue({ user: { id: 'user-1' } });

      const formData = new FormData();

      const result = await createBlogPost(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.title).toBeTruthy();
      expect(result?.errors?.context).toBeTruthy();
      expect(result?.errors?.tags).toBeTruthy();
      expect(result?.formData).toEqual({
        title: '',
        tag: '',
        context: '',
      });
    });

    it('APIエラー時にエラーとformDataを返す', async () => {
      (auth as Mock).mockResolvedValue({ user: { id: 'user-1' } });
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({
          errors: { error: 'API接続エラー' },
        }),
      }) as any;

      const formData = new FormData();
      formData.append('title', 'タイトル');
      formData.append('tag', 'tag1 tag2');
      formData.append('context', '本文');

      const result = await createBlogPost(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.error).toBe('API接続エラー');
      expect(result?.formData).toEqual({
        title: 'タイトル',
        tag: 'tag1 tag2',
        context: '本文',
      });
    });
  });
});