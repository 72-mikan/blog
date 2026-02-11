import { describe, it, expect, vi, beforeEach } from 'vitest';
import dotenv from 'dotenv';
import { GET, DELETE } from '@/app/api/blogs/[id]/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import type { Mock } from 'vitest';

dotenv.config();

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findFirst: vi.fn() },
    context: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('GET /api/blogs/[id]', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('管理者なら非公開でも取得できる', async () => {
    (auth as Mock).mockResolvedValue({ user: { role: 'ADMIN' } });
    (prisma.context.findUnique as any).mockResolvedValue({
      id: 1,
      title: '非公開記事',
      context: '本文',
      isPublic: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      user: { id: 'user-1', name: 'ユーザー1' },
      tags: [{ name: 'tag1' }],
    });

    const request = new Request(`${process.env.URL}/api/blogs/1`, { method: 'GET' });
    const response = await GET(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.title).toBe('非公開記事');
  });

  it('非管理者は公開記事のみ取得できる', async () => {
    (auth as Mock).mockResolvedValue({ user: { role: 'USER' } });
    (prisma.context.findUnique as any).mockResolvedValue({
      id: 2,
      title: '公開記事',
      context: '本文',
      isPublic: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      user: { id: 'user-1', name: 'ユーザー1' },
      tags: [{ name: 'tag1' }],
    });

    const request = new Request(`${process.env.URL}/api/blogs/2`, { method: 'GET' });
    const response = await GET(request, { params: Promise.resolve({ id: '2' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.isPublic).toBe(true);
  });

  it('非管理者が非公開記事にアクセスすると403', async () => {
    (auth as Mock).mockResolvedValue({ user: { role: 'USER' } });
    (prisma.context.findUnique as any).mockResolvedValue({
      id: 3,
      title: '非公開記事',
      context: '本文',
      isPublic: false,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
      user: { id: 'user-1', name: 'ユーザー1' },
      tags: [{ name: 'tag1' }],
    });

    const request = new Request(`${process.env.URL}/api/blogs/3`, { method: 'GET' });
    const response = await GET(request, { params: Promise.resolve({ id: '3' }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.errors.error).toBe('このブログを閲覧する権限がありません。');
  });

  it('存在しない場合は404', async () => {
    (auth as Mock).mockResolvedValue({ user: { role: 'ADMIN' } });
    (prisma.context.findUnique as any).mockResolvedValue(null);

    const request = new Request(`${process.env.URL}/api/blogs/999`, { method: 'GET' });
    const response = await GET(request, { params: Promise.resolve({ id: '999' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.errors.error).toBe('ブログが見つかりません。');
  });
});

describe('DELETE /api/blogs/[id]', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('管理者なら削除できる', async () => {
    (auth as Mock).mockResolvedValue({ user: { id: 'user-1' } });
    (prisma.user.findFirst as any).mockResolvedValue({ id: 'user-1' });
    (prisma.context.findUnique as any).mockResolvedValue({ id: 1 });
    (prisma.context.delete as any).mockResolvedValue({ id: 1 });

    const request = new Request(`${process.env.URL}/api/blogs/1`, { method: 'DELETE' });
    const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) });
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe('ブログが削除されました。');
  });

  it('未ログインなら401', async () => {
    (auth as Mock).mockResolvedValue(null);

    const request = new Request(`${process.env.URL}/api/blogs/1`, { method: 'DELETE' });
    const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.errors.error).toBe('ログインが必要です。');
  });

  it('管理者でない場合は403', async () => {
    (auth as Mock).mockResolvedValue({ user: { id: 'user-1' } });
    (prisma.user.findFirst as any).mockResolvedValue(null);

    const request = new Request(`${process.env.URL}/api/blogs/1`, { method: 'DELETE' });
    const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.errors.error).toBe('管理者権限がありません。');
  });

  it('ブログが存在しない場合は400', async () => {
    (auth as Mock).mockResolvedValue({ user: { id: 'user-1' } });
    (prisma.user.findFirst as any).mockResolvedValue({ id: 'user-1' });
    (prisma.context.findUnique as any).mockResolvedValue(null);

    const request = new Request(`${process.env.URL}/api/blogs/1`, { method: 'DELETE' });
    const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors.error).toBe('ブログが見つかりません。');
  });
});
