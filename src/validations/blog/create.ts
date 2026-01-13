import {z} from 'zod';

export const createBlogSchema = z.object({
  title: z.string()
    .min(1, { message: 'タイトルは必須です。' })
    .max(100, { message: 'タイトルは100文字以内である必要があります。' }),
  context: z.string()
    .min(1, { message: 'コンテキストは必須です。' }),
  tags: z.array(z.string())
    .min(1, { message: '少なくとも1つのタグを選択してください。' }),
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>;