import { prisma } from '@/lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type { Context } from '@/interface/context';
import { UnauthorizedError } from '@/class/error/UnauthorizedError';
import { ForbiddenError } from '@/class/error/ForbiddenError';
import { BadRequestError } from '@/class/error/BadRequestError';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const isAdmin = session?.user?.role === 'ADMIN';

    const blogs = await prisma.context.findMany({
      where: isAdmin ? {} : { isPublic: true },
      select: {
        id: true,
        title: true,
        context: true,
        isPublic: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
        tags: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return new Response(JSON.stringify(blogs), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        errors: {
          error: 'サーバーエラーが発生しました。',
        },
      }),
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data: Context = await req.json();

    if (!data.userId) {
      throw new BadRequestError('ユーザーIDが必要です。');
    }

    const user = await prisma.user.findFirst({
      where: {
        id: data.userId,
        role: 'ADMIN'
      }
    });

    if (!user) {
      throw new ForbiddenError('管理者権限がありません。');
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
          connect: { id: data.userId }, // 投稿者を紐づける
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

export async function PUT(req: Request) {
  try {
    const data: Context & { id: number } = await req.json();

    if (!data.id) {
      throw new BadRequestError('ブログIDが必要です。');
    }

    if (!data.userId) {
      throw new BadRequestError('ユーザーIDが必要です。');
    }

    const user = await prisma.user.findFirst({
      where: {
        id: data.userId,
        role: 'ADMIN'
      }
    });

    if (!user) {
      throw new ForbiddenError('管理者権限がありません。');
    }

    const blog = await prisma.context.findUnique({
      where: { id: data.id },
    });

    if (!blog) {
      throw new BadRequestError('ブログが見つかりません。');
    }

    const existingTags = await prisma.tag.findMany({
      where: {
        name: { in: data.tags },
      },
    });

    if (existingTags.length !== data.tags.length) {
      throw new BadRequestError('タグが存在しません。');
    }

    await prisma.context.update({
      where: { id: data.id },
      data: {
        title: data.title,
        context: data.context,
        isPublic: data.isPublic,
        tags: {
          set: [],
          connect: data.tags.map((tag) => ({ name: tag })),
        },
      },
    });

    return new Response('ブログが更新されました。', { status: 200 });
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
