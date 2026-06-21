'use server'

import { auth } from "@/auth";
import { createBlogSchema } from "@/validations/blogs/upsert";
import { revalidatePath } from "next/cache";
import { saveImage } from "@/utils/image";
import { prisma } from "@/lib/prisma";
import { ForbiddenError } from "@/class/error/ForbiddenError";
import { BadRequestError } from "@/class/error/BadRequestError";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

type UploadImageState = {
  success: boolean;
  url?: string;
  error?: string;
};

type ActionState = {
  success: boolean;
  errors: {
    title?: string[];
    context?: string[];
    tags?: string[];
    error?: string;
  };
  formData?: {
    title?: string;
    tag?: string;
    context?: string;
  };
} | undefined;

export async function updateBlogPost(
  blogId: number,
  _state: ActionState,
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
  const isPublic = formData.get('isPublic') === 'true';

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
        title: errors.fieldErrors.title || [],
        context: errors.fieldErrors.context || [],
        tags: errors.fieldErrors.tags || [],
      },
      formData: {
        title: String(title || ''),
        tag: String(tag || ''),
        context: String(context || ''),
      },
    };
  }

  try {
    const user = await prisma.user.findFirst({
      where: { id: session.user.id, role: 'ADMIN' },
    });

    if (!user) {
      throw new ForbiddenError('管理者権限がありません。');
    }

    const blog = await prisma.context.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      throw new BadRequestError('ブログが見つかりません。');
    }

    const existingTags = await prisma.tag.findMany({
      where: { name: { in: tags } },
    });

    if (existingTags.length !== tags.length) {
      throw new BadRequestError('タグが存在しません。');
    }

    await prisma.context.update({
      where: { id: blogId },
      data: {
        title: String(title),
        context: String(context),
        isPublic,
        tags: {
          set: [],
          connect: tags.map((tag) => ({ name: tag })),
        },
      },
    });

    revalidatePath(`/blogs/${blogId}`);
    revalidatePath('/blogs');

    return {
      success: true,
      errors: {},
    };
  } catch (e) {
    if (e instanceof ForbiddenError || e instanceof BadRequestError) {
      return {
        success: false,
        errors: { error: e.message },
        formData: {
          title: String(title || ''),
          tag: String(tag || ''),
          context: String(context || ''),
        },
      };
    }
    return {
      success: false,
      errors: { error: 'エラーが発生しました。' },
      formData: {
        title: String(title || ''),
        tag: String(tag || ''),
        context: String(context || ''),
      },
    };
  }
}

export async function uploadBlogImageForUpdate(formData: FormData): Promise<UploadImageState> {
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

  try {
    const imagePath = await saveImage(imageFile, 'blogs/temp');

    if (!imagePath) {
      return {
        success: false,
        error: '画像URLの取得に失敗しました。',
      };
    }

    return {
      success: true,
      url: imagePath,
    };
  } catch (error) {
    return {
      success: false,
      error: '画像アップロード中にエラーが発生しました。',
    };
  }
}
