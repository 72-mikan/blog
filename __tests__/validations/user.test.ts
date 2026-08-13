import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { existCheck, checkEmailPassword, hashPassword } from '@/validations/user';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// user.ts はZodスキーマではなく、DB(Prisma)・bcryptに依存する認証関連の関数群のため、
// 他のバリデーションスキーマと異なりモックを用いてテストする。
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    genSaltSync: vi.fn(() => 'salt'),
    hashSync: vi.fn(() => 'hashed-password'),
    compareSync: vi.fn(),
  },
}));

describe('existCheck', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('正常系のテスト', () => {
    it('未登録のメールアドレスの場合、登録可能を返す', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue(null);

      const result = await existCheck('new@example.com');

      expect(result).toEqual({
        success: true,
        message: 'このメールアドレスは登録可能です。',
        id: '',
      });
    });
  });

  describe('異常系のテスト', () => {
    it('登録済みのメールアドレスの場合、エラーを返す', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue({ id: 'user-1' });

      const result = await existCheck('exist@example.com');

      expect(result).toEqual({
        success: false,
        message: 'このメールアドレスは既に登録されています。',
        id: 'user-1',
      });
    });

    it('DBエラーが発生した場合、汎用エラーメッセージを返す', async () => {
      (prisma.user.findUnique as Mock).mockRejectedValue(new Error('DB接続エラー'));

      const result = await existCheck('error@example.com');

      expect(result).toEqual({
        success: false,
        message: 'エラーが発生しました。管理者に連絡してください。',
        id: '',
      });
    });
  });
});

describe('checkEmailPassword', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('正常系のテスト', () => {
    it('メールアドレスとパスワードが一致する場合、ユーザー情報を返す', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue({
        id: 'user-1',
        password: 'hashed-password',
        role: 'USER',
      });
      (bcrypt.compareSync as Mock).mockReturnValue(true);

      const result = await checkEmailPassword('test@example.com', 'password123');

      expect(result).toEqual({
        success: true,
        message: 'メールアドレスまたはパスワードが一致しました。',
        id: 'user-1',
        role: 'USER',
      });
    });
  });

  describe('異常系のテスト', () => {
    it('ユーザーが存在しない場合、エラーを返す', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue(null);

      const result = await checkEmailPassword('notfound@example.com', 'password123');

      expect(result).toEqual({
        success: false,
        message: 'メールアドレスまたはパスワードが間違っています。',
        id: null,
        role: null,
      });
    });

    it('パスワードが一致しない場合、エラーを返す', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue({
        id: 'user-1',
        password: 'hashed-password',
        role: 'USER',
      });
      (bcrypt.compareSync as Mock).mockReturnValue(false);

      const result = await checkEmailPassword('test@example.com', 'wrong-password');

      expect(result).toEqual({
        success: false,
        message: 'メールアドレスまたはパスワードが間違っています。',
        id: null,
        role: null,
      });
    });
  });
});

describe('hashPassword', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('正常系のテスト', () => {
    it('パスワードをハッシュ化した文字列を返す', async () => {
      (bcrypt.genSaltSync as Mock).mockReturnValue('salt');
      (bcrypt.hashSync as Mock).mockReturnValue('hashed-password');

      const result = await hashPassword('password123');

      expect(result).toBe('hashed-password');
      expect(bcrypt.hashSync).toHaveBeenCalledWith('password123', 'salt');
    });
  });
});
