import { supabase } from '@/lib/supabase';
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// 環境によってローカル保存とsupabase保存を切り替えるようにする
export async function saveImage(file: File, uploadPath: string): Promise<string | null> {
    const useSupabase = process.env.NEXT_PUBLIC_USE_SUPABASE_STORAGE === 'true';
    if (useSupabase) {
        return await saveImageToSupabase(file);
    } else {
        return await saveImageToLocal(file, uploadPath);
    }
}

export async function saveImageToLocal(file: File, uploadPath: string): Promise<string | null> { 
  const buffer = Buffer.from(await file.arrayBuffer()); // バイナリデータをBufferに変換
  const fileName = `${Date.now()}_${file.name}`;  // ファイル名生成 日時_ファイル名
  const uploadDir = path.join(process.cwd(), 'public', uploadPath); // アップロードフォルダ
  try {
    // ディレクトリが存在しない場合は作成
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, fileName); // 保存先の完全なファイル名
    await writeFile(filePath, buffer); // 指定パスにファイル(buffer)を書き込む
    return path.join('/', uploadPath, fileName);  // URLパスを返す
  } catch (error) {
    console.error("画像保存エラー:", error);
    return null;
  }
}

async function saveImageToSupabase(file: File): Promise<string | null> {
  const fileName = `${Date.now()}_${file.name}`;
  const { error } = await supabase.storage
    .from('blog_bucket')
    .upload(
      fileName, file, {
        cacheControl: '3600',
        upsert: false,
      }
    ); 
    if (error) {
      console.error('Upload error:', error.message); 
      return null;
    }
    const { data: publicUrlData } = supabase.storage
      .from('blog_bucket') 
      .getPublicUrl(fileName); 
    return publicUrlData.publicUrl;  
} 