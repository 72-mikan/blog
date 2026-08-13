import { describe, it, expect } from 'vitest';
import { signUpSchema } from '@/validations/signUp';

describe('signUpSchema', () => {
  describe('正常系のテスト', () => {
    it('妥当な値の場合、パースに成功する', () => {
      const result = signUpSchema.safeParse({
        name: 'テストユーザー',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
    });

    it('名前が境界値（30文字）の場合、パースに成功する', () => {
      const result = signUpSchema.safeParse({
        name: 'あ'.repeat(30),
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
    });

    it('パスワードが境界値（6文字）の場合、パースに成功する', () => {
      const result = signUpSchema.safeParse({
        name: 'テストユーザー',
        email: 'test@example.com',
        password: '123456',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('異常系のテスト', () => {
    it('名前が空文字の場合、必須エラーメッセージを返す', () => {
      const result = signUpSchema.safeParse({
        name: '',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.name).toEqual(['名前は必須です。']);
      }
    });

    it('名前が境界値超（31文字）の場合、文字数エラーメッセージを返す', () => {
      const result = signUpSchema.safeParse({
        name: 'あ'.repeat(31),
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.name).toEqual([
          '名前は30文字以内である必要があります。',
        ]);
      }
    });

    it('メールアドレスが空文字の場合、必須エラーメッセージを返す', () => {
      const result = signUpSchema.safeParse({
        name: 'テストユーザー',
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
      const result = signUpSchema.safeParse({
        name: 'テストユーザー',
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
      const result = signUpSchema.safeParse({
        name: 'テストユーザー',
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
      const result = signUpSchema.safeParse({
        name: 'テストユーザー',
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
