import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import BlogCreatePage from '@/app/blogs/create/page';

// @vitest-environment jsdom
let mockState: any;
let mockPending = false;
const mockAction = vi.fn();

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return {
    ...actual,
    useActionState: () => [mockState, mockAction, mockPending],
  };
});

vi.mock("@/lib/actions/blogs/create", () => ({
  createBlogPost: vi.fn(),
}));

describe('BlogCreatePage', () => {
  beforeEach(() => {
    mockPending = false;
    mockState = {
      success: false,
      errors: {
        title: 'タイトルは必須です。',
        tags: '少なくとも1つのタグを選択してください。',
        error: 'API接続エラー',
      },
      formData: {
        title: 'タイトル',
        tag: 'tag1 tag2',
        context: '本文',
      },
    };
  });

  it('エラーメッセージが表示される', () => {
    render(<BlogCreatePage />);

    expect(screen.getByText('タイトルは必須です。')).toBeTruthy();
    expect(screen.getByText('少なくとも1つのタグを選択してください。')).toBeTruthy();
    expect(screen.getByText('API接続エラー')).toBeTruthy();
  });
});
