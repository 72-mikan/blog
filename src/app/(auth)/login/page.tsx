"use client"

import { useActionState } from 'react';
import { submitSignInForm } from '@/lib/actions/signIn';

export default function signInPage() {
  const [errorMessage, formAction, isPending] = useActionState( 
    submitSignInForm,
    undefined,
  );

  return (
    <div>
      <h1>ログイン</h1>
      <form action={formAction}>
        <table>
          <tbody>
            <tr>
              <td>メールアドレス</td>
              <td>
                <input type="text" name="email" />
              </td>
            </tr>
            <tr>
              <td>パスワード</td>
              <td>
                <input type="text" name="password" />
              </td>
            </tr>
            <tr>
              <td>
                <button type="submit">
                  ログイン
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
}