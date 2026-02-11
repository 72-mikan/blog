'use server'

import { cookies } from "next/headers";
import { auth } from "@/auth";
import { ApiConnectError } from "@/class/error/ApiConnectError";

type ActionState = {
  success: boolean;
  errors: {
    error?: string;
  };
} | undefined;

export async function deleteBlogPost(
  blogId: number,
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

  try {
    const cookieHeader = cookies().toString();
    const res = await fetch(`${process.env.URL}/api/blogs/${blogId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
    });

    if (!res.ok) {
      const data = await res.json();
      throw new ApiConnectError(data.errors.error || 'API接続エラーが発生しました。');
    }

    return {
      success: true,
      errors: {},
    };
  } catch (e) {
    if (e instanceof ApiConnectError) {
      return {
        success: false,
        errors: {
          error: e.message,
        },
      };
    }
    return {
      success: false,
      errors: {
        error: 'エラーが発生しました。',
      },
    };
  }
}
