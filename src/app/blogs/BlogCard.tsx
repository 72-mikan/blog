import Link from "next/link";
import Image from "next/image";
import type { Blog } from "@/types/blog";

type Props = {
  blog: Blog;
};

export default function BlogCard({ blog }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex gap-6">
        <div className="flex-shrink-0">
          <Image
            src={blog.tags[0]?.imagePath || '/tags/no-image.png'}
            alt={blog.title}
            width={60}
            height={60}
            className="rounded-lg object-cover"
            unoptimized
          />
        </div>

        <div className="flex-1">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <Link href={`/blogs/${blog.id}`}>
                <h2 className="text-xl font-semibold text-blue-600 hover:text-blue-700">
                  {blog.title}
                </h2>
              </Link>
            </div>
            {!blog.isPublic && (
              <span className="ml-4 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                非公開
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>{blog.user.name}</span>
              <span>{new Date(blog.createdAt).toLocaleDateString('ja-JP')}</span>
            </div>
            {blog.tags.length > 0 && (
              <div className="flex gap-2">
                {blog.tags.map((tag) => (
                  <span
                    key={tag.name}
                    className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
