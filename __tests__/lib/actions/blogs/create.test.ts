import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBlogPost } from '@/lib/actions/blogs/create';
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
      expect(result?.errors).toEqual({});
      expect(prisma.context.create).toHaveBeenCalledWith({
        data: {
          title: 'タイトル',
          context: '本文',
          isPublic: true,
          user: { connect: { id: 'user-1' } },
          tags: { connect: [{ name: 'tag1' }, { name: 'tag2' }] },
        },
      });
    });

    it('記事投稿成功時にキャッシュを再検証する', async () => {
      (auth as Mock).mockResolvedValue({ user: { id: 'user-1' } });
      (prisma.user.findFirst as Mock).mockResolvedValue({ id: 'user-1' });
      (prisma.tag.findMany as Mock).mockResolvedValue([{ name: 'tag1' }, { name: 'tag2' }]);
      (prisma.context.create as Mock).mockResolvedValue({ id: 'context-1' });

      const formData = new FormData();
      formData.append('title', 'タイトル');
      formData.append('tag', 'tag1 tag2');
      formData.append('context', '本文');
      formData.append('isPublic', 'true');

      await createBlogPost(undefined, formData);

      expect(revalidatePath).toHaveBeenCalledWith('/blogs');
      expect(revalidatePath).toHaveBeenCalledWith('/');
    });
  });

  describe('異常系のテスト', () => {
    it('ログインしていない場合、エラーを返す', async () => {
      (auth as Mock).mockResolvedValue(null);
      const formData = new FormData();

      const result = await createBlogPost(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.error).toBe('ログインが必要です。');
    });

    it('バリデーションエラー時にエラーとformDataを返す', async () => {
      (auth as Mock).mockResolvedValue({ user: { id: 'user-1' } });

      // formData自体を空にすると title/context が null になり
      // Zodの型エラー("Expected string, received null")が返ってしまい、
      // 意図したカスタムメッセージ（必須エラー）を検証できないため、空文字で送信する
      const formData = new FormData();
      formData.append('title', '');
      formData.append('tag', '');
      formData.append('context', '');

      const result = await createBlogPost(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.title).toEqual(['タイトルは必須です。']);
      expect(result?.errors?.context).toEqual(['コンテキストは必須です。']);
      expect(result?.errors?.tags).toEqual(['少なくとも1つのタグを選択してください。']);
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
      expect(result?.formData).toEqual({
        title: 'タイトル',
        tag: 'tag1 tag2',
        context: '本文',
      });
    });

    it('空文字列のタグが空配列として扱われる', async () => {
      (auth as Mock).mockResolvedValue({ user: { id: 'user-1' } });

      const formData = new FormData();
      formData.append('title', 'タイトル');
      formData.append('tag', '');
      formData.append('context', '本文');

      const result = await createBlogPost(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.tags).toEqual(['少なくとも1つのタグを選択してください。']);
    });

    it('複数空白のタグが正しく分割される', async () => {
      (auth as Mock).mockResolvedValue({ user: { id: 'user-1' } });
      (prisma.user.findFirst as Mock).mockResolvedValue({ id: 'user-1' });
      (prisma.tag.findMany as Mock).mockResolvedValue([
        { name: 'tag1' },
        { name: 'tag2' },
        { name: 'tag3' },
      ]);
      (prisma.context.create as Mock).mockResolvedValue({ id: 'context-1' });

      const formData = new FormData();
      formData.append('title', 'タイトル');
      formData.append('tag', 'tag1   tag2    tag3');
      formData.append('context', '本文');

      await createBlogPost(undefined, formData);

      expect(prisma.context.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tags: expect.objectContaining({
              connect: [{ name: 'tag1' }, { name: 'tag2' }, { name: 'tag3' }],
            }),
          }),
        })
      );
    });

    it('想定外のエラーが発生した場合、汎用エラーメッセージを返す', async () => {
      (auth as Mock).mockResolvedValue({ user: { id: 'user-1' } });
      (prisma.user.findFirst as Mock).mockResolvedValue({ id: 'user-1' });
      (prisma.tag.findMany as Mock).mockResolvedValue([{ name: 'tag1' }, { name: 'tag2' }]);
      (prisma.context.create as Mock).mockRejectedValue(new Error('DB接続エラー'));

      const formData = new FormData();
      formData.append('title', 'タイトル');
      formData.append('tag', 'tag1 tag2');
      formData.append('context', '本文');

      const result = await createBlogPost(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.error).toBe('エラーが発生しました。');
    });
  });
});
