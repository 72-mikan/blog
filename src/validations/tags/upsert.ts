import { z } from 'zod';

export const upsertTagSchema = z.object({
  name: z.string()
    .min(1, { message: 'タグ名を入力してください' })
    .max(50, { message: 'タグ名は50文字以内である必要があります' }),
});

export type UpsertTagInput = z.infer<typeof upsertTagSchema>;
