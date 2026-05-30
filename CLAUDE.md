# CLAUDE.md

## プロジェクト概要

Next.js 15 + React 19 を使ったブログアプリケーション。認証機能付きで、ブログ記事の作成・編集・削除・タグ管理などの機能を持つ。

## 技術スタック

- **フレームワーク:** Next.js 15 (App Router)
- **UI:** React 19, Tailwind CSS v4, Headless UI
- **言語:** TypeScript
- **DB:** PostgreSQL (Prisma ORM, Supabase)
- **認証:** next-auth v5 (beta)
- **バリデーション:** Zod
- **テスト:** Vitest, Testing Library

## ディレクトリ構成

```
src/
├── app/                        # Next.js App Router
│   ├── (public)/               # 認証不要の画面 (signin, signup)
│   ├── (private)/              # 認証必要な画面 (将来拡張用)
│   ├── api/                    # API Routes
│   ├── components/             # 複数箇所で使う共通コンポーネント
│   │   ├── blogs/
│   │   └── layouts/
│   ├── blogs/                  # ブログ関連ページ
│   ├── tags/                   # タグ関連ページ
│   └── [その他ページ]/
├── class/                      # カスタムクラス (エラークラスなど)
├── constants/                  # 定数
├── interface/                  # 型定義 (type に統一予定)
├── lib/
│   └── actions/                # Server Actions
├── types/                      # 型定義 (外部ライブラリの拡張など)
├── utils/                      # ユーティリティ関数
├── validations/                # Zod スキーマ
├── auth.ts
├── auth.config.ts
└── middleware.ts
```

### ディレクトリ配置ルール

- ルーティングに関係のないフォルダー (`lib`, `utils`, `validations` など) は `app` と同階層に配置する（現在は小規模開発のため）
- 複数箇所で使うコンポーネントは `app/components/` 配下に配置する
- 認証不要の画面は `(public)/`、認証必要な画面は `(private)/` で管理する（Route Group）

## ファイル命名規則

| 対象 | 命名規則 | 例 |
|------|----------|-----|
| `app/` 配下のルーティングディレクトリ | ケバブケース | `user-profile/`, `search-results/` |
| コンポーネントファイル | アッパーキャメルケース | `UserProfile.tsx`, `SearchForm.tsx` |
| その他のディレクトリ・ファイル | キャメルケース | `fetchUser.ts`, `userSchema.ts` |

## コンポーネント設計

### 単一責任の原則

各レイヤーの責任を明確に分離する。

| 関心 | 配置場所 |
|------|----------|
| UI 表示 | コンポーネント内 |
| データ取得・更新 | APIクライアント / Server Actions |
| 状態管理・副作用・ビジネスロジック | カスタムフック |
| 純粋ロジック（計算・変換など） | ユーティリティ関数 |

### 行数の目安

コンポーネントの可読性と保守性を維持するための基準。

| 行数 | 目標割合 | 備考 |
|------|----------|------|
| 1〜100行 | 70〜80% | ゴールデンゾーン。多くのコンポーネントはここに収める |
| 101〜200行 | 15〜25% | 複雑な UI（フォーム・モーダル・詳細画面など） |
| 201〜300行 | 0〜5% | 外れ値扱い。レビュー時に分割候補を確認 |
| 300行超 | 0% | 原則禁止。発生したら即分割を検討 |

### 分割トリガー

以下のいずれかに該当したらコンポーネント・フックの分割を検討する。

| 条件 | 対応方針 |
|------|----------|
| 条件分岐後の HTML が 30 行以上 | 条件分岐ごとにコンポーネントを分割 |
| 同系 UI の繰り返し（リスト行・カードなど） | 繰り返し部分をコンポーネント化 |
| Hook 呼び出しが 6 個以上 | 関連する内容をカスタムフックとして切り出し |
| 関連ロジックだけで 30〜40 行以上 | カスタムフックまたはユーティリティ関数に切り出し |
| `onClick` などのイベントハンドラが 5 個以上 | カスタムフックまたはユーティリティ関数に切り出し |

## TypeScript 型定義ルール

型定義は **`type` に統一する**。`interface` は使わない。

**理由:**

- React / Next.js ではユニオン型を頻繁に使うが、`type` の方が自然に表現できる
- 関数コンポーネント中心の開発のため、クラス継承 (`interface` の extends) を必要とするケースがほぼない
- `interface` は同名定義が自動マージされるため、意図しない型の拡張が発生するリスクがある。`type` は重複定義でコンパイルエラーになるため安全

```ts
// Bad
interface UserProps {
  name: string;
}

// Good
type UserProps = {
  name: string;
};
```

型定義ファイルは `src/interface/` に配置しているが、将来的に `src/types/` へ統合・整理する方針。

## 開発コマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run lint     # ESLint
npm run test     # Vitest でテスト実行
```

## DB・スキーマ

Prisma スキーマは `prisma/schema.prisma`。マイグレーションは以下で実行。

```bash
npx prisma migrate dev   # 開発環境でマイグレーション適用
npx prisma generate      # クライアント生成 (src/generated/prisma/ に出力)
```

## 認証

next-auth v5 (beta) を使用。`src/auth.ts` と `src/auth.config.ts` で設定。ミドルウェア (`src/middleware.ts`) で全ルートに認証チェックを適用し、`(public)/` 配下は認証不要として扱う。

## バリデーション

入力値のバリデーションは Zod を使い `src/validations/` に配置する。Server Actions でもバリデーションを実施する。

## エラーハンドリング

カスタムエラークラスは `src/class/error/` に配置。種類は以下の通り。

- `ApiConnectError` — 外部 API 接続エラー
- `BadRequestError` — 不正なリクエスト
- `ForbiddenError` — 権限なし
- `UnauthorizedError` — 未認証
