import { NextResponse } from "next/server";
import type { User } from "@/interface/user";
import { checkEmailPassword } from "@/validations/user";
import { jwtEncode, setCookie } from "@/lib/jwt";
import { cookies } from 'next/headers';


export async function POST(req: Request) {
  const cookieStore = await cookies();
  const cookie_token = cookieStore.get('token')?.value;
  const user: User =  await req.json();
  const checkExsist = await checkEmailPassword(user.email, user.password);

  // ユーザーの存在確認とパスワードの確認
  if (!checkExsist.success || !checkExsist.id) {
    return NextResponse.json(
      {
        succsess: false,
        message: checkExsist.message,
        id: checkExsist.id,
        role: null,
        token: null
      }, 
      { status: 400 }
    );
  }

  // jwtの発行
  const token = await jwtEncode(checkExsist.id, "ADMIN");

  const res = NextResponse.json(
    {
      succsess: true,
      message: "ログインが成功しました。",
      id: checkExsist.id,
      role: checkExsist.role,
      token: token
    }
    , { status: 200 }
  );

  res.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res;

}