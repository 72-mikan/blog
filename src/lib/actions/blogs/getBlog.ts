import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import type { BlogDetail } from '@/types/blog';

async function getBlog(id: number): Promise<BlogDetail | null> {
  const blog = await prisma.context.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      context: true,
      isPublic: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: { id: true, name: true },
      },
      tags: {
        select: { name: true },
      },
    },
  });

  if (!blog) return null;

  return {
    ...blog,
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
  };
}

const cachedGetBlog = unstable_cache(getBlog, ['blog-detail'], {
  revalidate: 60,
  tags: ['blogs'],
});

export { cachedGetBlog as getBlog };
