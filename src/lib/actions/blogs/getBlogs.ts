'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export type Blog = {
  id: number;
  title: string;
  context: string;
  isPublic: boolean;
  createdAt: Date;
  user: {
    name: string;
  };
  tags: Array<{
    name: string;
    imagePath?: string | null;
  }>;
};

export async function getBlogs(): Promise<Blog[]> {
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN';

  return prisma.context.findMany({
    where: isAdmin ? {} : { isPublic: true },
    select: {
      id: true,
      title: true,
      context: true,
      isPublic: true,
      createdAt: true,
      user: {
        select: { name: true },
      },
      tags: {
        select: {
          name: true,
          imagePath: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
