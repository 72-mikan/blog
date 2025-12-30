import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ブログ一覧です。",
  description: "ブログ一覧が表示されます。",
};

// ダミーデータ
const articles = [
  {id: "1", title: "タイトル1"},
  {id: "2", title: "タイトル2"},
  {id: "3", title: "タイトル3"},
];

// 非同期関数内で待機
async function fetchArticles() {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  // throw new Error('エラーが発生');
  return articles;
}

export default async function BlogPages() {
  const articles = await fetchArticles();
  return (
    <div>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>{article.title}</li>
        )) }
      </ul>
    </div>
  );
}