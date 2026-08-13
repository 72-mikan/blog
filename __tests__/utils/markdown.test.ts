import { describe, it, expect } from 'vitest';
import { normalizeMarkdown } from '@/utils/markdown';

describe('normalizeMarkdown', () => {
  it('シングルクォート3つのコードフェンスをバッククォート3つに変換する', () => {
    const input = "'''\nconst a = 1;\n'''";

    const result = normalizeMarkdown(input);

    expect(result).toBe('```\nconst a = 1;\n```');
  });

  it('言語指定付きのシングルクォートコードフェンスを変換する', () => {
    const input = "'''typescript\nconst a = 1;\n'''";

    const result = normalizeMarkdown(input);

    expect(result).toBe('```typescript\nconst a = 1;\n```');
  });

  it('全角バッククォート3つを半角バッククォート3つに変換する', () => {
    const input = '｀｀｀\nconst a = 1;\n｀｀｀';

    const result = normalizeMarkdown(input);

    expect(result).toBe('```\nconst a = 1;\n```');
  });

  it('言語指定付きの全角バッククォートコードフェンスを変換する', () => {
    const input = '｀｀｀js\nconst a = 1;\n｀｀｀';

    const result = normalizeMarkdown(input);

    expect(result).toBe('```js\nconst a = 1;\n```');
  });

  it('複数箇所のコードフェンスをまとめて変換する', () => {
    const input = "'''js\ncode1\n'''\n\n｀｀｀ts\ncode2\n｀｀｀";

    const result = normalizeMarkdown(input);

    // 閉じフェンス直後の空行は \s* にマッチして詰められる（既存の挙動）
    expect(result).toBe('```js\ncode1\n```\n```ts\ncode2\n```');
  });

  it('既に正しいバッククォートのコードフェンスは変更しない', () => {
    const input = '```js\nconst a = 1;\n```';

    const result = normalizeMarkdown(input);

    expect(result).toBe(input);
  });

  it('コードフェンス以外の本文は変更しない', () => {
    const input = '# タイトル\n\n本文テキストです。';

    const result = normalizeMarkdown(input);

    expect(result).toBe(input);
  });

  it('空文字列を渡した場合は空文字列を返す', () => {
    const result = normalizeMarkdown('');

    expect(result).toBe('');
  });

  it('行末に空白があるコードフェンスも変換する', () => {
    const input = "'''js   \ncode\n'''";

    const result = normalizeMarkdown(input);

    expect(result).toBe('```js\ncode\n```');
  });
});
