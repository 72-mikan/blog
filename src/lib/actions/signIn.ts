'use server'

import {signInSchema } from '@/validations/signIn';
import { signIn } from '@/auth'; // signIn関数のインポート
import { AuthError } from "next-auth";
import { CustomAuthError } from '@/class/CustomAuthError';
import { redirect } from 'next/navigation';

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
    const result = await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirect: false,
    });

    if (result?.error) {
      return {
        success: false,
        errors: {
          commom: 'メールアドレスまたはパスワードが正しくありません。'
        }
      };
    }

    return { success: true };
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
              commom: '入力されたメールアドレスは登録されていません。'
            }
          };
        default:
          return {
            success: false,
            errors: {
              commom: 'メールアドレスまたはパスワードが正しくありません。'
            }
          };
      }
    }
    throw error;
  }

}