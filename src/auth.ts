import NextAuth from "next-auth"
import { authConfig } from '@/auth.config';
import Credentials from "next-auth/providers/credentials"
import { checkEmailPassword } from '@/validations/user';
import { CustomCredentialsSignin } from '@/class/CustomCredentialsSignin';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      authorize: async (credentials) => {
        const result = await checkEmailPassword(
          credentials?.email as string,
          credentials?.password as string,
        );

        if (!result.success || !result.id) {
          throw new CustomCredentialsSignin("パスワードまたはメールアドレスが間違っています。");
        }

        return {
          id: result.id ?? undefined,
          role: result.role ?? 'USER',
        };
      },
    })
  ],
})
