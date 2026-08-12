import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateBlogPost } from '@/lib/actions/blogs/update';
import type { Mock } from 'vitest';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findFirst: vi.fn() },
    tag: { findMany: vi.fn() },
    context: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('updateBlogPost', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('正常系のテスト', () => {
    it('記事の更新完了でsuccessがtrueを返す', async () => {
      (auth as Mock).mockResolvedValue({ user: { id: 'user-1' } });
      (prisma.user.findFirst as Mock).mockResolvedValue({ id: 'user-1' });
      (prisma.context.findUnique as Mock).mockResolvedValue({ id: 1 });
      (prisma.tag.findMany as Mock).mockResolvedValue([{ name: 'tag1' }, { name: 'tag2' }]);
      (prisma.context.update as Mock).mockResolvedValue({ id: 1 });

      const formData = new FormData();
      formData.append('title', '更新タイトル');
      formData.append('tag', 'tag1 tag2');
      formData.append('context', '更新本文');
      formData.append('isPublic', 'true');

      const result = await updateBlogPost(1, undefined, formData);

      expect(result?.success).toBe(true);
      expect(result?.errors).toEqual({});
      expect(revalidatePath).toHaveBeenCalledWith('/blogs/1');
      expect(revalidatePath).toHaveBeenCalledWith('/blogs');
    });
  });

  describe('異常系のテスト', () => {
    it('ログインしていない場合、エラーを返す', async () => {
      (auth as Mock).mockResolvedValue(null);
      const formData = new FormData();

      const result = await updateBlogPost(1, undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.error).toBe('ログインが必要です。');
    });

    it('バリデーションエラー時にエラーとformDataを返す', async () => {
      (auth as Mock).mockResolvedValue({ user: { id: 'user-1' } });

      const formData = new FormData();

      const result = await updateBlogPost(1, undefined, formData);

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

    it('ブログが存在しない場合、エラーを返す', async () => {
      (auth as Mock).mockResolvedValue({ user: { id: 'user-1' } });
      (prisma.user.findFirst as Mock).mockResolvedValue({ id: 'user-1' });
      (prisma.context.findUnique as Mock).mockResolvedValue(null);

      const formData = new FormData();
      formData.append('title', '更新タイトル');
      formData.append('tag', 'tag1 tag2');
      formData.append('context', '更新本文');

      const result = await updateBlogPost(1, undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.error).toBe('ブログが見つかりません。');
      expect(result?.formData).toEqual({
        title: '更新タイトル',
        tag: 'tag1 tag2',
        context: '更新本文',
      });
    });

    it('空文字列のタグが空配列として扱われる', async () => {
      (auth as Mock).mockResolvedValue({ user: { id: 'user-1' } });

      const formData = new FormData();
      formData.append('title', '更新タイトル');
      formData.append('tag', '');
      formData.append('context', '更新本文');

      const result = await updateBlogPost(1, undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.tags).toBeTruthy();
    });

    it('複数空白のタグが正しく分割される', async () => {
      (auth as Mock).mockResolvedValue({ user: { id: 'user-1' } });
      (prisma.user.findFirst as Mock).mockResolvedValue({ id: 'user-1' });
      (prisma.context.findUnique as Mock).mockResolvedValue({ id: 1 });
      (prisma.tag.findMany as Mock).mockResolvedValue([
        { name: 'tag1' },
        { name: 'tag2' },
        { name: 'tag3' },
      ]);
      (prisma.context.update as Mock).mockResolvedValue({ id: 1 });

      const formData = new FormData();
      formData.append('title', '更新タイトル');
      formData.append('tag', 'tag1   tag2    tag3');
      formData.append('context', '更新本文');

      await updateBlogPost(1, undefined, formData);

      expect(prisma.context.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tags: expect.objectContaining({
              connect: [{ name: 'tag1' }, { name: 'tag2' }, { name: 'tag3' }],
            }),
          }),
        })
      );
    });
  });
});
