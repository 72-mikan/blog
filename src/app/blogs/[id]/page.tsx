'use client';

import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import Link from 'next/link';
import { deleteBlogPost } from '@/lib/actions/blogs/delete';

interface Blog {
  id: number;
  title: string;
  context: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
  };
  tags: Array<{
    name: string;
  }>;
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const id = params.id as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = session?.user?.role === 'ADMIN';

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/blogs/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.errors?.error || 'ブログの取得に失敗しました');
        }
        
        const data = await response.json();
        setBlog(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('この記事を削除してもよろしいですか？')) {
      return;
    }

    startTransition(async () => {
      const result = await deleteBlogPost(parseInt(id));
      
      if (result?.success) {
        router.push('/blogs');
      } else {
        setError(result?.errors?.error || '削除中にエラーが発生しました');
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-center text-slate-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error || 'ブログが見つかりません'}
          </div>
          <Link href="/blogs" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
            ← ブログ一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/blogs" className="mb-6 inline-block text-blue-600 hover:text-blue-700">
          ← ブログ一覧に戻る
        </Link>

        <article className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          {/* ヘッダー */}
          <div className="mb-6 border-b border-slate-200 pb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900">{blog.title}</h1>
                <div className="mt-4 flex items-center gap-6 text-sm text-slate-600">
                  <span>{blog.user.name}</span>
                  <span>
                    公開日: {new Date(blog.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                  {blog.createdAt !== blog.updatedAt && (
                    <span>
                      更新日: {new Date(blog.updatedAt).toLocaleDateString('ja-JP')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {!blog.isPublic && (
                  <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 text-center">
                    非公開
                  </span>
                )}
                {isAdmin && (
                  <div className="flex gap-2">
                    <Link
                      href={`/blogs/${blog.id}/edit`}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                    >
                      編集
                    </Link>
                    <button
                      onClick={handleDelete}
                      disabled={isPending}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isPending ? '削除中...' : '削除'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* タグ */}
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

          {/* 本文 */}
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