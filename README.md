# Blog Application

## プロジェクト概要

Next.js App Router / Prisma / Auth.js / PostgreSQL を用いて構築した、フルスタックのブログアプリケーションです。
認証、記事 CRUD、タグ検索、画像アップロードなど、実務で求められる機能を一通り自作しています。
責務分離・拡張性・運用性を意識した設計を重視し、採用しています。

## デモ動画
https://github.com/user-attachments/assets/ccfcadf5-dc79-4121-a8a8-cb9cea8094ec

## アクセス情報

### サイトアクセス

- デモ環境URL: https://blog-iota-one-76.vercel.app/

#### 注意事項

- デモ環境は検証目的でご自由にご利用ください。
- デモ環境のデータは予告なく初期化される場合があります。
- **デモ環境のため、個人情報や機密情報の入力はお控えください。**

### ログイン情報（デモ）

| 区分 | メール | パスワード | 用途 |
|------|--------|------------|------|
| 管理ユーザー | test@example.com | test_pass | 記事作成・タグ管理など管理機能の確認 |
| 一般ユーザー | test_user@example.com | test_pass | 閲覧・一般ユーザー導線の確認 |

※ まず一般ユーザーで表示確認し、次に管理ユーザーで管理機能を確認するのがおすすめです。

## 主な機能

- **ユーザー認証**: NextAuth によるセッション管理（サインアップ・サインイン・サインアウト）
- **タグ管理**: CRUD + 画像アップロード機能（Supabase / ローカルストレージ対応）
- **ブログ記事**: Markdown 対応（GFM・改行プレビュー）、タグ関連付け、公開・非公開制御
- **ロール管理**: USER / ADMIN ロールによるアクセス制御
- **Server Actions**: ブログ・タグの CRUD 操作を Server Actions で実装
- **テスト**: Vitest + Testing Library による API・Server Actions・コンポーネントのテスト

---

## 技術スタック

| 名前 | バージョン |
|-----|----------|
| Next.js | 15.5.12 |
| React | 19.1.0 |
| TypeScript | 5.0+ |
| Prisma | 6.19.0 |
| PostgreSQL | - |
| NextAuth | 5.0.0-beta.30 |
| Tailwind CSS | 4.1.18 |
| Headless UI | 2.2.9 |
| Zod | 3.25.76 |
| Vitest | 4.0.16 |
| Supabase | 2.95.3 |

---

## パフォーマンス最適化

### Server Actions によるデータ操作

データの取得・更新は Server Actions で実装し、サーバー上で直接関数を呼び出すことでオーバーヘッドを削減しています。

- **ブログ**: 作成 / 取得 / 更新 / 削除 / ホームデータ取得
- **タグ**: 作成 / 取得 / 更新 / 削除
- **認証**: サインイン / サインアップ / サインアウト

### React Server Components（RSC）

ブログ一覧・詳細・タグ一覧などのデータ取得を伴うコンポーネントは Server Components として実装し、サーバー側でレンダリングしています。
クライアントに送信する JavaScript バンドルを最小化し、初期表示を高速化しています。

### Suspense + Streaming

`Suspense` と Skeleton UI を組み合わせ、データ取得中もページの静的部分を先行して表示します。
ユーザーにはローディング状態が即座にフィードバックされ、体感速度が向上します。

### オンデマンドキャッシュ再検証

データ更新時に `revalidatePath` で該当ページのキャッシュのみを無効化し、不要な再フェッチを防いでいます。

---

## 認証フロー

1. メールとパスワードでログイン（NextAuth Credentials Provider）
2. API (`/api/auth/signIn`) でユーザーを認証
3. NextAuth がセッションを HTTPOnly Cookie に保存
4. ミドルウェアで Cookie から検証してアクセス制御

---

## 画像管理

- **Supabase**: クラウドストレージ（本番推奨）
- **ローカルストレージ**: ローカルファイルシステム（開発推奨）
- 環境変数 `NEXT_PUBLIC_USE_SUPABASE_STORAGE` で切り替え

---

## テスト

```bash
npm test
```

テスト対象：
- API エンドポイント（タグ・ブログ CRUD）
- Server Actions（ブログ・タグ CRUD）
- コンポーネント（ブログ作成ページなど）

---

## トラブルシューティング

| 問題 | 解決方法 |
|------|--------|
| Supabase 環境変数エラー | `.env.local` にキーを設定するか、`NEXT_PUBLIC_USE_SUPABASE_STORAGE=false` でローカルストレージに切り替え |
| マイグレーションエラー | `npx prisma migrate reset --force` でリセット |
| 画像アップロード失敗 | FormData で送信しているか、`NEXT_PUBLIC_USE_SUPABASE_STORAGE` 設定を確認 |

---

## 今後の実装予定

- [ ] **ソーシャルログイン**: GitHub / Google アカウントでのログイン（OAuth）
- [ ] **インタラクション機能**: いいね・コメント機能（ログインユーザー限定）
- [ ] **記事内画像**: ブログ記事投稿時に画像をアップロード

---

## ライセンス

個人プロジェクト
