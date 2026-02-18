import { auth } from '@/auth';
import { saveImage } from '@/utils/image';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        { errors: { error: '認証が必要です。' } },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const imageFile = formData.get('image');

    if (!(imageFile instanceof File)) {
      return Response.json(
        { errors: { error: '画像ファイルを選択してください。' } },
        { status: 400 }
      );
    }

    if (!imageFile.type.startsWith('image/')) {
      return Response.json(
        { errors: { error: '画像ファイルのみアップロードできます。' } },
        { status: 400 }
      );
    }

    if (imageFile.size > MAX_IMAGE_SIZE) {
      return Response.json(
        { errors: { error: '画像サイズは5MB以下にしてください。' } },
        { status: 400 }
      );
    }
    const imagePath = await saveImage(imageFile, 'blogs/temp');

    if (!imagePath) {
      return Response.json(
        { errors: { error: '画像の保存に失敗しました。' } },
        { status: 500 }
      );
    }

    return Response.json({ url: imagePath }, { status: 200 });
  } catch (error) {
    return Response.json(
      { errors: { error: 'サーバーエラーが発生しました。' } },
      { status: 500 }
    );
  }
}
