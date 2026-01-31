import { NextResponse } from "next/server";
import type { User } from "@/interface/user";
import { checkEmailPassword } from "@/validations/user";
import { ERROR_TYPES } from '@/constants/errorTypes';

export async function POST(req: Request) {
  const user: User =  await req.json();
  const checkExsist = await checkEmailPassword(user.email, user.password);

  // ユーザーの存在確認とパスワードの確認
  if (!checkExsist.success || !checkExsist.id) {
    return NextResponse.json(
      {
        message: checkExsist.message,
        id: checkExsist.id,
        role: null,
        error_type: ERROR_TYPES.NOT_EXISTS_USER_ERROR,
      }, 
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      message: "ログインが成功しました。",
      id: checkExsist.id,
      role: checkExsist.role,
    }
    , { status: 200 }
  );

}