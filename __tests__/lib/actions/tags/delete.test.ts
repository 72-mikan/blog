import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteTag } from '@/lib/actions/tags/delete';
import type { Mock } from 'vitest';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('deleteTag', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  describe('正常系のテスト', () => {
    it('タグ削除成功時にsuccess: trueを返す', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ message: 'タグを削除しました' }),
      }) as Mock;

      const result = await deleteTag(1);

      expect(result?.success).toBe(true);
      expect(result?.errors).toEqual({});
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('id=1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('異常系のテスト', () => {
    it('API失敗時にエラーを返す', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ errors: { error: 'API エラー' } }),
      }) as Mock;

      const result = await deleteTag(1);

      expect(result?.success).toBe(false);
      expect(result?.errors?.error).toBeTruthy();
    });

    it('fetch失敗時にエラーを返す', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as Mock;

      const result = await deleteTag(1);

      expect(result?.success).toBe(false);
      expect(result?.errors?.error).toBeTruthy();
    });
  });
});
