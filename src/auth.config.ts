import type { NextAuthConfig } from "next-auth";
import { Jwt } from "@/interface/jwt";
import { getToken } from "@/lib/jwt";

export const authConfig = {
  pages: { signIn: '/login' },
  session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async authorized({ request }) {
      // urlの取得
      const url = request.nextUrl;
      const pathname = url.pathname;

      try {
        // // tokenの取得
        // const token = await getToken();

        // jwttokenの検証
        const res =  await fetch(`${process.env.URL}/api/auth/verifyToken`, {
          method: "POST",
          credentials: "include",
          headers: { 
            "Content-Type": "application/json",
          },
          // body: JSON.stringify({
          //   token: token,
          // }),
        });

        // レスポンスが正常でなければnullを返す
        if (!res.ok) return false;

        const data = await res.json();

        // データの確認
        if (!data) return false;
        
        const jwt: Jwt = data;
        // 成功確認
        if (!jwt.succsess) return false;

        // 管理者ページの確認
        if (pathname.startsWith("/admin") && jwt.role != "ADMIN") {
          return false;
        }

        return true;
      } catch (error) {
        return false;
      }
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