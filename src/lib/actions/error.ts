import { AuthError } from 'next-auth';

type ActionStateError<TValues extends Record<string, string> | undefined = undefined> = {
  success: false;
  errors: {
    commom: string;
  };
  values?: TValues;
};

/**
 * NextAuth エラーから ActionState エラーレスポンスに変換
 * @param error - キャッチしたエラー
 * @param values - 保持する入力値
 * @returns ActionState エラーレスポンス
 */
export function handleAuthError<TValues extends Record<string, string> | undefined>(
  error: unknown,
  values?: TValues
): ActionStateError<TValues> {
  if (error instanceof AuthError) {
    switch (error.type) {
      case 'CredentialsSignin':
        return {
          success: false,
          errors: {
            commom: error.message || 'エラーが発生しました。'
          },
          values
        };
      case 'CallbackRouteError':
        const originalError = error.cause?.err as Error | undefined;
        return {
          success: false,
          errors: {
            commom: originalError?.message || 'エラーが発生しました。'
          },
          values
        };
      default:
        return {
          success: false,
          errors: {
            commom: 'エラーが発生しました。'
          },
          values
        };
    }
  }
  // AuthError でなければ再投げ
  throw error;
}
