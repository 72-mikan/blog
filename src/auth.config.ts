import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: '/login' },
  session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) { // authはユーザーセッションが含まれる
      const isLoggedIn = !!auth?.user;  // ユーザーがログインしているか
      const isOnCommonPage = nextUrl.pathname === '/' 
        || nextUrl.pathname.startsWith('/about') 
        || (nextUrl.pathname === '/blog' 
          || (nextUrl.pathname.startsWith('/blog/') && !nextUrl.pathname.startsWith('/blog/create')))
      const isAdminPage = nextUrl.pathname.startsWith('/admin');

      if (isAdminPage) {
        if (isLoggedIn && auth?.user?.role === 'ADMIN') {
          return true;
        }
        return false; // 管理者でなければアクセス不可
      } else if (isOnCommonPage) {
        return true; // どちらでもアクセス可能
      } else if (isLoggedIn && nextUrl.pathname === '/login' ) {
        return Response.redirect(new URL('/', nextUrl));
      }

      return false; // その他のページはログイン必須
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    }
  },
  providers: []
} satisfies NextAuthConfig;