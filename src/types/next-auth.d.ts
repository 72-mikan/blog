// // src/types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  // User 型を拡張
  interface User {
    id?: string;
    email?: string;
    role?: string|null; // ここに独自フィールドを追加
  }

  // Session にも role を追加
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      role: string|null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role: string|null;
  }
}

// declare module "next-auth/adapters" {
//   interface AdapterUser {
//     id: string;
//     role?: string;
//   }
// }