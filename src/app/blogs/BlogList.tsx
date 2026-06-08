import { getBlogs } from '@/lib/actions/blogs/getBlogs';
import BlogCard from './BlogCard';
import Pagination from './Pagination';

type Props = {
  isAdmin: boolean;
  page: number;
};

export default async function BlogList({ isAdmin, page }: Props) {
  const { blogs, totalPages } = await getBlogs({ isAdmin, page });

  if (blogs.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">記事がありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
      {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} />}
    </div>
  );
}
