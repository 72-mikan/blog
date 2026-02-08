import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PUT } from '@/app/api/blogs/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import type { Mock } from 'vitest';
import dotenv from "dotenv";

dotenv.config();

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findFirst: vi.fn() },
    tag: { findMany: vi.fn() },
    context: { 
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('GET /api/blogs', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('正常系のテスト', () => {
    it('管理者の場合、全ての記事を取得できる', async () => {
      (auth as Mock).mockResolvedValue({ user: { role: 'ADMIN' } });
      
      const mockBlogs = [
        {
          id: 1,
          title: '公開記事',
          context: '本文1',
          isPublic: true,
          createdAt: new Date('2024-01-01'),
          user: { name: 'ユーザー1' },
          tags: [{ name: 'tag1' }],
        },
        {
          id: 2,
          title: '非公開記事',
          context: '本文2',
          isPublic: false,
          createdAt: new Date('2024-01-02'),
          user: { name: 'ユーザー1' },
          tags: [{ name: 'tag2' }],
        },
      ];

      (prisma.context.findMany as any).mockResolvedValue(mockBlogs);

      const request = new Request(`${process.env.URL}/api/blogs`, {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].title).toBe('公開記事');
      expect(data[1].title).toBe('非公開記事');
      expect(prisma.context.findMany).toHaveBeenCalledWith({
        where: {},
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('一般ユーザーの場合、公開記事のみ取得できる', async () => {
      (auth as Mock).mockResolvedValue({ user: { role: 'USER' } });
      
      const mockBlogs = [
        {
          id: 1,
          title: '公開記事',
          context: '本文1',
          isPublic: true,
          createdAt: new Date('2024-01-01'),
          user: { name: 'ユーザー1' },
          tags: [{ name: 'tag1' }],
        },
      ];

      (prisma.context.findMany as any).mockResolvedValue(mockBlogs);

      const request = new Request(`${process.env.URL}/api/blogs`, {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].isPublic).toBe(true);
      expect(prisma.context.findMany).toHaveBeenCalledWith({
        where: { isPublic: true },
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('未ログインユーザーの場合、公開記事のみ取得できる', async () => {
      (auth as Mock).mockResolvedValue(null);
      
      const mockBlogs = [
        {
          id: 1,
          title: '公開記事',
          context: '本文1',
          isPublic: true,
          createdAt: new Date('2024-01-01'),
          user: { name: 'ユーザー1' },
          tags: [{ name: 'tag1' }],
        },
      ];

      (prisma.context.findMany as any).mockResolvedValue(mockBlogs);

      const request = new Request(`${process.env.URL}/api/blogs`, {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(prisma.context.findMany).toHaveBeenCalledWith({
        where: { isPublic: true },
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('記事が0件の場合、空配列を返す', async () => {
      (auth as Mock).mockResolvedValue(null);
      (prisma.context.findMany as any).mockResolvedValue([]);

      const request = new Request(`${process.env.URL}/api/blogs`, {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });
  });

  describe('異常系のテスト', () => {
    it('データベースエラー時に500を返す', async () => {
      (auth as Mock).mockResolvedValue(null);
      (prisma.context.findMany as any).mockRejectedValue(new Error('DB Error'));

      const request = new Request(`${process.env.URL}/api/blogs`, {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.errors.error).toBe('サーバーエラーが発生しました。');
    });
  });
});

describe('POST /api/blogs', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('正常系のテスト', () => {
    it('正常なリクエスト時にステータス200と成功メッセージを返す', async () => {
      (prisma.user.findFirst as any).mockResolvedValue({ id: 'user-1' });
      (prisma.tag.findMany as any).mockResolvedValue([{ name: 'tag1' }, { name: 'tag2' }]);
      (prisma.context.create as any).mockResolvedValue({ id: 'context-1' });

      const request = new Request(`${process.env.URL}/api/blogs`, {
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
      const request = new Request(`${process.env.URL}/api/blogs`, {
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

      const request = new Request(`${process.env.URL}/api/blogs`, {
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

      const request = new Request(`${process.env.URL}/api/blogs`, {
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
describe('PUT /api/blogs', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('正常系のテスト', () => {
    it('正常なリクエスト時にステータス200と成功メッセージを返す', async () => {
      (prisma.user.findFirst as any).mockResolvedValue({ id: 'user-1' });
      (prisma.context.findUnique as any).mockResolvedValue({ id: 1, title: 'old' });
      (prisma.tag.findMany as any).mockResolvedValue([{ name: 'tag1' }, { name: 'tag2' }]);
      (prisma.context.update as any).mockResolvedValue({ id: 1 });

      const request = new Request(`${process.env.URL}/api/blogs`, {
        method: 'PUT',
        body: JSON.stringify({
          id: 1,
          userId: 'user-1',
          title: '更新タイトル',
          tags: ['tag1', 'tag2'],
          context: '更新本文',
          isPublic: true,
        }),
      });

      const response = await PUT(request);
      const text = await response.text();

      expect(response.status).toBe(200);
      expect(text).toBe('ブログが更新されました。');
      expect(prisma.context.update).toHaveBeenCalled();
    });
  });

  describe('異常系のテスト', () => {
    it('idがない場合は400を返す', async () => {
      const request = new Request(`${process.env.URL}/api/blogs`, {
        method: 'PUT',
        body: JSON.stringify({
          userId: 'user-1',
          title: '更新タイトル',
          tags: ['tag1'],
          context: '更新本文',
          isPublic: true,
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors.error).toBe('ブログIDが必要です。');
    });

    it('userIdがない場合は400を返す', async () => {
      const request = new Request(`${process.env.URL}/api/blogs`, {
        method: 'PUT',
        body: JSON.stringify({
          id: 1,
          userId: '',
          title: '更新タイトル',
          tags: ['tag1'],
          context: '更新本文',
          isPublic: true,
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors.error).toBe('ユーザーIDが必要です。');
    });

    it('管理者でない場合は403を返す', async () => {
      (prisma.user.findFirst as any).mockResolvedValue(null);

      const request = new Request(`${process.env.URL}/api/blogs`, {
        method: 'PUT',
        body: JSON.stringify({
          id: 1,
          userId: 'user-1',
          title: '更新タイトル',
          tags: ['tag1'],
          context: '更新本文',
          isPublic: true,
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.errors.error).toBe('管理者権限がありません。');
    });

    it('ブログが存在しない場合は400を返す', async () => {
      (prisma.user.findFirst as any).mockResolvedValue({ id: 'user-1' });
      (prisma.context.findUnique as any).mockResolvedValue(null);

      const request = new Request(`${process.env.URL}/api/blogs`, {
        method: 'PUT',
        body: JSON.stringify({
          id: 999,
          userId: 'user-1',
          title: '更新タイトル',
          tags: ['tag1'],
          context: '更新本文',
          isPublic: true,
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors.error).toBe('ブログが見つかりません。');
    });

    it('タグが存在しない場合は400を返す', async () => {
      (prisma.user.findFirst as any).mockResolvedValue({ id: 'user-1' });
      (prisma.context.findUnique as any).mockResolvedValue({ id: 1 });
      (prisma.tag.findMany as any).mockResolvedValue([{ name: 'tag1' }]);

      const request = new Request(`${process.env.URL}/api/blogs`, {
        method: 'PUT',
        body: JSON.stringify({
          id: 1,
          userId: 'user-1',
          title: '更新タイトル',
          tags: ['tag1', 'tag2'],
          context: '更新本文',
          isPublic: true,
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors.error).toBe('タグが存在しません。');
    });
  });
});