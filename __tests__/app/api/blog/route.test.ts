import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/blog/route';
import { prisma } from '@/lib/prisma';
import dotenv from "dotenv";

dotenv.config();


vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findFirst: vi.fn() },
    tag: { findMany: vi.fn() },
    context: { create: vi.fn() },
  },
}));

describe('POST /api/blog', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('正常系のテスト', () => {
    it('正常なリクエスト時にステータス200と成功メッセージを返す', async () => {
      (prisma.user.findFirst as any).mockResolvedValue({ id: 'user-1' });
      (prisma.tag.findMany as any).mockResolvedValue([{ name: 'tag1' }, { name: 'tag2' }]);
      (prisma.context.create as any).mockResolvedValue({ id: 'context-1' });

      const request = new Request(`${process.env.URL}/api/blog`, {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          title: 'タイトル',
          tags: ['tag1', 'tag2'],
          context: '本文',
          isPublic: true,
        }),
      });

      const response = await POST(request);
      const text = await response.text();

      expect(response.status).toBe(200);
      expect(text).toBe('投稿が成功しました。');
      expect(prisma.context.create).toHaveBeenCalled();
    });
  });

  describe('異常系のテスト', () => {
    it('userIdがない場合は400を返す', async () => {
      const request = new Request(`${process.env.URL}/api/blog`, {
        method: 'POST',
        body: JSON.stringify({
          userId: '',
          title: 'タイトル',
          tags: ['tag1'],
          context: '本文',
          isPublic: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors.error).toBe('ユーザーIDが必要です。');
    });

    it('管理者でない場合は403を返す', async () => {
      (prisma.user.findFirst as any).mockResolvedValue(null);

      const request = new Request(`${process.env.URL}/api/blog`, {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          title: 'タイトル',
          tags: ['tag1'],
          context: '本文',
          isPublic: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.errors.error).toBe('管理者権限がありません。');
    });

    it('タグが存在しない場合は400を返す', async () => {
      (prisma.user.findFirst as any).mockResolvedValue({ id: 'user-1' });
      (prisma.tag.findMany as any).mockResolvedValue([{ name: 'tag1' }]);

      const request = new Request(`${process.env.URL}/api/blog`, {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          title: 'タイトル',
          tags: ['tag1', 'tag2'],
          context: '本文',
          isPublic: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors.error).toBe('タグが存在しません。');
    });
  });
});