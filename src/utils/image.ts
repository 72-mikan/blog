import { supabase } from '@/lib/supabase';
import { writeFile, mkdir, rename, copyFile, unlink } from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const DEFAULT_TEMP_BLOG_IMAGE_PATH = 'blogs/temp';
const DEFAULT_BLOG_IMAGE_PATH = 'blogs';
const DEFAULT_SUPABASE_BUCKET = 'blog_bucket';

function normalizeUploadPath(uploadPath: string): string {
  return uploadPath.replace(/^\/+/, '').replace(/\/+$/, '');
}

function getTempBlogImagePath(): string {
  return normalizeUploadPath(
    process.env.NEXT_PUBLIC_TEMP_BLOG_IMAGE_PATH || DEFAULT_TEMP_BLOG_IMAGE_PATH
  );
}

function getBlogImagePath(): string {
  return normalizeUploadPath(
    process.env.NEXT_PUBLIC_BLOG_IMAGE_PATH || DEFAULT_BLOG_IMAGE_PATH
  );
}

function toAbsoluteAssetPath(uploadPath: string, fileName: string): string {
  return `/${normalizeUploadPath(uploadPath)}/${fileName}`;
}

function toAbsoluteSegmentPath(uploadPath: string): string {
  return `/${normalizeUploadPath(uploadPath)}`;
}

function getSupabaseBucketName(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_BUCKET || DEFAULT_SUPABASE_BUCKET;
}

// 環境によってローカル保存とsupabase保存を切り替えるようにする
export async function saveImage(file: File, uploadPath: string): Promise<string | null> {
    const useSupabase = process.env.NEXT_PUBLIC_USE_SUPABASE_STORAGE === 'true';
    if (useSupabase) {
        return await saveImageToSupabase(file, uploadPath);
    } else {
        return await saveImageToLocal(file, uploadPath);
    }
}

export async function saveImageToLocal(file: File, uploadPath: string): Promise<string | null> { 
  const buffer = Buffer.from(await file.arrayBuffer()); // バイナリデータをBufferに変換
  const fileName = `${Date.now()}_${file.name}`;  // ファイル名生成 日時_ファイル名
  const normalizedUploadPath = normalizeUploadPath(uploadPath);
  const uploadDir = path.join(process.cwd(), 'public', normalizedUploadPath); // アップロードフォルダ
  try {
    // ディレクトリが存在しない場合は作成
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, fileName); // 保存先の完全なファイル名
    await writeFile(filePath, buffer); // 指定パスにファイル(buffer)を書き込む
    return toAbsoluteAssetPath(normalizedUploadPath, fileName);  // URLパスを返す
  } catch (error) {
    console.error("画像保存エラー:", error);
    return null;
  }
}

async function saveImageToSupabase(file: File, uploadPath: string): Promise<string | null> {
  const bucketName = getSupabaseBucketName();
  const normalizedUploadPath = normalizeUploadPath(uploadPath);
  const fileName = `${Date.now()}_${file.name}`;
  const objectPath = `${normalizedUploadPath}/${fileName}`;
  const { error } = await supabase.storage
    .from(bucketName)
    .upload(
      objectPath, file, {
        cacheControl: '3600',
        upsert: false,
      }
    ); 
    if (error) {
      console.error('Upload error:', error.message); 
      return null;
    }
    const { data: publicUrlData } = supabase.storage
      .from(bucketName) 
      .getPublicUrl(objectPath); 
    return publicUrlData.publicUrl;  
}

function extractObjectPathFromUrl(url: string, bucketName: string): string | null {
  try {
    const baseUrl = process.env.URL || 'http://localhost:3000';
    const parsedUrl = new URL(url, baseUrl);
    const marker = `/storage/v1/object/public/${bucketName}/`;
    const markerIndex = parsedUrl.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return normalizeUploadPath(parsedUrl.pathname);
    }

    const objectPath = parsedUrl.pathname.slice(markerIndex + marker.length);
    return normalizeUploadPath(objectPath);
  } catch {
    return null;
  }
}

async function moveLocalFile(sourcePath: string, targetPath: string): Promise<void> {
  try {
    await rename(sourcePath, targetPath);
  } catch {
    await copyFile(sourcePath, targetPath);
    await unlink(sourcePath);
  }
}

async function finalizeLocalTempImage(imageUrl: string, tempPath: string, finalPath: string): Promise<string> {
  const baseUrl = process.env.URL || 'http://localhost:3000';
  const pathname = new URL(imageUrl, baseUrl).pathname;
  const tempSegment = toAbsoluteSegmentPath(tempPath);
  const finalSegment = toAbsoluteSegmentPath(finalPath);

  if (!pathname.startsWith(`${tempSegment}/`)) {
    return imageUrl;
  }

  const targetPathname = pathname.replace(`${tempSegment}/`, `${finalSegment}/`);
  const sourceFilePath = path.join(process.cwd(), 'public', normalizeUploadPath(pathname));
  const targetFilePath = path.join(process.cwd(), 'public', normalizeUploadPath(targetPathname));

  await mkdir(path.dirname(targetFilePath), { recursive: true });
  await moveLocalFile(sourceFilePath, targetFilePath);

  return imageUrl.replace(pathname, targetPathname);
}

async function finalizeSupabaseTempImage(imageUrl: string, tempPath: string, finalPath: string): Promise<string> {
  const bucketName = getSupabaseBucketName();
  const objectPath = extractObjectPathFromUrl(imageUrl, bucketName);

  if (!objectPath || !objectPath.startsWith(`${normalizeUploadPath(tempPath)}/`)) {
    return imageUrl;
  }

  const targetObjectPath = objectPath.replace(
    `${normalizeUploadPath(tempPath)}/`,
    `${normalizeUploadPath(finalPath)}/`
  );

  const { error: copyError } = await supabase.storage
    .from(bucketName)
    .copy(objectPath, targetObjectPath);

  if (copyError) {
    throw new Error(`Supabase画像コピー失敗: ${copyError.message}`);
  }

  const { error: removeError } = await supabase.storage
    .from(bucketName)
    .remove([objectPath]);

  if (removeError) {
    throw new Error(`Supabase一時画像削除失敗: ${removeError.message}`);
  }

  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(targetObjectPath);

  return data.publicUrl;
}

export async function finalizeBlogTempImages(markdown: string): Promise<string> {
  const tempPath = getTempBlogImagePath();
  const finalPath = getBlogImagePath();
  const tempSegment = toAbsoluteSegmentPath(tempPath);
  const markdownImageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
  const imageUrls: string[] = [];
  let match: RegExpExecArray | null = null;

  while ((match = markdownImageRegex.exec(markdown)) !== null) {
    const imageUrl = match[1]?.trim();
    if (imageUrl) {
      imageUrls.push(imageUrl);
    }
  }

  const uniqueImageUrls = [...new Set(imageUrls)];
  let updatedMarkdown = markdown;

  for (const imageUrl of uniqueImageUrls) {
    let updatedUrl = imageUrl;

    if (!imageUrl.includes(tempSegment) && !imageUrl.includes(`${tempPath}/`)) {
      continue;
    }

    if (process.env.NEXT_PUBLIC_USE_SUPABASE_STORAGE === 'true') {
      updatedUrl = await finalizeSupabaseTempImage(imageUrl, tempPath, finalPath);
    } else {
      updatedUrl = await finalizeLocalTempImage(imageUrl, tempPath, finalPath);
    }

    if (updatedUrl !== imageUrl) {
      updatedMarkdown = updatedMarkdown.split(imageUrl).join(updatedUrl);
    }
  }

  return updatedMarkdown;
}