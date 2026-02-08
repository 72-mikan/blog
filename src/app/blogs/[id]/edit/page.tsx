import { Suspense } from 'react';
import BlogEditContent from '@/app/components/blogs/BlogEditContent';

interface BlogEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BlogEditPage({ params }: BlogEditPageProps) {
  const { id } = await params;
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded mb-8"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <BlogEditContent id={id} />
    </Suspense>
  );
}
