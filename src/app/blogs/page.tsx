import { Suspense } from 'react';
import { auth } from '@/auth';
import BlogList from './BlogList';
import BlogListSkeleton from './BlogListSkeleton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ブログ一覧 | Tech Blog',
  description: '開発で得た知識や実装メモを掲載しています',
};

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function BlogPages({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">ブログ一覧</h1>
          <p className="mt-2 text-slate-600">全ブログ記事を閲覧できます</p>
        </div>
        <Suspense fallback={<BlogListSkeleton />}>
          <BlogList isAdmin={isAdmin} page={page} />
        </Suspense>
      </div>
    </div>
  );
}
