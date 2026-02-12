'use client';

import type { Metadata } from "next";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Blog {
  id: number;
  title: string;
  context: string;
  isPublic: boolean;
  createdAt: string;
  user: {
    name: string;
  };
  tags: Array<{
    name: string;
    imagePath?: string | null;
  }>;
}

export default function BlogPages() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blogs');
        if (!response.ok) {
          throw new Error('ブログ一覧の取得に失敗しました');
        }
        const data = await response.json();
        setBlogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-center text-slate-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">ブログ一覧</h1>
          <p className="mt-2 text-slate-600">全ブログ記事を閲覧できます</p>
        </div>

        {blogs.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600">記事がありません</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex gap-6">
                  {/* 左側の画像 */}
                  <div className="flex-shrink-0">
                    <Image
                      src={blog.tags[0]?.imagePath || '/tags/no-image.png'}
                      alt={blog.title}
                      width={60}
                      height={60}
                      className="rounded-lg object-cover"
                      unoptimized
                    />
                  </div>

                  {/* 右側のコンテンツ */}
                  <div className="flex-1">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <Link href={`/blogs/${blog.id}`}>
                          <h2 className="text-xl font-semibold text-blue-600 hover:text-blue-700">
                            {blog.title}
                          </h2>
                        </Link>
                      </div>
                      {!blog.isPublic && (
                        <span className="ml-4 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                          非公開
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{blog.user.name}</span>
                        <span>
                          {new Date(blog.createdAt).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                      {blog.tags.length > 0 && (
                        <div className="flex gap-2">
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
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}