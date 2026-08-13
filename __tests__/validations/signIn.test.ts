import { describe, it, expect } from 'vitest';
import { signInSchema } from '@/validations/signIn';

describe('signInSchema', () => {
  describe('正常系のテスト', () => {
    it('妥当な値の場合、パースに成功する', () => {
      const result = signInSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
    });

    it('パスワードが境界値（6文字）の場合、パースに成功する', () => {
      const result = signInSchema.safeParse({
        email: 'test@example.com',
        password: '123456',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('異常系のテスト', () => {
    it('メールアドレスが空文字の場合、必須エラーメッセージを返す', () => {
      const result = signInSchema.safeParse({
        email: '',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toEqual([
          'メールアドレスは必須です。',
          '有効なメールアドレスを入力してください。',
        ]);
      }
    });

    it('メールアドレスの形式が不正な場合、フォーマットエラーメッセージを返す', () => {
      const result = signInSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toEqual([
          '有効なメールアドレスを入力してください。',
        ]);
      }
    });

    it('パスワードが空文字の場合、文字数エラーメッセージを返す', () => {
      const result = signInSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toEqual([
          'パスワードは6文字以上である必要があります。',
        ]);
      }
    });

    it('パスワードが境界値未満（5文字）の場合、文字数エラーメッセージを返す', () => {
      const result = signInSchema.safeParse({
        email: 'test@example.com',
        password: '12345',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toEqual([
          'パスワードは6文字以上である必要があります。',
        ]);
      }
    });
  });
});
