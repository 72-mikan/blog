import { NextResponse } from "next/server";
import type { User } from "@/interface/user";
import { checkEmailPassword } from "@/validations/user";
import { jwtEncode, setCookie } from "@/lib/jwt";

export async function POST(req: Request) {
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

  return NextResponse.json(
    {
      succsess: true,
      message: "ログインが成功しました。",
      id: checkExsist.id,
      role: checkExsist.role,
      token: token
    }
    , { status: 200 }
  );
}