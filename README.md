# Blog Application

ユーザー認証、タグ管理、ブログ記事管理機能を備えた Next.js ブログアプリケーションです。

## 🔐 アクセス情報

### 🌐 サイトアクセス

- デモ環境URL: https://blog-iota-one-76.vercel.app/

### 👤 ログイン情報（デモ）

| 区分 | メール | パスワード | 用途 |
|------|--------|------------|------|
| 管理ユーザー | test@example.com | test_pass | 記事作成・タグ管理など管理機能の確認 |
| 一般ユーザー | test_user@example.com | test_pass | 閲覧・一般ユーザー導線の確認 |

※ まず一般ユーザーで表示確認し、次に管理ユーザーで管理機能を確認するのがおすすめです。

## ✨ 主な機能

- **ユーザー認証**: NextAuth によるセッション管理（HTTPOnly Cookie）
- **タグ管理**: CRUD + 画像アップロード機能（Supabase / ローカルストレージ対応）
- **ブログ記事**: Markdown 対応、タグ関連付け、公開・非公開制御
- **ロール管理**: USER / ADMIN ロールのアクセス制御
- **テスト**: Vitest による包括的なユニットテスト

---

## 📚 API エンドポイント

### タグ API (`/api/tags`)
- **GET** - すべてのタグを取得
- **POST** - 新規タグ作成（FormData: name, image）
- **PUT** - タグ更新（FormData: id, name, image）
- **DELETE** - タグ削除（JSON: id）

### ブログ API (`/api/blogs`)
- **GET** - すべてのブログ記事を取得
- **POST** - 新規記事作成（JSON: title, context, tags[], isPublic）
- **PUT** - 記事更新（JSON: id, title, context, tags[], isPublic）
- **DELETE** - 記事削除（JSON: id）

---

##  認証フロー

1. メールとパスワードでログイン（NextAuth Credentials Provider）
2. API (`/api/auth/signIn`) でユーザーを認証
3. NextAuth がセッションを HTTPOnly Cookie に保存
4. ミドルウェアで Cookie から検証してアクセス制御

---

## 🖼️ 画像管理

- **Supabase**: クラウドストレージ（本番推奨）
- **ローカルストレージ**: ローカルファイルシステム（開発推奨）
- 環境変数 `NEXT_PUBLIC_USE_SUPABASE_STORAGE` で切り替え

## 📦 技術スタック

| 名前 | バージョン |
|-----|----------|
| Next.js | 15.5.4 |
| TypeScript | 5.0+ |
| Prisma | 6.19.0 |
| SQLite | - |
| NextAuth | 5.0.0-beta.30 |
| Tailwind CSS | 4.1.18 |
| Vitest | 4.0.16 |
| Supabase | 2.95.3 |

---

## 🧪 テスト

```bash
npm test
```

テスト対象：
- API エンドポイント（タグ・ブログ CRUD）
- Server Actions
- 画像保存ユーティリティ

---

## 🚨 トラブルシューティング

| 問題 | 解決方法 |
|------|--------|
| Supabase 環境変数エラー | `.env.local` に キーを設定するか、`NEXT_PUBLIC_USE_SUPABASE_STORAGE=false` でローカルストレージに切り替え |
| マイグレーションエラー | `npx prisma migrate reset --force` でリセット |
| 画像アップロード失敗 | FormData で送信しているか、`NEXT_PUBLIC_USE_SUPABASE_STORAGE` 設定を確認 |

---

## � 今後の実装予定

- [ ] **ソーシャルログイン**: GitHub / Google アカウントでのログイン（OAuth）
- [ ] **インタラクション機能**: いいね・コメント機能（ログインユーザー限定）
- [ ] **記事内画像**: ブログ記事投稿時に画像をアップロード

---

## �📝 ライセンス

個人プロジェクト