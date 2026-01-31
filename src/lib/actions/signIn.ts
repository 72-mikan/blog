'use server'

import {signInSchema } from '@/validations/signIn';
import { signIn } from '@/auth'; // signIn関数のインポート
import { handleAuthError } from './error';

type ActionState = {
  success: boolean;
  errors?: { 
    email?: string[]|string;
    password?: string[]|string;
    commom?: string;
  };
} | undefined;

export async function submitSignInForm(
  state: ActionState,
  formData: FormData,
): Promise<ActionState> {

  const email = formData.get('email');
  const password = formData.get('password');

  // バリデーション
  const validationResult = signInSchema.safeParse({ email, password });
  // バリデーションエラーの場合
  if (!validationResult.success) {
    // エラーメッセージの取得 flattenでエラーを見やすく加工
    const errors = validationResult.error.flatten();
    return {
      success: false,
      errors: {
        email: errors.fieldErrors.email?.[0] || [],
        password: errors.fieldErrors.password?.[0] || [],
      }
    };
  }

  try {
    // サインイン処理
    await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    return handleAuthError(error);
  }

}