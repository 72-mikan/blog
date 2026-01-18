// // src/types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  // User 型を拡張
  interface User extends DefaultUser {
    id?: string;
    role?: string; // ここに独自フィールドを追加
  }

  // Session にも role を追加
  interface Session {
    user: {
      id: string;
      // role?: string;
    } & DefaultSession["user"];
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    // role?: string;
  }
}

// declare module "next-auth/adapters" {
//   interface AdapterUser {
//     id: string;
//     role?: string;
//   }
// }