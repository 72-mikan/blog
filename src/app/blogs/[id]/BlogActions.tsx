'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { deleteBlogPost } from '@/lib/actions/blogs/delete';

type BlogActionsProps = {
  blogId: number;
};

export default function BlogActions({ blogId }: BlogActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm('この記事を削除してもよろしいですか？')) return;

    startTransition(async () => {
      const result = await deleteBlogPost(blogId);
      if (result?.success) {
        router.push('/blogs');
      } else {
        setError(result?.errors?.error || '削除中にエラーが発生しました');
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <Link
          href={`/blogs/${blogId}/edit`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          編集
        </Link>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? '削除中...' : '削除'}
        </button>
      </div>
    </div>
  );
}
