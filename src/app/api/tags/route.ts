import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { BadRequestError } from '@/class/error/BadRequestError';
import { UnauthorizedError } from '@/class/error/UnauthorizedError';
import { auth } from '@/auth';
import { saveImage } from '@/utils/image';

// GET: タグ一覧取得
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: { contexts: true }
        }
      }
    });

    return Response.json(tags, { status: 200 });
  } catch (e) {
    return Response.json(
      { errors: { error: 'タグの取得に失敗しました' } },
      { status: 500 }
    );
  }
}

// POST: タグ作成
export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      throw new UnauthorizedError('認証が必要です');
    }

    const formData = await req.formData();
    const name = formData.get('name');
    const imageFile = formData.get('image') as File | null;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new BadRequestError('タグ名を入力してください');
    }

    let imagePath: string | null = null;
    if (imageFile && imageFile.size > 0) {
      imagePath = await saveImage(imageFile, 'tags');
      if (!imagePath) {
        throw new BadRequestError('画像のアップロードに失敗しました');
      }
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        imagePath: imagePath,
      },
    });

    return Response.json(tag, { status: 201 });
  } catch (e) {
    if (e instanceof UnauthorizedError || e instanceof BadRequestError) {
      return Response.json(
        { errors: { error: e.message } },
        { status: e.status }
      );
    } else if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        return Response.json(
          { errors: { error: 'このタグ名は既に存在します' } },
          { status: 400 }
        );
      }
    }
    return Response.json(
      { errors: { error: 'タグの作成に失敗しました' } },
      { status: 500 }
    );
  }
}

// PUT: タグ更新
export async function PUT(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      throw new UnauthorizedError('認証が必要です');
    }

    const formData = await req.formData();
    const id = formData.get('id');
    const name = formData.get('name');
    const imageFile = formData.get('image') as File | null;

    if (!id || typeof id !== 'string') {
      throw new BadRequestError('タグIDが必要です');
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new BadRequestError('タグ名を入力してください');
    }

    let imagePath: string | null | undefined = undefined;
    if (imageFile && imageFile.size > 0) {
      imagePath = await saveImage(imageFile, 'tags');
      if (!imagePath) {
        throw new BadRequestError('画像のアップロードに失敗しました');
      }
    }

    const tag = await prisma.tag.update({
      where: { id: Number(id) },
      data: {
        name: name.trim(),
        imagePath: imagePath !== undefined ? imagePath : undefined,
      },
    });

    return Response.json(tag, { status: 200 });
  } catch (e) {
    if (e instanceof UnauthorizedError || e instanceof BadRequestError) {
      return Response.json(
        { errors: { error: e.message } },
        { status: e.status }
      );
    } else if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        return Response.json(
          { errors: { error: 'このタグ名は既に存在します' } },
          { status: 400 }
        );
      }
    }
    return Response.json(
      { errors: { error: 'タグの更新に失敗しました' } },
      { status: 500 }
    );
  }
}

// DELETE: タグ削除
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      throw new UnauthorizedError('認証が必要です');
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      throw new BadRequestError('タグIDが必要です');
    }

    await prisma.tag.delete({
      where: { id: Number(id) },
    });

    return Response.json(
      { message: 'タグを削除しました' },
      { status: 200 }
    );
  } catch (e) {
    if (e instanceof UnauthorizedError || e instanceof BadRequestError) {
      return Response.json(
        { errors: { error: e.message } },
        { status: e.status }
      );
    }
    return Response.json(
      { errors: { error: 'タグの削除に失敗しました' } },
      { status: 500 }
    );
  }
}
