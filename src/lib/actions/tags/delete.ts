'use server'

import { revalidatePath } from "next/cache";

type ActionState = {
  success: boolean;
  errors: {
    error?: string;
  };
} | undefined;

export async function deleteTag(id: number): Promise<ActionState> {
  try {
    const response = await fetch(`${process.env.URL}/api/tags?id=${id}`, {
      method: 'DELETE',
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
        errors: { error: data.errors?.error || "タグの削除に失敗しました" },
      };
    }
  } catch (error: any) {
    return {
      success: false,
      errors: { error: "タグの削除に失敗しました" },
    };
  }
}
