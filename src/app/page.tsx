import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { getHomeData } from "@/lib/actions/blogs/getHomeData";

const EXCERPT_LENGTH = 140;

export default async function Home() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const { latestBlogs: blogs, tags, recentCount } = await getHomeData();

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-blue-600">TECH BLOG</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">学びを残すブログ</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            開発で得た知識や実装メモを、あとで再利用できる形でストックするためのブログです。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/blogs"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              記事一覧へ
            </Link>
            <Link
              href="/about"
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              このブログについて
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_300px] lg:px-8">
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">新着記事</h2>
            <Link href="/blogs" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              すべて見る
            </Link>
          </div>

          {blogs.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
              まだ記事がありません。
            </div>
          ) : (
            <div className="space-y-4">
              {blogs.map((blog) => {
                const excerpt =
                  blog.context.length > EXCERPT_LENGTH
                    ? `${blog.context.slice(0, EXCERPT_LENGTH)}...`
                    : blog.context;

                return (
                  <article
                    key={blog.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{new Date(blog.createdAt).toLocaleDateString("ja-JP")}</span>
                      <span>•</span>
                      <span>{blog.user.name}</span>
                    </div>
                    <Link href={`/blogs/${blog.id}`}>
                      <h3 className="text-lg font-semibold text-slate-900 hover:text-blue-600">
                        {blog.title}
                      </h3>
                    </Link>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{excerpt}</p>
                    {blog.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {blog.tags.map((tag) => (
                          <span
                            key={`${blog.id}-${tag.name}`}
                            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                          >
                            <Image
                              src={tag.imagePath || "/tags/no-image.png"}
                              alt={tag.name}
                              width={14}
                              height={14}
                              className="rounded-full"
                              unoptimized
                            />
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">サイト情報</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">直近30日の投稿</dt>
                <dd className="font-semibold text-slate-900">{recentCount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">登録タグ</dt>
                <dd className="font-semibold text-slate-900">{tags.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">閲覧モード</dt>
                <dd className="font-semibold text-slate-900">{isAdmin ? "管理者" : "一般"}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">人気タグ</h3>
            {tags.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">タグがまだありません。</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href="/tags"
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </aside>
      </section>
    </main>
  );
}
