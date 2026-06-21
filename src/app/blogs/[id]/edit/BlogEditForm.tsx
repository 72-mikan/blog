'use client';

import { useEffect, useState, useActionState, useRef } from 'react';
import { updateBlogPost, uploadBlogImageForUpdate } from '@/lib/actions/blogs/update';
import { useRouter } from 'next/navigation';
import { normalizeMarkdown } from '@/utils/markdown';
import BlogFormHeader from '@/app/components/blogs/BlogFormHeader';
import BlogFormFields from '@/app/components/blogs/BlogFormFields';
import BlogMarkdownEditor from '@/app/components/blogs/BlogMarkdownEditor';
import BlogMarkdownPreview from '@/app/components/blogs/BlogMarkdownPreview';

type BlogEditFormProps = {
  blog: {
    id: number;
    title: string;
    context: string;
    isPublic: boolean;
    tags: Array<{ name: string }>;
  };
};

type UpdateBlogPostState = Awaited<ReturnType<typeof updateBlogPost>>;

export default function BlogEditForm({ blog }: BlogEditFormProps) {
  const [markdownState, setMarkdownState] = useState(blog.context);
  const [publicState, setPublicState] = useState(blog.isPublic ? '公開' : '非公開');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    (state: UpdateBlogPostState, formData: FormData) => updateBlogPost(blog.id, state, formData),
    undefined,
  );

  useEffect(() => {
    if (state?.success) {
      router.push(`/blogs/${blog.id}`);
    }
  }, [state?.success, router, blog.id]);

  useEffect(() => {
    if (state?.formData?.context) {
      setMarkdownState(state.formData.context);
    }
  }, [state?.formData?.context]);

  const uploadImageAndInsertMarkdown = async (file: File) => {
    setImageUploadError(null);
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const result = await uploadBlogImageForUpdate(formData);

      if (!result.success || !result.url) {
        throw new Error(result.error || '画像アップロードに失敗しました。');
      }

      const imageUrl = result.url;
      const textarea = textareaRef.current;

      if (!textarea) {
        setMarkdownState(`${markdownState}\n![image](${imageUrl})\n`);
        return;
      }

      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      const markdownImage = `![image](${imageUrl})`;

      setMarkdownState(
        markdownState.slice(0, selectionStart) +
        markdownImage +
        markdownState.slice(selectionEnd)
      );

      requestAnimationFrame(() => {
        const nextCursor = selectionStart + markdownImage.length;
        textarea.focus();
        textarea.setSelectionRange(nextCursor, nextCursor);
      });
    } catch (error) {
      setImageUploadError(
        error instanceof Error ? error.message : '画像アップロード中にエラーが発生しました。'
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDropImage = async (event: React.DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault();

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    await uploadImageAndInsertMarkdown(file);
  };

  return (
    <form action={formAction} className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <BlogFormHeader
          title="ブログ編集"
          description="タイトルとタグを編集し、本文はMarkdownで編集できます。"
          submitLabel="更新する"
          pendingLabel="更新中..."
          isPending={isPending}
          isUploadingImage={isUploadingImage}
        />

        <div className="grid gap-6">
          <BlogFormFields
            state={state}
            defaultTitle={blog.title}
            defaultTag={blog.tags.map((t) => t.name).join(' ')}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <BlogMarkdownEditor
              markdownState={markdownState}
              setMarkdownState={setMarkdownState}
              isUploadingImage={isUploadingImage}
              imageUploadError={imageUploadError}
              contextErrors={state?.errors?.context}
              onDrop={handleDropImage}
              textareaRef={textareaRef}
              publicState={publicState}
              setPublicState={setPublicState}
              defaultChecked={blog.isPublic}
            />
            <BlogMarkdownPreview markdown={normalizeMarkdown(markdownState)} />
          </div>
        </div>
      </div>
    </form>
  );
}
