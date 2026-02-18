'use server'

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ApiConnectError } from "@/class/error/ApiConnectError";
import { createBlogSchema } from "@/validations/blogs/upsert";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

type UploadImageState = {
  success: boolean;
  url?: string;
  error?: string;
};

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
  const tag = formData.get('tag');
  const tags = typeof tag === 'string' && tag.trim() ? tag.trim().split(/\s+/).filter(Boolean) : [];
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
    const res = await fetch(`${process.env.URL}/api/blogs`, {
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

export async function uploadBlogImageForCreate(formData: FormData): Promise<UploadImageState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: 'ログインが必要です。',
    };
  }

  const imageFile = formData.get('image');

  if (!(imageFile instanceof File)) {
    return {
      success: false,
      error: '画像ファイルを選択してください。',
    };
  }

  if (!imageFile.type.startsWith('image/')) {
    return {
      success: false,
      error: '画像ファイルのみアップロードできます。',
    };
  }

  if (imageFile.size > MAX_IMAGE_SIZE) {
    return {
      success: false,
      error: '画像サイズは5MB以下にしてください。',
    };
  }

  if (!process.env.URL) {
    return {
      success: false,
      error: 'API接続先URLが設定されていません。',
    };
  }

  const payload = new FormData();
  payload.append('image', imageFile);
  payload.append('userId', session.user.id);

  try {
    const res = await fetch(`${process.env.URL}/api/blogs/upload`, {
      method: 'POST',
      body: payload,
    });

    if (!res.ok) {
      const data = await res.json();
      return {
        success: false,
        error: data?.errors?.error || '画像アップロードに失敗しました。',
      };
    }

    const data = await res.json();

    if (!data?.url) {
      return {
        success: false,
        error: '画像URLの取得に失敗しました。',
      };
    }

    return {
      success: true,
      url: data.url,
    };
  } catch (error) {
    return {
      success: false,
      error: '画像アップロード中にエラーが発生しました。',
    };
  }
}
