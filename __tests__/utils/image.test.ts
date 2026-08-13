import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import { mkdir, writeFile } from 'fs/promises';
import { saveImage, saveImageToLocal } from '@/utils/image';
import { supabase } from '@/lib/supabase';

vi.mock('fs/promises', () => {
  const mkdir = vi.fn();
  const writeFile = vi.fn();
  return { mkdir, writeFile, default: { mkdir, writeFile } };
});

vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(),
    },
  },
}));

const createFile = (name = 'test.png', type = 'image/png') => {
  const content = new Uint8Array([1, 2, 3]);
  const file = new File([content], name, { type });
  // jsdom の File/Blob には arrayBuffer() が実装されていないためテスト用に補う
  Object.defineProperty(file, 'arrayBuffer', {
    value: async () => content.buffer,
  });
  return file;
};

describe('saveImageToLocal', () => {
  const originalCwd = process.cwd;

  beforeEach(() => {
    vi.resetAllMocks();
    process.cwd = vi.fn(() => '/app');
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
  });

  afterEach(() => {
    process.cwd = originalCwd;
    vi.restoreAllMocks();
  });

  it('保存に成功した場合、公開URLパスを返す', async () => {
    (mkdir as Mock).mockResolvedValue(undefined);
    (writeFile as Mock).mockResolvedValue(undefined);
    const file = createFile();

    const result = await saveImageToLocal(file, 'blogs/temp');

    expect(result).toBe('/blogs/temp/1700000000000_test.png');
    expect(mkdir).toHaveBeenCalledWith('/app/public/blogs/temp', { recursive: true });
    expect(writeFile).toHaveBeenCalledWith(
      '/app/public/blogs/temp/1700000000000_test.png',
      expect.any(Buffer)
    );
  });

  it('ディレクトリ作成に失敗した場合、nullを返す', async () => {
    (mkdir as Mock).mockRejectedValue(new Error('mkdir failed'));
    const file = createFile();

    const result = await saveImageToLocal(file, 'blogs/temp');

    expect(result).toBeNull();
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('ファイル書き込みに失敗した場合、nullを返す', async () => {
    (mkdir as Mock).mockResolvedValue(undefined);
    (writeFile as Mock).mockRejectedValue(new Error('write failed'));
    const file = createFile();

    const result = await saveImageToLocal(file, 'blogs/temp');

    expect(result).toBeNull();
  });
});

describe('saveImage', () => {
  const originalEnv = process.env.NEXT_PUBLIC_USE_SUPABASE_STORAGE;
  const originalCwd = process.cwd;

  beforeEach(() => {
    vi.resetAllMocks();
    process.cwd = vi.fn(() => '/app');
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
  });

  afterEach(() => {
    process.cwd = originalCwd;
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_USE_SUPABASE_STORAGE;
    } else {
      process.env.NEXT_PUBLIC_USE_SUPABASE_STORAGE = originalEnv;
    }
    vi.restoreAllMocks();
  });

  it('USE_SUPABASE_STORAGEがtrueでない場合、ローカル保存を行う', async () => {
    delete process.env.NEXT_PUBLIC_USE_SUPABASE_STORAGE;
    (mkdir as Mock).mockResolvedValue(undefined);
    (writeFile as Mock).mockResolvedValue(undefined);
    const file = createFile();

    const result = await saveImage(file, 'blogs/temp');

    expect(result).toBe('/blogs/temp/1700000000000_test.png');
    expect(supabase.storage.from).not.toHaveBeenCalled();
  });

  it('USE_SUPABASE_STORAGEがtrueの場合、Supabaseへアップロードして公開URLを返す', async () => {
    process.env.NEXT_PUBLIC_USE_SUPABASE_STORAGE = 'true';
    const upload = vi.fn().mockResolvedValue({ error: null });
    const getPublicUrl = vi
      .fn()
      .mockReturnValue({ data: { publicUrl: 'https://supabase.example.com/blog_bucket/test.png' } });
    (supabase.storage.from as Mock).mockReturnValue({ upload, getPublicUrl });
    const file = createFile();

    const result = await saveImage(file, 'blogs/temp');

    expect(result).toBe('https://supabase.example.com/blog_bucket/test.png');
    expect(supabase.storage.from).toHaveBeenCalledWith('blog_bucket');
    expect(upload).toHaveBeenCalledWith(
      '1700000000000_test.png',
      file,
      { cacheControl: '3600', upsert: false }
    );
    expect(mkdir).not.toHaveBeenCalled();
  });

  it('Supabaseアップロードでエラーが発生した場合、nullを返す', async () => {
    process.env.NEXT_PUBLIC_USE_SUPABASE_STORAGE = 'true';
    const upload = vi.fn().mockResolvedValue({ error: { message: 'upload failed' } });
    const getPublicUrl = vi.fn();
    (supabase.storage.from as Mock).mockReturnValue({ upload, getPublicUrl });
    const file = createFile();

    const result = await saveImage(file, 'blogs/temp');

    expect(result).toBeNull();
    expect(getPublicUrl).not.toHaveBeenCalled();
  });
});
