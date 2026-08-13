import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitSignInForm } from '@/lib/actions/signIn';
import { signIn } from '@/auth';
import { CredentialsSignin } from 'next-auth';
import type { Mock } from 'vitest';

vi.mock('@/auth', () => ({
  signIn: vi.fn(),
}));

describe('submitSignInForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('正常系のテスト', () => {
    it('認証成功時はリダイレクトエラーを再スローする', async () => {
      const redirectError = Object.assign(new Error('NEXT_REDIRECT'), {
        digest: 'NEXT_REDIRECT;push;/;307;',
      });
      (signIn as Mock).mockRejectedValue(redirectError);

      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      await expect(submitSignInForm(undefined, formData)).rejects.toBe(redirectError);
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirectTo: '/',
      });
    });
  });

  describe('異常系のテスト', () => {
    it('メールアドレスが空の場合、エラーを返す', async () => {
      const formData = new FormData();
      formData.append('email', '');
      formData.append('password', 'password123');

      const result = await submitSignInForm(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.email).toBeTruthy();
      expect(signIn).not.toHaveBeenCalled();
    });

    it('メールアドレスの形式が不正な場合、エラーを返す', async () => {
      const formData = new FormData();
      formData.append('email', 'invalid-email');
      formData.append('password', 'password123');

      const result = await submitSignInForm(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.email).toBeTruthy();
    });

    it('パスワードが6文字未満の場合、エラーを返す', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', '12345');

      const result = await submitSignInForm(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.password).toBeTruthy();
    });

    it('バリデーションエラー時に入力したメールアドレスを保持する', async () => {
      const formData = new FormData();
      formData.append('email', 'invalid-email');
      formData.append('password', '12345');

      const result = await submitSignInForm(undefined, formData);

      expect(result?.values).toEqual({ email: 'invalid-email' });
    });

    it('メールアドレスまたはパスワードが誤っている場合、エラーメッセージを返す', async () => {
      (signIn as Mock).mockRejectedValue(
        new CredentialsSignin('メールアドレスまたはパスワードが間違っています。'),
      );

      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      const result = await submitSignInForm(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.commom).toContain('メールアドレスまたはパスワードが間違っています。');
    });

    it('AuthError以外の予期しないエラーは再スローされる', async () => {
      (signIn as Mock).mockRejectedValue(new Error('unexpected error'));

      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      await expect(submitSignInForm(undefined, formData)).rejects.toThrow('unexpected error');
    });
  });
});
