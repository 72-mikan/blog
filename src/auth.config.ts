import type { NextAuthConfig } from "next-auth";
import { CredentialsSignin } from "next-auth";

export const authConfig = {
  pages: { signIn: '/login' },
  logger: {
    error(err: Error) {
      if (err instanceof CredentialsSignin) {
        return; // 認証失敗は黙らせる
      }
      console.error(err);
    },
    warn: console.warn,
    debug: () => {},
  },
  session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) { // authはユーザーセッションが含まれる
      const isLoggedIn = !!auth?.user;  // ユーザーがログインしているか
      const isOnCommonPage = nextUrl.pathname === '/'
        || nextUrl.pathname.startsWith('/about')
        || nextUrl.pathname === '/signup'
        || (nextUrl.pathname === '/blog'
          || (nextUrl.pathname.startsWith('/blog/') && !nextUrl.pathname.startsWith('/blog/create')))
      const isAdminPage = nextUrl.pathname.startsWith('/admin');

      if (isAdminPage) {
        if (isLoggedIn && auth?.user?.role === 'ADMIN') {
          return true;
        }
        return false; // 管理者でなければアクセス不可
      } else if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/signup')) {
        return Response.redirect(new URL('/', nextUrl));
      } else if (isOnCommonPage) {
        return true; // どちらでもアクセス可能
      }else if (isLoggedIn) {
        return true; // ログイン済みならアクセス可能
      }

      return false; // その他のページはログイン必須
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.role = user.role ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role ?? null;
      return session;
    }
  },
  providers: []
} satisfies NextAuthConfig;