'use server'

import {signUpSchema } from '@/validations/signUp';
import { signIn } from '@/auth'; // signIn関数のインポート
import { AuthError } from "next-auth";
import { CustomAuthError } from '@/class/CustomAuthError';

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
      // API接続エラー
      throw new Error("サインアップに失敗しました。");
    }

    // サインイン処理
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            success: false,
            errors: {
              commom: 'メールアドレスまたはパスワードが正しくありません。'
            }
          };
        default:
          return {
            success: false,
            errors: {
              commom: 'エラーが発生しました。'
            }
          };
      }
    } else if (error instanceof CustomAuthError) {
      switch (error.type) {
        case 'API_CONNECTION_ERROR':
          return {
            success: false,
            errors: {
              commom: 'エラーが発生しました。管理者に問い合わせてください。'
            }
          };
        case 'NOT_EXISTS_USER_ERROR':
          return {
            success: false,
            errors: {
              commom: '入力されたメールアドレスでユーザー登録がされていません。'
            }
          };
        default:
          return {
            success: false,
            errors: {
              commom: 'エラーが発生しました。'
            }
          };
      }
    } else {
      return {
        success: false,
        errors: {
          commom: 'サインアップに失敗しました。管理者に問い合わせてください。'
        }
      };
    }
  }

}