import { NextResponse } from "next/server";
import type { User } from "@/interface/user";
import { existCheck } from "@/validations/user";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/validations/user";
import { USER_ROLE } from "@/constants/role";
import { ERROR_TYPES } from "@/constants/errorTypes";

/**
 * ユーザー登録用のAPIエンドポイント
 * @param req 
 * @returns 
 */
export async function POST(req: Request) {
  const user: User =  await req.json();
  const exsitsCheck = await existCheck(user.email);
  if (!exsitsCheck.success) {
    return NextResponse.json({ message: exsitsCheck.message, error_type: ERROR_TYPES.EXIST_CHECK_FAILED }, { status: 400 });
  }

  // ユーザー登録
  try {
    await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: await hashPassword(user.password),
        role: USER_ROLE.USER,
      }
    });
    
    return NextResponse.json({ message: "ユーザー登録が成功しました。", error_type: null }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "エラーが発生しました。管理者に連絡してください。", error_type: ERROR_TYPES.SERVER_ERROR }, { status: 400 });
  }
}