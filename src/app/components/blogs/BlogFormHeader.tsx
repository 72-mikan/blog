type BlogFormHeaderProps = {
  title: string;
  description: string;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  isUploadingImage: boolean;
};

export default function BlogFormHeader({
  title,
  description,
  submitLabel,
  pendingLabel,
  isPending,
  isUploadingImage,
}: BlogFormHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <button
        type="submit"
        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending || isUploadingImage}
      >
        {isPending ? pendingLabel : submitLabel}
      </button>
    </div>
  );
}
