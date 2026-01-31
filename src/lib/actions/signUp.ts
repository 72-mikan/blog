'use server'

import {signUpSchema } from '@/validations/signUp';
import { signIn } from '@/auth'; // signIn関数のインポート
import { handleAuthError } from './error';

type ActionState = {
  success: boolean;
  errors: { 
    name?: string[]|string;
    email?: string[]|string;
    password?: string[]|string;
    commom?: string;
  };
} | undefined;

export async function submitSignUpForm(
  state: ActionState,
  formData: FormData,
): Promise<ActionState>  {
  console.log('サインアップアクション実行');
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');

  // バリデーション
  const validationResult = signUpSchema.safeParse({ name, email, password });
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
    // サインアップAPI呼び出し
    const res = await fetch(`${process.env.URL}/api/auth/signUp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name: name,
        email: email,
        password: password
      }),
    });

    // レスポンスが正常でなければnullを返す
    if (!res.ok) {
      const data = await res.json();
      // API接続エラー
      switch (data.error_type) {
        case 'EXIST_CHECK_FAILED':
          return {
            success: false,
            errors: {
              email: 'このメールアドレスは既に使用されています。'
            }
          };
        default:
          return {
            success: false,
            errors: {
              commom: 'サーバーエラーが発生しました。時間をおいて再試行してください。'
            }
          };
      }
    }

    // サインイン処理
    await signIn('credentials', formData);
  } catch (error) {
    return handleAuthError(error);
  }

}