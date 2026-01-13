import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/blog/route';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/jwt', () => ({
  verifyToken: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    tag: { findMany: vi.fn() },
    context: { create: vi.fn() },
  },
}));


describe('POST /api/blog', () => {
  describe('正常系のテスト', () => {
    
  });
});