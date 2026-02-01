'use server'

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ApiConnectError } from "@/class/error/ApiConnectError";
import { createBlogSchema } from "@/validations/blog/create";

type ActionState = {
  success: boolean;
  errors: { 
    title?: string[] | string;
    context?: string[] | string;
    tags?: string[] | string;
    error?: string;
  };
  formData?: {
    title?: string;
    tag?: string;
    context?: string;
  };
} | undefined;

export async function createBlogPost(
  state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return {
      success: false,
      errors: {
        error: 'ログインが必要です。',
      },
    };
  }

  const title = formData.get('title');
  const tag = formData.get('tag') ?? [];
  const tags = typeof tag === 'string' ? tag.split(' ') : [];
  const context = formData.get('context');
  const isPublic = formData.get('isPublic') ?? false;

  const validationResult = createBlogSchema.safeParse({
    title,
    context,
    tags,
  });

  if (!validationResult.success) {
    const errors = validationResult.error.flatten();
    return {
      success: false,
      errors: {
        title: errors.fieldErrors.title?.[0] || [],
        context: errors.fieldErrors.context?.[0] || [],
        tags: errors.fieldErrors.tags?.[0] || [],
      },
      formData: {
        title: String(title || ''),
        tag: String(tag || ''),
        context: String(context || ''),
      },
    };
  }

  try {
    const res = await fetch(`${process.env.URL}/api/blog`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: session.user.id,
        title: title,
        tags: tags,
        context: context,
        isPublic: isPublic ? true : false,
      }),
    });
    // レスポンスが正常でなければnullを返す
    if (!res.ok) {
      const data =  await res.json();
      // API接続エラー
      throw new ApiConnectError(data.errors.error || 'API接続エラーが発生しました。');
    }

  } catch (e) {
    if (e instanceof ApiConnectError) {
      return {
        success: false,
        errors: {
          error: e.message,
        },
        formData: {
          title: String(title || ''),
          tag: String(tag || ''),
          context: String(context || ''),
        },
      };
    }
  }
  redirect(`/blogs`);
}
