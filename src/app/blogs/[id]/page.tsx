import { notFound } from 'next/navigation';
import Link from 'next/link';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { auth } from '@/auth';
import { getBlog } from '@/lib/actions/blogs/getBlog';
import BlogActions from './BlogActions';

type BlogDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN';

  const blog = await getBlog(parseInt(id));

  if (!blog || (!blog.isPublic && !isAdmin)) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/blogs" className="mb-6 inline-block text-blue-600 hover:text-blue-700">
          ← ブログ一覧に戻る
        </Link>

        <article className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 border-b border-slate-200 pb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900">{blog.title}</h1>
                <div className="mt-4 flex items-center gap-6 text-sm text-slate-600">
                  <span>{blog.user.name}</span>
                  <span>公開日: {new Date(blog.createdAt).toLocaleDateString('ja-JP')}</span>
                  {blog.createdAt !== blog.updatedAt && (
                    <span>更新日: {new Date(blog.updatedAt).toLocaleDateString('ja-JP')}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {!blog.isPublic && (
                  <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-center text-xs font-medium text-red-800">
                    非公開
                  </span>
                )}
                {isAdmin && <BlogActions blogId={blog.id} />}
              </div>
            </div>
          </div>

          {blog.tags.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <span
                  key={tag.name}
                  className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="prose prose-sm max-w-none leading-relaxed prose-headings:mt-6 prose-headings:mb-4 prose-p:mb-4 prose-pre:bg-slate-900 prose-pre:text-slate-50">
            <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {blog.context}
            </Markdown>
          </div>
        </article>
      </div>
    </div>
  );
}
