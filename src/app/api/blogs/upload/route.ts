import { saveImage } from '@/utils/image';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const traceId = `upload-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    console.info(`[blogs/upload][${traceId}] POST処理を開始しました`);

    const contentType = req.headers.get('content-type') ?? '';
    console.info(`[blogs/upload][${traceId}] Content-Type: ${contentType || '(empty)'}`);

    if (!contentType.toLowerCase().startsWith('multipart/form-data')) {
      console.warn(`[blogs/upload][${traceId}] Content-Typeがmultipart/form-dataではありません`);
      return Response.json(
        { errors: { error: 'リクエスト形式が不正です。multipart/form-dataで送信してください。' } },
        { status: 400 }
      );
    }

    if (!contentType.toLowerCase().includes('boundary=')) {
      console.warn(`[blogs/upload][${traceId}] boundaryが見つかりません`);
      return Response.json(
        { errors: { error: 'multipart/form-dataのboundaryが不足しています。' } },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    console.info(`[blogs/upload][${traceId}] formDataの解析が完了しました`);

    const imageFile = formData.get('image');

    if (!(imageFile instanceof File)) {
      console.warn(`[blogs/upload][${traceId}] imageがFile型ではありません`);
      return Response.json(
        { errors: { error: '画像ファイルを選択してください。' } },
        { status: 400 }
      );
    }
    console.info(
      `[blogs/upload][${traceId}] 画像ファイルを受信しました name=${imageFile.name} type=${imageFile.type} size=${imageFile.size}`
    );

    if (!imageFile.type.startsWith('image/')) {
      console.warn(`[blogs/upload][${traceId}] MIMEタイプが不正です type=${imageFile.type}`);
      return Response.json(
        { errors: { error: '画像ファイルのみアップロードできます。' } },
        { status: 400 }
      );
    }

    if (imageFile.size > MAX_IMAGE_SIZE) {
      console.warn(
        `[blogs/upload][${traceId}] ファイルサイズが上限を超えています size=${imageFile.size} max=${MAX_IMAGE_SIZE}`
      );
      return Response.json(
        { errors: { error: '画像サイズは5MB以下にしてください。' } },
        { status: 400 }
      );
    }
    console.info(`[blogs/upload][${traceId}] saveImageを呼び出します`);
    const imagePath = await saveImage(imageFile, 'blogs/temp', traceId);
    console.info(`[blogs/upload][${traceId}] saveImageの戻り値: ${imagePath ?? 'null'}`);

    if (!imagePath) {
      console.error(`[blogs/upload][${traceId}] 画像保存に失敗しました`);
      return Response.json(
        { errors: { error: '画像の保存に失敗しました。' } },
        { status: 500 }
      );
    }

    console.info(`[blogs/upload][${traceId}] アップロード処理が正常に完了しました`);
    return Response.json({ url: imagePath }, { status: 200 });
  } catch (error) {
    console.error(`[blogs/upload][${traceId}] 予期しないエラーが発生しました`, error);
    return Response.json(
      { errors: { error: 'サーバーエラーが発生しました。' } },
      { status: 500 }
    );
  }
}
