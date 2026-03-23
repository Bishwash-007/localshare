import path from 'node:path';
import sharp from 'sharp';
import ffmpegPath from 'ffmpeg-static';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'node:fs/promises';
export const BASE_PATH = '/Users/bishwashchaudhari/localshare/home';
export const THUMBNAILS_DIR = '/Users/bishwashchaudhari/localshare/thumbnails';

const execFileAsync = promisify(execFile);

export async function generateImageThumbnail(filePath, file, stats, mime) {
  const thumbPath = path.join(THUMBNAILS_DIR, file);
  const properties = await sharp(filePath).metadata();

  await sharp(filePath).resize(200, 200, { fit: 'inside' }).toFile(thumbPath);

  return {
    name: file,
    isFolder: false,
    type: mime,
    ...formatStats(stats),
    width: properties.width,
    height: properties.height,
    previewUrl: thumbPath,
    originalUrl: filePath,
  };
}

export async function generateVideoThumbnail(filePath, file, stats, mime) {
  const thumbPath = path.join(THUMBNAILS_DIR, `${file}.jpg`);

  if (!ffmpegPath) throw new Error('ffmpeg binary not found');

  await execFileAsync(ffmpegPath, [
    '-i', filePath,
    '-ss', '00:00:03.000',
    '-vframes', '1',
    '-y',
    thumbPath,
  ]);

  return {
    name: file,
    isFolder: false,
    type: mime,
    ...formatStats(stats),
    previewUrl: thumbPath,
    originalUrl: filePath,
  };
}

export async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

export function formatStats(stats) {
  return {
    size: stats.size,
    lastModified: stats.mtime ? new Date(stats.mtime).toISOString() : null,
    createdAt: stats.birthtime ? new Date(stats.birthtime).toISOString() : null,
    accessedAt: stats.atime ? new Date(stats.atime).toISOString() : null,
  };
}