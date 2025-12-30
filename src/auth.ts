import NextAuth from "next-auth"
import { authConfig } from '@/auth.config';
import Credentials from "next-auth/providers/credentials"
import { CustomAuthError } from "@/class/CustomAuthError";
import type { SignIn } from "@/interface/signIn";
import { setCookie } from "@/lib/jwt";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      authorize: async (credentials) => {
        try {
          // ユーザー認証のロジックをここに実装
          const res = await fetch(`${process.env.URL}/api/auth/signIn`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              email: credentials?.email,
              password: credentials?.password
            }),
          })
          // レスポンスが正常でなければnullを返す
          if (!res.ok) {
            // API接続エラー
            return new CustomAuthError("API_CONNECTION_ERROR", "API接続エラーが発生しました。");
          }

          const data:SignIn = await res.json();

          if (data.token) {
            setCookie(data.token);
          }

          // ユーザー情報を抽出
          const user = {
            id: data.id ?? undefined,
            role: data.role ?? 'USER',
          };

          if (user.id === undefined) {
            return new CustomAuthError("NOT_EXISTS_USER_ERROR", "ユーザーが存在しません。");
          }

          return user;
        } catch (error) {
            return new Error("エラーが発生しました。");  
        }
      },
    })
  ],
})