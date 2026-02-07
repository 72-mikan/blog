import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateTag } from '@/lib/actions/tags/update';
import type { Mock } from 'vitest';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('updateTag', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  describe('正常系のテスト', () => {
    it('タグ更新成功時にsuccess: trueを返す', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ id: 1, name: 'Vue' }),
      }) as Mock;

      const result = await updateTag(1, 'Vue');

      expect(result?.success).toBe(true);
      expect(result?.errors).toEqual({});
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api/tags'),
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });
  });

  describe('異常系のテスト', () => {
    it('タグ名が空文字の場合、エラーを返す', async () => {
      const result = await updateTag(1, '');

      expect(result?.success).toBe(false);
      expect(result?.errors?.name).toBeTruthy();
    });

    it('タグ名が51文字以上の場合、エラーを返す', async () => {
      const result = await updateTag(1, 'a'.repeat(51));

      expect(result?.success).toBe(false);
      expect(result?.errors?.name).toBeTruthy();
    });

    it('API失敗時にエラーを返す', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ errors: { error: 'API エラー' } }),
      }) as Mock;

      const result = await updateTag(1, 'Vue');

      expect(result?.success).toBe(false);
      expect(result?.errors?.error).toBeTruthy();
    });

    it('fetch失敗時にエラーを返す', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as Mock;

      const result = await updateTag(1, 'Vue');

      expect(result?.success).toBe(false);
      expect(result?.errors?.error).toBeTruthy();
    });
  });
});
