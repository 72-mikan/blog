import { jwtEncode, verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";
import type { User } from "@/interface/user";
import { existCheck } from "@/validations/user";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/validations/user";
// import cookie from "cookie";

export async function POST(req: Request) {
  const user: User =  await req.json();
  const exsitsCheck = await existCheck(user.email);
  if (!exsitsCheck.success) {
    return NextResponse.json({ succsess: false, message: exsitsCheck.message }, { status: 400 });
  }

  // ユーザー登録
  try {
    await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: await hashPassword(user.password),
        role: "ADMIN",
      }
    });
    
    return NextResponse.json({ succsess: true, message: "ユーザー登録が成功しました。" }, { status: 200 });
  } catch {
    return NextResponse.json({ succsess: false, message: "エラーが発生しました。管理者に連絡してください。" }, { status: 400 });
  }
}

// JWTのテスト用エンドポイント
export async function GET() {
  const jwt = await jwtEncode('user123', 'admin'); 
  console.log('生成したJWT:', jwt);
  console.log('デコード結果:', await verifyToken(jwt));
  return NextResponse.json([
    {jwt: jwt},
  ]);
}