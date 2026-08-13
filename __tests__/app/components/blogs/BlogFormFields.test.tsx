import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BlogFormFields from '@/app/components/blogs/BlogFormFields';

// @vitest-environment jsdom

describe('BlogFormFields', () => {
  it('defaultTitle/defaultTagが入力欄に表示される', () => {
    render(<BlogFormFields state={undefined} defaultTitle="初期タイトル" defaultTag="tag1 tag2" />);

    expect((screen.getByLabelText('タイトル') as HTMLInputElement).value).toBe('初期タイトル');
    expect((screen.getByLabelText('タグ') as HTMLInputElement).value).toBe('tag1 tag2');
  });

  it('stateのformDataがdefaultTitle/defaultTagより優先される', () => {
    render(
      <BlogFormFields
        state={{ success: false, errors: {}, formData: { title: 'stateタイトル', tag: 'stateタグ' } }}
        defaultTitle="初期タイトル"
        defaultTag="tag1"
      />
    );

    expect((screen.getByLabelText('タイトル') as HTMLInputElement).value).toBe('stateタイトル');
    expect((screen.getByLabelText('タグ') as HTMLInputElement).value).toBe('stateタグ');
  });

  it('タイトルのエラーメッセージが表示される', () => {
    render(<BlogFormFields state={{ success: false, errors: { title: ['タイトルは必須です。'] } }} />);

    expect(screen.getByText('タイトルは必須です。')).toBeTruthy();
  });

  it('タグのエラーメッセージが表示される', () => {
    render(
      <BlogFormFields
        state={{ success: false, errors: { tags: ['少なくとも1つのタグを選択してください。'] } }}
      />
    );

    expect(screen.getByText('少なくとも1つのタグを選択してください。')).toBeTruthy();
  });

  it('汎用エラーメッセージが表示される', () => {
    render(<BlogFormFields state={{ success: false, errors: { error: 'API接続エラー' } }} />);

    expect(screen.getByText('API接続エラー')).toBeTruthy();
  });

  it('エラーがない場合はエラーメッセージが表示されない', () => {
    render(<BlogFormFields state={{ success: true, errors: {} }} />);

    expect(screen.queryByText('API接続エラー')).toBeNull();
  });
});
