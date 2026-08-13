import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBlogs, PAGE_SIZE } from '@/lib/actions/blogs/getBlogs';
import type { Mock } from 'vitest';
import { prisma } from '@/lib/prisma';

vi.mock('next/cache', () => ({
  unstable_cache: (fn: unknown) => fn,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    context: { findMany: vi.fn(), count: vi.fn() },
  },
}));

describe('getBlogs', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (prisma.context.findMany as Mock).mockResolvedValue([]);
    (prisma.context.count as Mock).mockResolvedValue(0);
  });

  describe('正常系のテスト', () => {
    it('管理者の場合、非公開記事も含めて全件取得する', async () => {
      await getBlogs({ isAdmin: true, page: 1 });

      expect(prisma.context.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} })
      );
      expect(prisma.context.count).toHaveBeenCalledWith({ where: {} });
    });

    it('非管理者の場合、公開記事のみ取得する', async () => {
      await getBlogs({ isAdmin: false, page: 1 });

      expect(prisma.context.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isPublic: true } })
      );
      expect(prisma.context.count).toHaveBeenCalledWith({ where: { isPublic: true } });
    });

    it('ページ番号に応じてskipを計算する', async () => {
      await getBlogs({ isAdmin: true, page: 3 });

      expect(prisma.context.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: PAGE_SIZE, skip: (3 - 1) * PAGE_SIZE })
      );
    });

    it('取得した記事のcreatedAtをISO文字列に変換して返す', async () => {
      (prisma.context.findMany as Mock).mockResolvedValue([
        {
          id: 1,
          title: 'タイトル',
          context: '本文',
          isPublic: true,
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          user: { name: 'ユーザー' },
          tags: [{ name: 'tag1', imagePath: null }],
        },
      ]);
      (prisma.context.count as Mock).mockResolvedValue(1);

      const result = await getBlogs({ isAdmin: true, page: 1 });

      expect(result.blogs).toEqual([
        {
          id: 1,
          title: 'タイトル',
          context: '本文',
          isPublic: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          user: { name: 'ユーザー' },
          tags: [{ name: 'tag1', imagePath: null }],
        },
      ]);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('異常系のテスト', () => {
    it('該当する記事が0件の場合、空配列とtotal 0を返す', async () => {
      const result = await getBlogs({ isAdmin: true, page: 1 });

      expect(result).toEqual({ blogs: [], total: 0, totalPages: 0 });
    });
  });
});
