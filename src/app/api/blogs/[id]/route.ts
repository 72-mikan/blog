import { prisma } from '@/lib/prisma';
import { UnauthorizedError } from '@/class/error/UnauthorizedError';
import { ForbiddenError } from '@/class/error/ForbiddenError';
import { BadRequestError } from '@/class/error/BadRequestError';
import { auth } from '@/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      throw new BadRequestError('ブログIDが必要です。');
    }

    const session = await auth();
    const isAdmin = session?.user?.role === 'ADMIN';

    const blog = await prisma.context.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        title: true,
        context: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!blog) {
      return new Response(
        JSON.stringify({
          errors: {
            error: 'ブログが見つかりません。'
          }
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!blog.isPublic && !isAdmin) {
      return new Response(
        JSON.stringify({
          errors: {
            error: 'このブログを閲覧する権限がありません。'
          }
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(blog), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    if (e instanceof BadRequestError) {
      return new Response(
        JSON.stringify({
          errors: {
            error: e.message
          }
        }),
        { status: e.status }
      );
    }
    return new Response(
      JSON.stringify({
        errors: {
          error: 'サーバーエラーが発生しました。'
        }
      }),
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      throw new BadRequestError('ブログIDが必要です。');
    }

    const session = await auth();

    if (!session?.user?.id) {
      throw new UnauthorizedError('ログインが必要です。');
    }

    const user = await prisma.user.findFirst({
      where: {
        id: session.user.id,
        role: 'ADMIN'
      }
    });

    if (!user) {
      throw new ForbiddenError('管理者権限がありません。');
    }

    const blog = await prisma.context.findUnique({
      where: { id: parseInt(id) },
    });

    if (!blog) {
      throw new BadRequestError('ブログが見つかりません。');
    }

    await prisma.context.delete({
      where: { id: parseInt(id) },
    });

    return new Response('ブログが削除されました。', { status: 200 });
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
