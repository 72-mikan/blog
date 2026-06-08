import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import type { GetBlogsResult } from '@/types/blog';

export const PAGE_SIZE = 10;

type GetBlogsParams = {
  isAdmin: boolean;
  page: number;
};

async function getBlogs({ isAdmin, page }: GetBlogsParams): Promise<GetBlogsResult> {
  const where = isAdmin ? {} : { isPublic: true };

  const [blogs, total] = await Promise.all([
    prisma.context.findMany({
      where,
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
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.context.count({ where }),
  ]);

  return {
    blogs: blogs.map((blog) => ({ ...blog, createdAt: blog.createdAt.toISOString() })),
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

const cachedGetBlogs = unstable_cache(getBlogs, ['blogs-list'], {
  revalidate: 60,
  tags: ['blogs'],
});

export { cachedGetBlogs as getBlogs };
