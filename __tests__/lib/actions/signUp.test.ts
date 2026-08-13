import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitSignUpForm } from '@/lib/actions/signUp';
import { signIn } from '@/auth';
import { CredentialsSignin } from 'next-auth';
import type { Mock } from 'vitest';

vi.mock('@/auth', () => ({
  signIn: vi.fn(),
}));

describe('submitSignUpForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  describe('正常系のテスト', () => {
    it('サインアップ成功時にAPIを呼び出したうえでsignInを呼び出す', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn(),
      }) as Mock;
      (signIn as Mock).mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append('name', 'テスト太郎');
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      await submitSignUpForm(undefined, formData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/signUp',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            name: 'テスト太郎',
            email: 'test@example.com',
            password: 'password123',
          }),
        }),
      );
      expect(signIn).toHaveBeenCalledWith('credentials', formData);
    });
  });

  describe('異常系のテスト', () => {
    it('名前が空の場合、エラーを返す', async () => {
      const formData = new FormData();
      formData.append('name', '');
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      const result = await submitSignUpForm(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.name).toBeTruthy();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('名前が31文字以上の場合、エラーを返す', async () => {
      const formData = new FormData();
      formData.append('name', 'a'.repeat(31));
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      const result = await submitSignUpForm(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.name).toBeTruthy();
    });

    it('メールアドレスの形式が不正な場合、エラーを返す', async () => {
      const formData = new FormData();
      formData.append('name', 'テスト太郎');
      formData.append('email', 'invalid-email');
      formData.append('password', 'password123');

      const result = await submitSignUpForm(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.email).toBeTruthy();
    });

    it('パスワードが6文字未満の場合、エラーを返す', async () => {
      const formData = new FormData();
      formData.append('name', 'テスト太郎');
      formData.append('email', 'test@example.com');
      formData.append('password', '12345');

      const result = await submitSignUpForm(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.password).toBeTruthy();
    });

    it('メールアドレスが既に使用されている場合、専用のエラーを返す', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ error_type: 'EXIST_CHECK_FAILED' }),
      }) as Mock;

      const formData = new FormData();
      formData.append('name', 'テスト太郎');
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      const result = await submitSignUpForm(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.email).toBe('このメールアドレスは既に使用されています。');
      expect(signIn).not.toHaveBeenCalled();
    });

    it('API呼び出しが未知のエラーの場合、汎用エラーメッセージを返す', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ error_type: 'UNKNOWN' }),
      }) as Mock;

      const formData = new FormData();
      formData.append('name', 'テスト太郎');
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      const result = await submitSignUpForm(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.commom).toBe('サーバーエラーが発生しました。時間をおいて再試行してください。');
    });

    it('fetch自体が失敗した場合、AuthError以外は再スローされる', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as Mock;

      const formData = new FormData();
      formData.append('name', 'テスト太郎');
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      await expect(submitSignUpForm(undefined, formData)).rejects.toThrow('Network error');
    });

    it('signIn呼び出しで認証エラーが発生した場合、エラーメッセージを返す', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn(),
      }) as Mock;
      (signIn as Mock).mockRejectedValue(
        new CredentialsSignin('メールアドレスまたはパスワードが間違っています。'),
      );

      const formData = new FormData();
      formData.append('name', 'テスト太郎');
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      const result = await submitSignUpForm(undefined, formData);

      expect(result?.success).toBe(false);
      expect(result?.errors?.commom).toContain('メールアドレスまたはパスワードが間違っています。');
    });
  });
});
