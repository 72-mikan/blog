import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createRef } from 'react';
import BlogMarkdownEditor from '@/app/components/blogs/BlogMarkdownEditor';

// @vitest-environment jsdom

describe('BlogMarkdownEditor', () => {
  const setup = (overrides: Partial<Parameters<typeof BlogMarkdownEditor>[0]> = {}) => {
    const setMarkdownState = vi.fn();
    const setPublicState = vi.fn();
    const onDrop = vi.fn();
    const textareaRef = createRef<HTMLTextAreaElement>();

    render(
      <BlogMarkdownEditor
        markdownState="本文"
        setMarkdownState={setMarkdownState}
        isUploadingImage={false}
        imageUploadError={null}
        contextErrors={undefined}
        onDrop={onDrop}
        textareaRef={textareaRef}
        publicState="非公開"
        setPublicState={setPublicState}
        {...overrides}
      />
    );

    return { setMarkdownState, setPublicState, onDrop };
  };

  it('markdownStateが本文エリアに表示される', () => {
    setup();

    expect((screen.getByPlaceholderText('Write a context...') as HTMLTextAreaElement).value).toBe('本文');
  });

  it('本文を入力するとsetMarkdownStateが呼ばれる', () => {
    const { setMarkdownState } = setup();

    fireEvent.change(screen.getByPlaceholderText('Write a context...'), { target: { value: '更新後' } });

    expect(setMarkdownState).toHaveBeenCalledWith('更新後');
  });

  it('isUploadingImageがtrueの場合、アップロード中の表示になる', () => {
    setup({ isUploadingImage: true });

    expect(screen.getByText('画像アップロード中...')).toBeTruthy();
  });

  it('imageUploadErrorが表示される', () => {
    setup({ imageUploadError: '画像のアップロードに失敗しました。' });

    expect(screen.getByText('画像のアップロードに失敗しました。')).toBeTruthy();
  });

  it('contextErrorsが表示される', () => {
    setup({ contextErrors: ['本文は必須です。'] });

    expect(screen.getByText('本文は必須です。')).toBeTruthy();
  });

  it('publicStateが表示される', () => {
    setup({ publicState: '公開' });

    expect(screen.getByText('公開')).toBeTruthy();
  });

  it('公開チェックボックスを切り替えるとsetPublicStateが呼ばれる', () => {
    const { setPublicState } = setup();

    fireEvent.click(screen.getByRole('checkbox'));

    expect(setPublicState).toHaveBeenCalledWith('公開');
  });

  it('本文エリアにドロップするとonDropが呼ばれる', () => {
    const { onDrop } = setup();

    fireEvent.drop(screen.getByPlaceholderText('Write a context...'));

    expect(onDrop).toHaveBeenCalled();
  });
});
