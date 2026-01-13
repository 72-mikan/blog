'use server'

import { getToken } from "@/lib/jwt";
import { redirect } from "next/navigation";
import { ApiConnectError } from "@/class/error/ApiConnectError";

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
    const res = await fetch(`${process.env.URL}/api/blog`, {
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
      throw new ApiConnectError('API接続エラーが発生しました。');
    }

    const data = await res.json();

  } catch (e) {
    if (e instanceof ApiConnectError) {
      return {
        success: false,
        errors: {
          error: e.message,
        },
      };
    }
  }
  redirect(`/blogs`);
}