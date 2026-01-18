import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Context } from '@/interface/context';
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  const data: Context = await req.json();

  // tokenの検証
    const devodeToken =  data.token ? await verifyToken(data.token) : '';
    if (!devodeToken) {
      throw new Error('Invalid token');
    }

  try {
    await prisma.context.create({
      data: {
        title: data.title,
        context: data.context,
        isPublic: data.isPublic,
        user: {
          connect: { id: devodeToken.payload.sub }, // 投稿者を紐づける
        },
        tags: {
          connectOrCreate: data.tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
    });

  } catch (e) {
    console.error('ブログ作成エラー', e);
    return new Response('Error creating blog post', { status: 500 });
  }
  return new Response('Hello, blog route!')
}