export default function BlogListSkeleton() {
  return (
    <div className="grid gap-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-lg bg-slate-200" />
      ))}
    </div>
  );
}
