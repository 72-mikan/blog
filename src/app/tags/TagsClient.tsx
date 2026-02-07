'use client'

import { useState, FormEvent } from "react";

type Tag = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    contexts: number;
  };
};

type TagsClientProps = {
  initialTags: Tag[];
};

export default function TagsClient({ initialTags }: TagsClientProps) {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [newTagName, setNewTagName] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>("");

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!newTagName.trim()) {
      setError("タグ名を入力してください");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName }),
      });

      const data = await response.json();

      if (response.ok) {
        setTags([data, ...tags]);
        setNewTagName("");
        setError("");
      } else {
        setError(data.errors?.error || "タグの作成に失敗しました");
      }
    } catch (err) {
      setError("タグの作成に失敗しました");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditingValue(tag.name);
  };

  const handleUpdate = async (id: number) => {
    try {
      const response = await fetch('/api/tags', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editingValue }),
      });

      const data = await response.json();

      if (response.ok) {
        setTags(tags.map(tag => 
          tag.id === id ? { ...tag, name: editingValue } : tag
        ));
        setEditingId(null);
        setEditingValue("");
      } else {
        alert(data.errors?.error || "更新に失敗しました");
      }
    } catch (err) {
      alert("更新に失敗しました");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("このタグを削除しますか？")) {
      return;
    }

    try {
      const response = await fetch(`/api/tags?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTags(tags.filter(tag => tag.id !== id));
      } else {
        const data = await response.json();
        alert(data.errors?.error || "削除に失敗しました");
      }
    } catch (err) {
      alert("削除に失敗しました");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingValue("");
  };

  return (
    <div>
      {/* 新規登録フォーム */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">新規タグ作成</h2>
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="タグ名を入力"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isCreating}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isCreating ? "作成中..." : "作成"}
          </button>
        </form>
        {error && (
          <p className="mt-2 text-red-500 text-sm">{error}</p>
        )}
      </div>

      {/* タグ一覧 */}
      <div className="bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold p-6 border-b">タグ一覧</h2>
        <div className="p-6">
          {tags.length === 0 ? (
            <p className="text-gray-500 text-center py-8">タグがありません</p>
          ) : (
            <div className="space-y-3">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  {editingId === tag.id ? (
                    <>
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdate(tag.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        保存
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        キャンセル
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={tag.name}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded bg-white cursor-default read-only:bg-gray-200 read-only:opacity-80"
                      />
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        ({tag._count?.contexts ?? 0}件)
                      </span>
                      <button
                        onClick={() => handleEdit(tag)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        削除
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
