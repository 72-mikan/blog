'use server'

import { signOut } from '@/auth';
import { resetToken } from "@/lib/jwt";

export async function customSignOut() {
  try {
    // トークンの破棄
    await resetToken();
  } catch(error) {
    console.error('サインアウトエラー', error);
  }
  await signOut();
}