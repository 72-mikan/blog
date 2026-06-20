import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

type BlogMarkdownPreviewProps = {
  markdown: string;
};

export default function BlogMarkdownPreview({ markdown }: BlogMarkdownPreviewProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <span className="text-sm font-semibold text-slate-700">プレビュー</span>
      </div>
      <div className="prose prose-sm max-w-none p-4 leading-snug prose-headings:mt-2 prose-headings:mb-1">
        <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>
          {markdown}
        </Markdown>
      </div>
    </div>
  );
}
