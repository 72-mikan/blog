import { describe, it, expect } from 'vitest';
import { authConfig } from '@/auth.config';
import type { Session } from 'next-auth';

const { authorized } = authConfig.callbacks;

function buildRequest(pathname: string) {
  return { nextUrl: new URL(`http://localhost:3000${pathname}`) } as Parameters<
    typeof authorized
  >[0]['request'];
}

function buildSession(role: string | null): Session {
  return {
    user: { id: 'user-1', email: 'test@example.com', role },
    expires: '2099-01-01T00:00:00.000Z',
  };
}

describe('authConfig.callbacks.authorized', () => {
  describe('管理者ページ (/admin配下)', () => {
    it('ADMINロールでログイン済みならアクセス可能', async () => {
      const result = await authorized({
        auth: buildSession('ADMIN'),
        request: buildRequest('/admin'),
      });

      expect(result).toBe(true);
    });

    it('USERロールでログイン済みならアクセス不可', async () => {
      const result = await authorized({
        auth: buildSession('USER'),
        request: buildRequest('/admin/dashboard'),
      });

      expect(result).toBe(false);
    });

    it('未ログインならアクセス不可', async () => {
      const result = await authorized({
        auth: null,
        request: buildRequest('/admin'),
      });

      expect(result).toBe(false);
    });
  });

  describe('signin/signupページ', () => {
    it('ログイン済みで/signinにアクセスすると/へリダイレクトする', async () => {
      const result = await authorized({
        auth: buildSession(null),
        request: buildRequest('/signin'),
      });

      expect(result).toBeInstanceOf(Response);
      expect((result as Response).status).toBe(302);
      expect((result as Response).headers.get('location')).toBe('http://localhost:3000/');
    });

    it('ログイン済みで/signupにアクセスすると/へリダイレクトする', async () => {
      const result = await authorized({
        auth: buildSession(null),
        request: buildRequest('/signup'),
      });

      expect(result).toBeInstanceOf(Response);
      expect((result as Response).status).toBe(302);
    });
  });

  describe('共通ページ', () => {
    it.each(['/', '/about', '/about/team', '/signup', '/blogs', '/blogs/1'])(
      '%s は未ログインでもアクセス可能',
      async (pathname) => {
        const result = await authorized({
          auth: null,
          request: buildRequest(pathname),
        });

        expect(result).toBe(true);
      },
    );
  });

  describe('その他のページ', () => {
    it('/blogs/create はログイン済みならアクセス可能', async () => {
      const result = await authorized({
        auth: buildSession(null),
        request: buildRequest('/blogs/create'),
      });

      expect(result).toBe(true);
    });

    it('/blogs/create は未ログインならアクセス不可', async () => {
      const result = await authorized({
        auth: null,
        request: buildRequest('/blogs/create'),
      });

      expect(result).toBe(false);
    });

    it('未知のページはログイン済みならアクセス可能', async () => {
      const result = await authorized({
        auth: buildSession(null),
        request: buildRequest('/mypage'),
      });

      expect(result).toBe(true);
    });

    it('未知のページは未ログインならアクセス不可', async () => {
      const result = await authorized({
        auth: null,
        request: buildRequest('/mypage'),
      });

      expect(result).toBe(false);
    });

    it('サインインページ自体は未ログインの場合falseを返す（next-authが個別に処理するため）', async () => {
      const result = await authorized({
        auth: null,
        request: buildRequest('/signin'),
      });

      expect(result).toBe(false);
    });
  });
});
