'use client';

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { useEffect, useState, useActionState } from 'react';
import { updateBlogPost } from '@/lib/actions/blogs/update';
import { useRouter } from 'next/navigation';

interface BlogEditFormProps {
  blog: {
    id: number;
    title: string;
    context: string;
    isPublic: boolean;
    tags: Array<{ name: string }>;
  };
}

export default function BlogEditForm({ blog }: BlogEditFormProps) {
  const [markdownState, setMarkdownState] = useState(blog.context);
  const [publicState, setPublicState] = useState(blog.isPublic ? '公開' : '非公開');
  const router = useRouter();
  
  const [state, formAction, isPending] = useActionState(
    (state: any, formData: FormData) => updateBlogPost(blog.id, state, formData),
    undefined,
  );

  const errorMessage = state;

  useEffect(() => {
    if (state?.success) {
      router.push(`/blogs/${blog.id}`);
    }
  }, [state?.success, router, blog.id]);

  // エラー時に入力値を保持
  useEffect(() => {
    if (state?.formData?.context) {
      setMarkdownState(state.formData.context);
    }
  }, [state?.formData?.context]);

  return (
    <form action={formAction} className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">ブログ編集</h1>
            <p className="mt-1 text-sm text-slate-500">タイトルとタグを編集し、本文はMarkdownで編集できます。</p>
          </div>
          <button
            type="submit"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
          >
            {isPending ? '更新中...' : '更新する'}
          </button>
        </div>

        <div className="grid gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4">
              <div>
                <label htmlFor="title" className="mb-2 block text-sm font-medium text-slate-700">タイトル</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  placeholder="タイトルを入力してください"
                  defaultValue={state?.formData?.title ?? blog.title}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {state?.errors?.title && (
                  <p className="mt-2 text-xs text-red-600">{state.errors.title}</p>
                )}
              </div>
              <div>
                <label htmlFor="tag" className="mb-2 block text-sm font-medium text-slate-700">タグ</label>
                <input
                  id="tag"
                  type="text"
                  name="tag"
                  placeholder="タグを入力（スペース区切り）"
                  defaultValue={state?.formData?.tag ?? blog.tags.map((t) => t.name).join(' ')}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                {state?.errors?.tags && (
                  <p className="mt-2 text-xs text-red-600">{state.errors.tags}</p>
                )}
              </div>
            </div>
            {state?.errors?.error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {state.errors.error}
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Editor */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <span className="text-sm font-semibold text-slate-700">Markdownエディタ</span>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
                    <input
                      type="checkbox"
                      id="hs-basic-usage"
                      name="isPublic"
                      className="peer sr-only"
                      value="true"
                      defaultChecked={blog.isPublic}
                      onChange={(e) => setPublicState(e.target.checked ? '公開' : '非公開')}
                    />
                    <span className="absolute inset-0 rounded-full bg-slate-200 transition peer-checked:bg-blue-600"></span>
                    <span className="absolute left-0.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition peer-checked:translate-x-full"></span>
                  </label>
                  <span className="text-xs font-medium text-slate-600">{publicState}</span>
                </div>
              </div>
              <div className="p-4">
                <label htmlFor="context" className="sr-only">本文</label>
                <textarea
                  id="context"
                  name="context"
                  value={markdownState}
                  onChange={(e) => setMarkdownState(e.target.value)}
                  placeholder="Markdownで本文を入力してください"
                  rows={22}
                  className="block w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-3">
                <span className="text-sm font-semibold text-slate-700">プレビュー</span>
              </div>
              <div className="prose prose-sm max-w-none p-4 leading-snug prose-headings:mt-2 prose-headings:mb-1">
                <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {markdownState}
                </Markdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
