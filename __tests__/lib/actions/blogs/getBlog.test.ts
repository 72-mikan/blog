import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBlog } from '@/lib/actions/blogs/getBlog';
import type { Mock } from 'vitest';
import { prisma } from '@/lib/prisma';

vi.mock('next/cache', () => ({
  unstable_cache: (fn: unknown) => fn,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    context: { findUnique: vi.fn() },
  },
}));

describe('getBlog', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('正常系のテスト', () => {
    it('該当する記事がある場合、日時をISO文字列に変換して返す', async () => {
      (prisma.context.findUnique as Mock).mockResolvedValue({
        id: 1,
        title: 'タイトル',
        context: '本文',
        isPublic: true,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
        user: { id: 'user-1', name: 'ユーザー' },
        tags: [{ name: 'tag1' }],
      });

      const result = await getBlog(1);

      expect(result).toEqual({
        id: 1,
        title: 'タイトル',
        context: '本文',
        isPublic: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        user: { id: 'user-1', name: 'ユーザー' },
        tags: [{ name: 'tag1' }],
      });
      expect(prisma.context.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } })
      );
    });
  });

  describe('異常系のテスト', () => {
    it('該当する記事がない場合、nullを返す', async () => {
      (prisma.context.findUnique as Mock).mockResolvedValue(null);

      const result = await getBlog(999);

      expect(result).toBeNull();
    });
  });
});
