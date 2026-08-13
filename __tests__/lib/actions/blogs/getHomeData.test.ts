import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getHomeData } from '@/lib/actions/blogs/getHomeData';
import type { Mock } from 'vitest';

describe('getHomeData', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('正常系のテスト', () => {
    it('取得したブログ・タグを整形して返す', async () => {
      const now = new Date();
      const recentDate = new Date(now);
      recentDate.setDate(recentDate.getDate() - 1);
      const oldDate = new Date(now);
      oldDate.setDate(oldDate.getDate() - 40);

      const blogs = [
        ...Array.from({ length: 9 }, (_, i) => ({
          id: i + 1,
          title: `タイトル${i + 1}`,
          context: '本文',
          createdAt: recentDate.toISOString(),
          user: { name: 'ユーザー' },
          tags: [],
        })),
        {
          id: 100,
          title: '古い記事',
          context: '本文',
          createdAt: oldDate.toISOString(),
          user: { name: 'ユーザー' },
          tags: [],
        },
      ];
      const tags = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `タグ${i + 1}` }));

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/api/blogs')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(blogs) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve(tags) });
      });

      const result = await getHomeData();

      expect(result.latestBlogs).toHaveLength(8);
      expect(result.tags).toHaveLength(10);
      expect(result.recentCount).toBe(9);
    });
  });

  describe('異常系のテスト', () => {
    it('URL未設定の場合、空データを返す', async () => {
      vi.stubEnv('URL', '');

      const result = await getHomeData();

      expect(result).toEqual({ latestBlogs: [], tags: [], recentCount: 0 });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('APIレスポンスが失敗の場合、空データを返す', async () => {
      (global.fetch as Mock).mockResolvedValue({ ok: false });

      const result = await getHomeData();

      expect(result).toEqual({ latestBlogs: [], tags: [], recentCount: 0 });
    });

    it('fetchが例外を投げた場合、空データを返す', async () => {
      (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

      const result = await getHomeData();

      expect(result).toEqual({ latestBlogs: [], tags: [], recentCount: 0 });
      expect(console.error).toHaveBeenCalled();
    });
  });
});
