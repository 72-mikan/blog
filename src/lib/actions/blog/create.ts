'use server'

import { getToken } from "@/lib/jwt";
import { redirect } from "next/navigation";

type ActionState = {
  success: boolean;
  errors: { 
  };
} | undefined;

export async function createBlogPost(
  state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const title = formData.get('title');
  const tag = formData.get('tag') ?? [];
  const tags = typeof tag === 'string' ? tag.split(' ') : [];
  const context = formData.get('context');
  const isPublic = formData.get('isPublic') ?? false;

  try {
    // tokenの取得
    const token = await getToken();
    const res = await fetch("http://localhost:3000/api/blog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        tags: tags,
        context: context,
        isPublic: isPublic ? true : false,
        token: token,
      }),
    });
    // レスポンスが正常でなければnullを返す
    if (!res.ok) {
      // API接続エラー
      throw new Error();
    }
  } catch (e) {
    console.error('ブログ作成エラー', e);
    return {
      success: false,
      errors: {
        title: [],
        tags: [],
        context: [],
        isPublic: []
      }
    };
  }
  redirect(`/test`);
}