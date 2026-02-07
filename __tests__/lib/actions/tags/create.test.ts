import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTag } from '@/lib/actions/tags/create';
import type { Mock } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

describe('createTag', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  describe('正常系のテスト', () => {
    it('タグ作成成功時にsuccess: trueを返す', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ id: 1, name: 'React' }),
      }) as Mock;

      const formData = new FormData();
      formData.append('name', 'React');

      const result = await createTag(undefined, formData);

      expect(result?.success).toBe(true);
      expect(result?.errors).toEqual({});
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('異常系のテスト', () => {
    it('タグ名が空文字の場合、エラーを返す', async () => {
      const formData = new FormData();
      formData.append('name', '');

      const result = await createTag(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.name).toBeTruthy();
    });

    it('タグ名が51文字以上の場合、エラーを返す', async () => {
      const formData = new FormData();
      formData.append('name', 'a'.repeat(51));

      const result = await createTag(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.name).toBeTruthy();
    });

    it('API失敗時にエラーを返す', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ errors: { error: 'API エラー' } }),
      }) as Mock;

      const formData = new FormData();
      formData.append('name', 'React');

      const result = await createTag(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.error).toBeTruthy();
    });

    it('fetch失敗時にエラーを返す', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as Mock;

      const formData = new FormData();
      formData.append('name', 'React');

      const result = await createTag(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.error).toBeTruthy();
    });
  });
});
