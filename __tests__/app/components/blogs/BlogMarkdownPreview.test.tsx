import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BlogMarkdownPreview from '@/app/components/blogs/BlogMarkdownPreview';

// @vitest-environment jsdom

describe('BlogMarkdownPreview', () => {
  it('プレビュー見出しが表示される', () => {
    render(<BlogMarkdownPreview markdown="" />);

    expect(screen.getByText('プレビュー')).toBeTruthy();
  });

  it('Markdownの見出しがHTMLに変換されて表示される', () => {
    render(<BlogMarkdownPreview markdown="# 見出し" />);

    expect(screen.getByRole('heading', { level: 1, name: '見出し' })).toBeTruthy();
  });

  it('テーブルなどのGFM記法が表示される', () => {
    render(<BlogMarkdownPreview markdown={'| a | b |\n| --- | --- |\n| 1 | 2 |'} />);

    expect(screen.getByRole('table')).toBeTruthy();
  });
});
