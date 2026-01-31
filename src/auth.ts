import NextAuth from "next-auth"
import { authConfig } from '@/auth.config';
import Credentials from "next-auth/providers/credentials"
import type { SignIn } from "@/interface/signIn";
import { ERROR_TYPES } from '@/constants/errorTypes';
import { CustomCredentialsSignin } from '@/class/CustomCredentialsSignin';

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

          // レスポンスが正常でなければエラーを投げる
          if (!res.ok) {
            const data:SignIn = await res.json();
            if (data.error_type === ERROR_TYPES.NOT_EXISTS_USER_ERROR) {
              throw new CustomCredentialsSignin("パスワードまたはメールアドレスが間違っています。");
            }
            throw new Error("サーバーエラーが発生しました。時間をおいて再試行してください。");
          }

          const data:SignIn = await res.json();

          // ユーザー情報を抽出
          const user = {
            id: data.id ?? undefined,
            role: data.role ?? 'USER',
          };

          if (!data.id) {
            throw new Error("サーバーエラーが発生しました。時間をおいて再試行してください。");
          }

          return user;
        } catch (error) {
          // CustomCredentialsSigninはそのまま投げる
          if (error instanceof CustomCredentialsSignin) {
            throw error;
          }
          // その他のエラーは一般的な認証エラーとして投げる
          throw error;
        }
      },
    })
  ],
})