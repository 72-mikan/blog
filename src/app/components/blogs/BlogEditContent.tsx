import { prisma } from '@/lib/prisma';
import BlogEditForm from './BlogEditForm';
import { notFound } from 'next/navigation';

interface BlogEditContentProps {
  id: string;
}

export default async function BlogEditContent({ id }: BlogEditContentProps) {
  const blog = await prisma.context.findUnique({
    where: { id: Number(id) },
    include: {
      tags: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!blog) {
    notFound();
  }

  return (
    <BlogEditForm
      blog={{
        id: blog.id,
        title: blog.title,
        context: blog.context,
        isPublic: blog.isPublic,
        tags: blog.tags,
      }}
    />
  );
}
