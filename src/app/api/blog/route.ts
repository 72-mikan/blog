import { prisma } from '@/lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type { Context } from '@/interface/context';
import { verifyToken } from "@/lib/jwt";
import { UnauthorizedError } from '@/class/error/UnauthorizedError';
import { ForbiddenError } from '@/class/error/ForbiddenError';
import { BadRequestError } from '@/class/error/BadRequestError';
import { createBlogSchema } from '@/validations/blog/create';

export async function POST(req: Request) {
  try {
    const data: Context = await req.json();

    // バリデーションチェック
    const validationResult = createBlogSchema.safeParse({
      title: data.title,
      context: data.context,
      tags: data.tags,
    });

    // バリデーションチェック
    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      return new Response(
        JSON.stringify({
          errors: {
            title: errors.fieldErrors.title?.[0] || [],
            context: errors.fieldErrors.context?.[0] || [],
            tags: errors.fieldErrors.tags?.[0] || [],
          }
        })
        , { status: 400 }
      );
    }

    // tokenの検証
    const decodeToken =  data.token && await verifyToken(data.token);
    if (!decodeToken) {
      throw new UnauthorizedError('トークンが有効ではありません。');
    }

    if (decodeToken.payload.role !== 'ADMIN') {
      throw new ForbiddenError('権限がありません。');
    }
    const existingTags = await prisma.tag.findMany({
      where: {
        name: { in: data.tags },
      },
    });

    if (existingTags.length !== data.tags.length) {
      throw new BadRequestError('タグが存在しません。');
    }

    await prisma.context.create({
      data: {
        title: data.title,
        context: data.context,
        isPublic: data.isPublic,
        user: {
          connect: { id: decodeToken.payload.sub }, // 投稿者を紐づける
        },
        tags: {
          connect: data.tags.map((tag) => ({ name: tag})),
        },
      },
    });
    return new Response('投稿が成功しました。', { status: 200 });
  } catch (e) {
    if (e instanceof UnauthorizedError ||
        e instanceof ForbiddenError ||
        e instanceof BadRequestError) {
          return new Response(
            JSON.stringify({
              errors: {
                error: e.message
              }
            })
            , { status: e.status }
          );
    } else if (e instanceof PrismaClientKnownRequestError) {
      return new Response(
        JSON.stringify({
          errors: {
            error: 'サーバーエラーが発生しました。'
          }
        })
        , { status: 500 }
      );
    }
    return new Response(
      JSON.stringify({
        errors: {
          error: 'サーバーエラーが発生しました。'
        }
      })
      , { status: 500 }
    );
  }
}