"use client"

import { useActionState } from 'react';
import { submitSignUpForm } from '@/lib/actions/signUp';
import { signOut as customSignOut } from '@/auth';

function signOut() {
  customSignOut();
}

export default function signUpPage() {
  const [errorMessage, formAction, isPending] = useActionState( 
    submitSignUpForm,
    undefined,
  );

  return (
    <div>
      <button onClick={signOut}>戻る</button>
      <p>新規登録</p>
      <form action={formAction}>
        <table>
          <tbody>
            <tr>
              <td>名前</td>
              <td>
                <input type="text" name="name" />
              </td>
            </tr>
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
                <button type="submit">新規登録</button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
}