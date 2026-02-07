import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTags } from '@/lib/actions/tags/getTags';
import type { Mock } from 'vitest';

describe('getTags', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  describe('正常系のテスト', () => {
    it('タグ一覧取得成功時にタグ配列を返す', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([
          { id: 1, name: 'React', _count: { contexts: 2 } },
          { id: 2, name: 'TypeScript', _count: { contexts: 1 } },
        ]),
      }) as Mock;

      const result = await getTags();

      expect(result).toEqual([
        { id: 1, name: 'React', _count: { contexts: 2 } },
        { id: 2, name: 'TypeScript', _count: { contexts: 1 } },
      ]);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api/tags'),
        expect.objectContaining({
          cache: 'no-store',
        })
      );
    });
  });

  describe('異常系のテスト', () => {
    it('API失敗時に空配列を返す', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      }) as Mock;

      const result = await getTags();

      expect(result).toEqual([]);
    });

    it('fetch失敗時に空配列を返す', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as Mock;

      const result = await getTags();

      expect(result).toEqual([]);
    });
  });
});
