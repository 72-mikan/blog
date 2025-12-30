import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// メールアドレスの存在確認
export async function existCheck(email: string):Promise<{success: boolean; message: string; id: string}> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      return { success: false, message: "このメールアドレスは既に登録されています。", id: existingUser.id };
    } else {
      return { success: true, message: "このメールアドレスは登録可能です。", id: "" };
    }
  } catch(e) {
    return { success: false, message: "エラーが発生しました。管理者に連絡してください。", id: "" };
  } 
}

// メールアドレスとパスワードの組み合わせ確認
export async function checkEmailPassword(email: string, password: string) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  const passwordMatch = existingUser ? await comparePassword(password, existingUser.password) : false;
  if (existingUser && passwordMatch) {
    return { 
      success: true, 
      message: "メールアドレスまたはパスワードが一致しました。", 
      id: existingUser.id,
      role: existingUser.role
    };
  } else {
    return { 
      success: false, 
      message: "メールアドレスまたはパスワードが間違っています。", 
      id: null,
      role: null
    };
  }
}

// パスワードのハッシュ化
export async function hashPassword(password: string): Promise<string> {
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  return bcrypt.hashSync(password, salt);
}

// パスワードの比較
async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compareSync(password, hashedPassword);
}