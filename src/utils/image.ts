import { supabase } from '@/lib/supabase';
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// 環境によってローカル保存とsupabase保存を切り替えるようにする
export async function saveImage(file: File, uploadPath: string, traceId?: string): Promise<string | null> {
    const opId = traceId ?? `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const useSupabase = process.env.NEXT_PUBLIC_USE_SUPABASE_STORAGE === 'true';
  console.info(`[image][${opId}] saveImageを開始しました useSupabase=${useSupabase} uploadPath=${uploadPath} file=${file.name} size=${file.size} type=${file.type}`);
    if (useSupabase) {
        return await saveImageToSupabase(file, opId);
    } else {
        return await saveImageToLocal(file, uploadPath, opId);
    }
}

export async function saveImageToLocal(file: File, uploadPath: string, traceId?: string): Promise<string | null> { 
  const opId = traceId ?? `img-local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const buffer = Buffer.from(await file.arrayBuffer()); // バイナリデータをBufferに変換
  const fileName = `${Date.now()}_${file.name}`;  // ファイル名生成 日時_ファイル名
  const uploadDir = path.join(process.cwd(), 'public', uploadPath); // アップロードフォルダ
  try {
    console.info(`[image][${opId}] ローカル保存を開始しました dir=${uploadDir} fileName=${fileName}`);
    // ディレクトリが存在しない場合は作成
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, fileName); // 保存先の完全なファイル名
    await writeFile(filePath, buffer); // 指定パスにファイル(buffer)を書き込む
    const publicPath = path.join('/', uploadPath, fileName);
    console.info(`[image][${opId}] ローカル保存に成功しました path=${publicPath}`);
    return publicPath;  // URLパスを返す
  } catch (error) {
    console.error(`[image][${opId}] ローカル保存でエラーが発生しました`, error);
    return null;
  }
}

async function saveImageToSupabase(file: File, traceId?: string): Promise<string | null> {
  const opId = traceId ?? `img-supabase-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const fileName = `${Date.now()}_${file.name}`;
  console.info(`[image][${opId}] Supabaseアップロードを開始しました bucket=blog_bucket fileName=${fileName}`);
  const { error } = await supabase.storage
    .from('blog_bucket')
    .upload(
      fileName, file, {
        cacheControl: '3600',
        upsert: false,
      }
    ); 
    if (error) {
      console.error(`[image][${opId}] Supabaseアップロードでエラーが発生しました: ${error.message}`); 
      return null;
    }
    const { data: publicUrlData } = supabase.storage
      .from('blog_bucket') 
      .getPublicUrl(fileName); 
    console.info(`[image][${opId}] Supabaseアップロードに成功しました url=${publicUrlData.publicUrl}`);
    return publicUrlData.publicUrl;  
} 