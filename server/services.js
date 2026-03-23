import fs from 'node:fs/promises';
import path from 'node:path';
import { fileTypeFromFile } from 'file-type';
import { ensureDir, formatStats, generateImageThumbnail, generateVideoThumbnail, THUMBNAILS_DIR } from './utils.js';

export async function getDirectoryContents(basePath) {
  await ensureDir(THUMBNAILS_DIR);
  const files = await fs.readdir(basePath);
  const content = [];

  for (const file of files) {
    const filePath = path.join(basePath, file);

    try {
      const stats = await fs.stat(filePath);

      if (stats.isDirectory()) {
        content.push({ name: file, isFolder: true, type: 'folder', ...formatStats(stats) });
        continue;
      }

      const type = await fileTypeFromFile(filePath);
      const mime = type?.mime ?? null;

      if (mime?.startsWith('image/')) {
        const entry = await generateImageThumbnail(filePath, file, stats, mime);
        content.push(entry);
        continue;
      }

      if (mime?.startsWith('video/')) {
        const entry = await generateVideoThumbnail(filePath, file, stats, mime);
        content.push(entry);
        continue;
      }

      content.push({
        name: file,
        isFolder: false,
        type: mime ?? 'application/octet-stream',
        ...formatStats(stats),
      });

    } catch (fileErr) {
      console.error(`Skipping "${file}":`, fileErr.message);
      content.push({ name: file, error: fileErr.message });
    }
  }

  return content;
}