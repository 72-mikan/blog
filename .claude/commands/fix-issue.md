---
description: 指定した issue 番号を確認し、修正・テスト・commit・push・PR作成までを行う
---

使い方: `/fix-issue <issue番号>`（例: `/fix-issue 42`）

以下の手順で issue #$ARGUMENTS に対応してください。

1. `gh issue view $ARGUMENTS` で issue の内容を確認する
2. 作業用ブランチ `fix/issue-$ARGUMENTS` を用意する
   - `git branch --list fix/issue-$ARGUMENTS` でブランチの存在を確認する
   - 既に存在する場合: `git checkout fix/issue-$ARGUMENTS` でそのブランチに切り替え、続きの修正を行う（development の再取得や再作成は行わない）
   - 存在しない場合: `git checkout development` → `git pull origin development` で development を最新化し、`git checkout -b fix/issue-$ARGUMENTS` で新規ブランチを作成する
3. CLAUDE.md の規約に沿って、issue の内容に対応する修正を行う。必要に応じてテストコードも実装する
   - 調査・実装の過程で、以下のいずれかに該当すると判断した場合は、そのまま実装を進めず一旦作業を中断する
     - DB構成の変更が必要な場合（`prisma/schema.prisma` の変更やマイグレーションが必要になるケース）
     - アプリの構造自体を大幅に変更する必要がある場合（ディレクトリ構成の変更や、複数レイヤーにまたがる大規模なリファクタリングが必要になるケース）
   - 該当する場合は `gh issue comment $ARGUMENTS --body "..."` で、必要な変更内容とその理由をissueにコメントしたうえで、状況をユーザーに報告し指示を仰ぐ。ユーザーから続行の許可を得てから実装を再開する
4. `npm run lint` と `npm run test` を実行する。失敗したら原因を調査して修正し、再度実行する
5. `/code-review medium` を実行し、変更内容をレビューする。指摘があれば手順3に戻って修正し、再度手順4・5を行う。このレビュー往復は最大3回までとし、3回を超えても解消しない場合はそこで作業を止め、指摘内容と状況を報告してユーザーの判断を仰ぐ
6. レビューで問題がなければ変更内容を確認したうえで `git add` → `git commit`（コミットメッセージに `#$ARGUMENTS` を含める）
7. `git push -u origin fix/issue-$ARGUMENTS` でリモートに push する
8. `gh pr create` で PR を作成する。base ブランチは development とし、本文に `Closes #$ARGUMENTS` を含めて issue と紐付ける

制約:
- force push・`git reset --hard`・`git clean` などの破壊的操作は行わない
- テストが失敗したままの状態では push しない
- `/code-review` は `ultra` を使わない（別課金のクラウド実行のため）。effort は `medium` 固定とする
- 各ステップの結果を簡潔に報告する

備考:
- 同一セッション内で複数の issue を連続処理する場合は、issue を切り替える直前に `/clear` でコンテキストをリセットするとトークン消費を抑えられる（このスキル内から自動実行はできないため、ユーザー側の運用ルールとする）
