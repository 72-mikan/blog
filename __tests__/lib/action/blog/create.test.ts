import { describe, it, expect, vi } from 'vitest';
import { createBlogPost } from '@/lib/actions/blog/create';
import { getToken } from '@/lib/jwt';
import type { Mock } from 'vitest';
import { redirect } from 'next/navigation';

vi.mock('@/lib/jwt', () => ({
  getToken: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('createBlogPost', () => {
  describe('正常系のテスト', () => {
    it('記事の投稿完了でredirectが呼ばれる', async () => {
      (getToken as Mock).mockResolvedValue('dummy-token');
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
  // describe('異常系のテスト', () => {
  //   it('レスポンスが不正な場合、エラーオブジェクトを返す', async () => {
  //     (getToken as Mock).mockResolvedValue('dummy-token');
  //     global.fetch = vi.fn().mockResolvedValue({ ok: false }) as any;

  //     const formData = new FormData();
  //     formData.append('title', 'タイトル');
  //     formData.append('tag', 'tag1 tag2');
  //     formData.append('context', '本文');
  //     formData.append('isPublic', 'true');

  //     const result = await createBlogPost(undefined, formData);

  //     expect(result).toEqual({ error: '記事の投稿に失敗しました' });
  //   });
  // });
});