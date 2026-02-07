'use server'

import { upsertTagSchema } from '@/validations/tags/upsert';

type ActionState = {
  success: boolean;
  errors: {
    name?: string[] | string;
    error?: string;
  };
  formData?: {
    name?: string;
  };
} | undefined;

export async function createTag(
  state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = formData.get('name') as string;

  // Zod バリデーション
  const validationResult = upsertTagSchema.safeParse({ name });

  if (!validationResult.success) {
    const errors = validationResult.error.flatten();
    return {
      success: false,
      errors: {
        name: errors.fieldErrors.name?.[0] || 'バリデーションエラーが発生しました',
      },
      formData: { name }
    };
  }

  try {
    const response = await fetch(`${process.env.URL}/api/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: validationResult.data.name }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        errors: {},
      };
    } else {
      return {
        success: false,
        errors: { error: data.errors?.error || "タグの作成に失敗しました" },
        formData: { name }
      };
    }
  } catch (error: any) {
    return {
      success: false,
      errors: { error: "タグの作成に失敗しました" },
      formData: { name }
    };
  }
}
