'use server'

import * as jose from 'jose'
import { cookies } from "next/headers";

/**
 * JWTエンコード
 * @param userId 
 * @param role 
 * @returns 
 */
export async function jwtEncode(userId: string, role: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
  const payload = {
    sub: userId,                        // ユーザーID
    role: role,                         // 権限
    iat: Math.floor(Date.now() / 1000)  // 発行時刻
  }

  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" }) // 署名アルゴリズム
    .setIssuedAt()
    .setExpirationTime("2h")              // 有効期限
    .sign(secret)

  return jwt
}

/**
 * トークンの検証
 * @param token 
 * @returns 
 */
export async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
  try {
    const { payload, protectedHeader } = await jose.jwtVerify(token, secret, { clockTolerance: 5 });
    return { payload, protectedHeader };
  } catch(e) {
    console.error("JWT検証エラー:", e);
    return null;
  }
}

/**
 * クッキーにトークンを保存
 * @param token 
 */
export async function setCookie(token: string) {
  // クッキーにトークンを保存
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
}

/**
 * クッキーからトークンを取得
 * @returns 
 */
export async function getToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  return token ?? null;
}

/**
 * クッキーの破棄
 */
export async function resetToken() {
  const cookieStore = await cookies();
  cookieStore.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
}