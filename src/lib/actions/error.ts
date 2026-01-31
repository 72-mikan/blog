import { AuthError } from 'next-auth';

type ActionStateError = {
  success: false;
  errors: {
    commom: string;
  };
};

/**
 * NextAuth エラーから ActionState エラーレスポンスに変換
 * @param error - キャッチしたエラー
 * @returns ActionState エラーレスポンス
 */
export function handleAuthError(error: unknown): ActionStateError {
  if (error instanceof AuthError) {
    switch (error.type) {
      case 'CredentialsSignin':
        return {
          success: false,
          errors: {
            commom: error.message || 'エラーが発生しました。'
          }
        };
      case 'CallbackRouteError':
        const originalError = error.cause?.err as Error | undefined;
        return {
          success: false,
          errors: {
            commom: originalError?.message || 'エラーが発生しました。'
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
  }
  // AuthError でなければ再投げ
  throw error;
}
