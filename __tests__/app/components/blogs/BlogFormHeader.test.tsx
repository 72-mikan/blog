import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BlogFormHeader from '@/app/components/blogs/BlogFormHeader';

// @vitest-environment jsdom

describe('BlogFormHeader', () => {
  it('タイトルと説明文が表示される', () => {
    render(
      <BlogFormHeader
        title="記事作成"
        description="新しい記事を作成します"
        submitLabel="投稿"
        pendingLabel="投稿中..."
        isPending={false}
        isUploadingImage={false}
      />
    );

    expect(screen.getByText('記事作成')).toBeTruthy();
    expect(screen.getByText('新しい記事を作成します')).toBeTruthy();
  });

  it('通常時はsubmitLabelを表示し、ボタンは有効になる', () => {
    render(
      <BlogFormHeader
        title="t"
        description="d"
        submitLabel="投稿"
        pendingLabel="投稿中..."
        isPending={false}
        isUploadingImage={false}
      />
    );

    const button = screen.getByRole('button') as HTMLButtonElement;
    expect(button.textContent).toBe('投稿');
    expect(button.disabled).toBe(false);
  });

  it('isPendingがtrueの場合、pendingLabelを表示しボタンが無効になる', () => {
    render(
      <BlogFormHeader
        title="t"
        description="d"
        submitLabel="投稿"
        pendingLabel="投稿中..."
        isPending={true}
        isUploadingImage={false}
      />
    );

    const button = screen.getByRole('button') as HTMLButtonElement;
    expect(button.textContent).toBe('投稿中...');
    expect(button.disabled).toBe(true);
  });

  it('isUploadingImageがtrueの場合、ボタンが無効になる', () => {
    render(
      <BlogFormHeader
        title="t"
        description="d"
        submitLabel="投稿"
        pendingLabel="投稿中..."
        isPending={false}
        isUploadingImage={true}
      />
    );

    const button = screen.getByRole('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.textContent).toBe('投稿');
  });
});
