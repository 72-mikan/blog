import {z} from 'zod';

export const signUpSchema = z.object({
  name: z.string()
    .min(1, { message: '名前は必須です。' })
    .max(30, { message: '名前は30文字以内である必要があります。' }),
  email: z.string()
    .min(1, { message: 'メールアドレスは必須です。' })
    .email({ message: '有効なメールアドレスを入力してください。' }),
  password: z.string()
    .min(6, { message: 'パスワードは6文字以上である必要があります。' }),
});

export type signUpInput = z.infer<typeof signUpSchema>;