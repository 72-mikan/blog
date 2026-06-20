type ActionState = {
  success: boolean;
  errors: {
    title?: string[];
    context?: string[];
    tags?: string[];
    error?: string;
  };
  formData?: {
    title?: string;
    tag?: string;
    context?: string;
  };
} | undefined;

type BlogFormFieldsProps = {
  state: ActionState;
  defaultTitle?: string;
  defaultTag?: string;
};

export default function BlogFormFields({ state, defaultTitle = '', defaultTag = '' }: BlogFormFieldsProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4">
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium text-slate-700">タイトル</label>
          <input
            id="title"
            type="text"
            name="title"
            placeholder="タイトルを入力してください"
            defaultValue={state?.formData?.title ?? defaultTitle}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {state?.errors?.title && state.errors.title.length > 0 && (
            state.errors.title.map((err) => (
              <p key={err} className="mt-2 text-xs text-red-600">{err}</p>
            ))
          )}
        </div>
        <div>
          <label htmlFor="tag" className="mb-2 block text-sm font-medium text-slate-700">タグ</label>
          <input
            id="tag"
            type="text"
            name="tag"
            placeholder="タグを入力（スペース区切り）"
            defaultValue={state?.formData?.tag ?? defaultTag}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {state?.errors?.tags && state.errors.tags.length > 0 && (
            state.errors.tags.map((err) => (
              <p key={err} className="mt-2 text-xs text-red-600">{err}</p>
            ))
          )}
        </div>
      </div>
      {state?.errors?.error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.errors.error}
        </div>
      )}
    </div>
  );
}
