'use client';

import { useState } from 'react';

type BlogMarkdownEditorProps = {
  markdownState: string;
  setMarkdownState: (value: string) => void;
  isUploadingImage: boolean;
  imageUploadError: string | null;
  contextErrors: string[] | undefined;
  onDrop: (event: React.DragEvent<HTMLTextAreaElement>) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  publicState: string;
  setPublicState: (value: string) => void;
  defaultChecked?: boolean;
};

export default function BlogMarkdownEditor({
  markdownState,
  setMarkdownState,
  isUploadingImage,
  imageUploadError,
  contextErrors,
  onDrop,
  textareaRef,
  publicState,
  setPublicState,
  defaultChecked = false,
}: BlogMarkdownEditorProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  // 画像ファイルのアップロード処理を行う
  const handleDrop = (event: React.DragEvent<HTMLTextAreaElement>) => {
    setIsDragOver(false);
    onDrop(event);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <span className="text-sm font-semibold text-slate-700">Markdownエディタ</span>
        <div className="flex items-center gap-3">
          {isUploadingImage && (
            <span className="text-xs font-medium text-blue-600">画像アップロード中...</span>
          )}
          <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
            <input
              type="checkbox"
              id="hs-basic-usage"
              name="isPublic"
              className="peer sr-only"
              value="true"
              defaultChecked={defaultChecked}
              onChange={(e) => setPublicState(e.target.checked ? '公開' : '非公開')}
            />
            <span className="absolute inset-0 rounded-full bg-slate-200 transition peer-checked:bg-blue-600"></span>
            <span className="absolute left-0.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition peer-checked:translate-x-full"></span>
          </label>
          <span className="text-xs font-medium text-slate-600">{publicState}</span>
        </div>
      </div>
      <div className="p-4">
        <label htmlFor="comment" className="sr-only">本文</label>
        <textarea
          ref={textareaRef}
          value={markdownState}
          onChange={(e) => setMarkdownState(e.target.value)}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          name="context"
          id="comment"
          rows={22}
          className={`block w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
            isDragOver ? 'border-blue-400 ring-2 ring-blue-200' : 'border-slate-200'
          }`}
          placeholder="Write a context..."
          required
        />
        <p className="mt-2 text-xs text-slate-500">
          画像を本文エリアにドラッグ&ドロップするとアップロードされ、Markdown画像URLが挿入されます。
        </p>
        {imageUploadError && (
          <p className="mt-2 text-xs text-red-600">{imageUploadError}</p>
        )}
        {contextErrors && contextErrors.length > 0 && (
          contextErrors.map((err) => (
            <p key={err} className="mt-2 text-xs text-red-600">{err}</p>
          ))
        )}
      </div>
    </div>
  );
}
