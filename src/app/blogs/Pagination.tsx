import Link from 'next/link';

type Props = {
  currentPage: number;
  totalPages: number;
};

export default function Pagination({ currentPage, totalPages }: Props) {
  return (
    <div className="flex items-center justify-center gap-3 pt-4">
      {currentPage > 1 ? (
        <Link
          href={`/blogs?page=${currentPage - 1}`}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          前へ
        </Link>
      ) : (
        <span className="rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-400">
          前へ
        </span>
      )}
      <span className="text-sm text-slate-600">
        {currentPage} / {totalPages}
      </span>
      {currentPage < totalPages ? (
        <Link
          href={`/blogs?page=${currentPage + 1}`}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          次へ
        </Link>
      ) : (
        <span className="rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-400">
          次へ
        </span>
      )}
    </div>
  );
}
