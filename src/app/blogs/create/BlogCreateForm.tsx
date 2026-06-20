'use client';

import { useEffect, useState, useActionState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBlogPost, uploadBlogImageForCreate } from '@/lib/actions/blogs/create';
import BlogFormHeader from '@/app/components/blogs/BlogFormHeader';
import BlogFormFields from '@/app/components/blogs/BlogFormFields';
import BlogMarkdownEditor from '@/app/components/blogs/BlogMarkdownEditor';
import BlogMarkdownPreview from '@/app/components/blogs/BlogMarkdownPreview';

export default function BlogCreateForm() {
  const [markdownState, setMarkdownState] = useState('');
  const [publicState, setPublicState] = useState('非公開');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createBlogPost,
    undefined,
  );

  useEffect(() => {
    if (state?.success) {
      router.push('/blogs');
    }
  }, [state?.success, router]);

  useEffect(() => {
    if (state?.formData?.context !== undefined) {
      setMarkdownState(state.formData.context);
    }
  }, [state?.formData?.context]);

  const uploadImageAndInsertMarkdown = async (file: File) => {
    setImageUploadError(null);
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const result = await uploadBlogImageForCreate(formData);

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
          title="新規ブログ作成"
          description="タイトルとタグを入力し、本文はMarkdownで編集できます。"
          submitLabel="投稿する"
          pendingLabel="保存中..."
          isPending={isPending}
          isUploadingImage={isUploadingImage}
        />

        <div className="grid gap-6">
          <BlogFormFields state={state} />

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
            />
            <BlogMarkdownPreview markdown={markdownState} />
          </div>
        </div>
      </div>
    </form>
  );
}
