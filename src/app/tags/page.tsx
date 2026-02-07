import { getTags } from "@/lib/actions/tags/getTags";
import TagsClient from "./TagsClient";

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">タグ管理</h1>
      <TagsClient initialTags={tags} />
    </div>
  );
}
