import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBlogPost } from '@/lib/actions/blogs/create';
import type { Mock } from 'vitest';
import { auth } from '@/auth';
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
    context: { create: vi.fn() },
  },
}));

describe('createBlogPost', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('正常系のテスト', () => {
    it('記事の投稿完了でsuccessがtrueを返す', async () => {
      (auth as Mock).mockResolvedValue({ user: { id: 'user-1' } });
      (prisma.user.findFirst as Mock).mockResolvedValue({ id: 'user-1' });
      (prisma.tag.findMany as Mock).mockResolvedValue([{ name: 'tag1' }, { name: 'tag2' }]);
      (prisma.context.create as Mock).mockResolvedValue({ id: 'context-1' });

      const formData = new FormData();
      formData.append('title', 'タイトル');
      formData.append('tag', 'tag1 tag2');
      formData.append('context', '本文');
      formData.append('isPublic', 'true');

      const result = await createBlogPost(undefined, formData);

      expect(result?.success).toBe(true);
      expect(prisma.context.create).toHaveBeenCalled();
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

    it('管理者権限がない場合、エラーを返す', async () => {
      (auth as Mock).mockResolvedValue({ user: { id: 'user-1' } });
      (prisma.user.findFirst as Mock).mockResolvedValue(null);

      const formData = new FormData();
      formData.append('title', 'タイトル');
      formData.append('tag', 'tag1 tag2');
      formData.append('context', '本文');

      const result = await createBlogPost(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.error).toBe('管理者権限がありません。');
      expect(result?.formData).toEqual({
        title: 'タイトル',
        tag: 'tag1 tag2',
        context: '本文',
      });
    });

    it('タグが存在しない場合、エラーを返す', async () => {
      (auth as Mock).mockResolvedValue({ user: { id: 'user-1' } });
      (prisma.user.findFirst as Mock).mockResolvedValue({ id: 'user-1' });
      (prisma.tag.findMany as Mock).mockResolvedValue([{ name: 'tag1' }]);

      const formData = new FormData();
      formData.append('title', 'タイトル');
      formData.append('tag', 'tag1 tag2');
      formData.append('context', '本文');

      const result = await createBlogPost(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.error).toBe('タグが存在しません。');
    });
  });
});
