import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PUT, DELETE } from '@/app/api/tags/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import dotenv from "dotenv";

dotenv.config();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    tag: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

describe('/api/tags route handlers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('GET', () => {
    it('GET実行時にfindManyが呼ばれてタグ一覧を返す', async () => {
      (prisma.tag.findMany as any).mockResolvedValue([
        { id: 1, name: 'React', _count: { contexts: 2 } },
      ]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([{ id: 1, name: 'React', _count: { contexts: 2 } }]);
      expect(prisma.tag.findMany).toHaveBeenCalled();
    });

    it('取得に失敗した場合は500を返す', async () => {
      (prisma.tag.findMany as any).mockRejectedValue(new Error('DB error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.errors.error).toBe('タグの取得に失敗しました');
    });
  });

  describe('POST', () => {
    it('認証されていない場合は401を返す', async () => {
      (auth as any).mockResolvedValue(null);

      const request = new Request(`${process.env.URL}/api/tags`, {
        method: 'POST',
        body: JSON.stringify({ name: 'React' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.errors.error).toBe('認証が必要です');
    });

    it('タグ名が空の場合は400を返す', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'user-1' } });

      const request = new Request(`${process.env.URL}/api/tags`, {
        method: 'POST',
        body: JSON.stringify({ name: '' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors.error).toBe('タグ名を入力してください');
    });

    it('重複タグ名は400を返す', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'user-1' } });
      (prisma.tag.create as any).mockRejectedValue(
        new PrismaClientKnownRequestError('duplicate', {
          code: 'P2002',
          clientVersion: '0.0.0',
          meta: {},
        })
      );

      const request = new Request(`${process.env.URL}/api/tags`, {
        method: 'POST',
        body: JSON.stringify({ name: 'React' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors.error).toBe('このタグ名は既に存在します');
    });

    it('POST実行時にcreateが呼ばれて201を返す', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'user-1' } });
      (prisma.tag.create as any).mockResolvedValue({ id: 1, name: 'React' });

      const request = new Request(`${process.env.URL}/api/tags`, {
        method: 'POST',
        body: JSON.stringify({ name: 'React' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual({ id: 1, name: 'React' });
      expect(prisma.tag.create).toHaveBeenCalled();
    });
  });

  describe('PUT', () => {
    it('認証されていない場合は401を返す', async () => {
      (auth as any).mockResolvedValue(null);

      const request = new Request(`${process.env.URL}/api/tags`, {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: 'Vue' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.errors.error).toBe('認証が必要です');
    });

    it('タグIDがない場合は400を返す', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'user-1' } });

      const request = new Request(`${process.env.URL}/api/tags`, {
        method: 'PUT',
        body: JSON.stringify({ name: 'Vue' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors.error).toBe('タグIDが必要です');
    });

    it('タグ名が空の場合は400を返す', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'user-1' } });

      const request = new Request(`${process.env.URL}/api/tags`, {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: '' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors.error).toBe('タグ名を入力してください');
    });

    it('重複タグ名は400を返す', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'user-1' } });
      (prisma.tag.update as any).mockRejectedValue(
        new PrismaClientKnownRequestError('duplicate', {
          code: 'P2002',
          clientVersion: '0.0.0',
          meta: {},
        })
      );

      const request = new Request(`${process.env.URL}/api/tags`, {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: 'Vue' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors.error).toBe('このタグ名は既に存在します');
    });

    it('PUT実行時にupdateが呼ばれて200を返す', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'user-1' } });
      (prisma.tag.update as any).mockResolvedValue({ id: 1, name: 'Vue' });

      const request = new Request(`${process.env.URL}/api/tags`, {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: 'Vue' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ id: 1, name: 'Vue' });
      expect(prisma.tag.update).toHaveBeenCalled();
    });
  });

  describe('DELETE', () => {
    it('認証されていない場合は401を返す', async () => {
      (auth as any).mockResolvedValue(null);

      const request = new Request(`${process.env.URL}/api/tags?id=1`, {
        method: 'DELETE',
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.errors.error).toBe('認証が必要です');
    });

    it('タグIDがない場合は400を返す', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'user-1' } });

      const request = new Request(`${process.env.URL}/api/tags`, {
        method: 'DELETE',
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors.error).toBe('タグIDが必要です');
    });

    it('DELETE実行時にdeleteが呼ばれて200を返す', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'user-1' } });
      (prisma.tag.delete as any).mockResolvedValue({ id: 1 });

      const request = new Request(`${process.env.URL}/api/tags?id=1`, {
        method: 'DELETE',
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('タグを削除しました');
      expect(prisma.tag.delete).toHaveBeenCalled();
    });

    it('削除に失敗した場合は500を返す', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'user-1' } });
      (prisma.tag.delete as any).mockRejectedValue(new Error('DB error'));

      const request = new Request(`${process.env.URL}/api/tags?id=1`, {
        method: 'DELETE',
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.errors.error).toBe('タグの削除に失敗しました');
    });
  });
});
