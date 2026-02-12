'use server'

import { upsertTagSchema } from '@/validations/tags/upsert';
import { revalidatePath } from "next/cache";

type ActionState = {
  success: boolean;
  errors: {
    name?: string[] | string;
    image?: string;
    error?: string;
  };
} | undefined;

export async function updateTag(
  id: number,
  name: string,
  imageFile?: File | null,
): Promise<ActionState> {
  // Zod バリデーション
  const validationResult = upsertTagSchema.safeParse({ name });

  if (!validationResult.success) {
    const errors = validationResult.error.flatten();
    return {
      success: false,
      errors: {
        name: errors.fieldErrors.name?.[0] || 'バリデーションエラーが発生しました',
      },
    };
  }

  try {
    const formData = new FormData();
    formData.append('id', String(id));
    formData.append('name', validationResult.data.name);
    if (imageFile && imageFile.size > 0) {
      formData.append('image', imageFile);
    }

    const response = await fetch(`${process.env.URL}/api/tags`, {
      method: 'PUT',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      revalidatePath('/tags');
      return {
        success: true,
        errors: {},
      };
    } else {
      return {
        success: false,
        errors: { error: data.errors?.error || "タグの更新に失敗しました" },
      };
    }
  } catch (error: unknown) {
    return {
      success: false,
      errors: { error: "タグの更新に失敗しました" },
    };
  }
}
