import { describe, it, expect } from 'vitest';
import { upsertTagSchema } from '@/validations/tags/upsert';

describe('upsertTagSchema', () => {
  describe('正常系のテスト', () => {
    it('妥当な値の場合、パースに成功する', () => {
      const result = upsertTagSchema.safeParse({ name: 'React' });

      expect(result.success).toBe(true);
    });

    it('タグ名が境界値（50文字）の場合、パースに成功する', () => {
      const result = upsertTagSchema.safeParse({ name: 'a'.repeat(50) });

      expect(result.success).toBe(true);
    });
  });

  describe('異常系のテスト', () => {
    it('タグ名が空文字の場合、必須エラーメッセージを返す', () => {
      const result = upsertTagSchema.safeParse({ name: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.name).toEqual(['タグ名を入力してください']);
      }
    });

    it('タグ名が境界値超（51文字）の場合、文字数エラーメッセージを返す', () => {
      const result = upsertTagSchema.safeParse({ name: 'a'.repeat(51) });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.name).toEqual([
          'タグ名は50文字以内である必要があります',
        ]);
      }
    });
  });
});
