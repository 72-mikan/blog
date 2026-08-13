import { describe, it, expect } from 'vitest';
import { createBlogSchema } from '@/validations/blogs/upsert';

describe('createBlogSchema', () => {
  describe('正常系のテスト', () => {
    it('妥当な値の場合、パースに成功する', () => {
      const result = createBlogSchema.safeParse({
        title: 'タイトル',
        context: '本文',
        tags: ['tag1'],
      });

      expect(result.success).toBe(true);
    });

    it('タイトルが境界値（100文字）の場合、パースに成功する', () => {
      const result = createBlogSchema.safeParse({
        title: 'a'.repeat(100),
        context: '本文',
        tags: ['tag1'],
      });

      expect(result.success).toBe(true);
    });

    it('タグが複数の場合、パースに成功する', () => {
      const result = createBlogSchema.safeParse({
        title: 'タイトル',
        context: '本文',
        tags: ['tag1', 'tag2', 'tag3'],
      });

      expect(result.success).toBe(true);
    });
  });

  describe('異常系のテスト', () => {
    it('タイトルが空文字の場合、必須エラーメッセージを返す', () => {
      const result = createBlogSchema.safeParse({
        title: '',
        context: '本文',
        tags: ['tag1'],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.title).toEqual(['タイトルは必須です。']);
      }
    });

    it('タイトルが境界値超（101文字）の場合、文字数エラーメッセージを返す', () => {
      const result = createBlogSchema.safeParse({
        title: 'a'.repeat(101),
        context: '本文',
        tags: ['tag1'],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.title).toEqual([
          'タイトルは100文字以内である必要があります。',
        ]);
      }
    });

    it('コンテキストが空文字の場合、必須エラーメッセージを返す', () => {
      const result = createBlogSchema.safeParse({
        title: 'タイトル',
        context: '',
        tags: ['tag1'],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.context).toEqual(['コンテキストは必須です。']);
      }
    });

    it('タグが空配列の場合、必須エラーメッセージを返す', () => {
      const result = createBlogSchema.safeParse({
        title: 'タイトル',
        context: '本文',
        tags: [],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.tags).toEqual([
          '少なくとも1つのタグを選択してください。',
        ]);
      }
    });
  });
});
