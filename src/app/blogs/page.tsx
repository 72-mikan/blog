import { getBlogs } from "@/lib/actions/blogs/getBlogs";
import BlogCard from "./BlogCard";

export default async function BlogPages() {
  const blogs = await getBlogs();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">ブログ一覧</h1>
          <p className="mt-2 text-slate-600">全ブログ記事を閲覧できます</p>
        </div>

        {blogs.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600">記事がありません</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
